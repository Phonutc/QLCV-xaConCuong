/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Tasks } from './components/Tasks';
import { Reports } from './components/Reports';
import Performance from './components/Performance';
import { Personnel } from './components/Personnel';
import { Departments } from './components/Departments';
import { Login } from './components/Login';
import { IntroSlides } from './components/IntroSlides';
import { LaunchCeremony } from './components/LaunchCeremony';
import { Task, User, Report, Reminder, Department, TaskStatus, Notification } from './types';
import { db, auth } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  getDocs,
  where,
  writeBatch,
  getDocFromServer,
  deleteField,
  or
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In dev, we might want to alert if it's a critical logic error
  if (errInfo.error.includes('insufficient permissions')) {
    console.warn(`Permission Denied on ${operationType} ${path}. Check firestore.rules.`);
  }
}

async function testConnection() {
  try {
    // Only call once to verify connection
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    // We ignore other errors (like permission denied on this test path)
  }
}

export default function App() {
  const [user, setUser] = React.useState<User | null>(() => {
    const saved = localStorage.getItem('ubnd_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [authReady, setAuthReady] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(() => {
    return localStorage.getItem('ubnd_active_tab') || 'dashboard';
  });
  
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [taskFilter, setTaskFilter] = React.useState('');
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showIntro, setShowIntro] = React.useState(false);
  const [showCeremony, setShowCeremony] = React.useState(false);
  const [lastModifiedId, setLastModifiedId] = React.useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = React.useState(false);

  // Session Timeout Logic (20 days to avoid 32-bit signed int overflow in setTimeout)
  const TIMEOUT_DURATION = 20 * 24 * 60 * 60 * 1000; 
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (user) {
      timeoutRef.current = setTimeout(() => {
        handleLogout();
        setSessionExpired(true);
      }, TIMEOUT_DURATION);
    }
  }, [user]);

  React.useEffect(() => {
    if (user) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const handleActivity = () => {
        resetTimeout();
      };

      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      resetTimeout();

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [user, resetTimeout]);

  // Clear highlight after 3 seconds
  React.useEffect(() => {
    if (lastModifiedId) {
      const timer = setTimeout(() => setLastModifiedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastModifiedId]);

  // Persist active tab
  React.useEffect(() => {
    localStorage.setItem('ubnd_active_tab', activeTab);
  }, [activeTab]);

  // Show intro slides once for new sessions
  React.useEffect(() => {
    const introSeen = localStorage.getItem('ubnd_intro_seen');
    if (!introSeen && user) {
      setShowIntro(true);
      localStorage.setItem('ubnd_intro_seen', 'true');
    }
  }, [user]);

  // Restore User Session
  React.useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthReady(!!firebaseUser);
      // We rely on local storage for the main user state for custom logins
      // but try to sync with Firebase if logged in with Google
      if (firebaseUser && firebaseUser.email) {
        try {
          const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            handleLogin(userData);
          }
        } catch (error) {
          console.error('Lỗi khôi phục phiên đăng nhập Google:', error);
        }
      }
    });

    return () => unsubAuth();
  }, []);

  const getAutoStatus = (dueDate: string, currentStatus: TaskStatus): TaskStatus => {
    if (currentStatus === 'completed') return 'completed';
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'in-progress';
    return 'pending';
  };

  // Fetch data from Firestore
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Safety hatch: if loading takes more than 10 seconds, stop the spinner
    if (isLoading && user) {
      timeoutId = setTimeout(() => {
        console.warn('Loading safety hatch triggered. Forcing setIsLoading(false)');
        setIsLoading(false);
      }, 10000);
    }

    if (!user) {
      setIsLoading(true); // Reset loading if logged out
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    console.log('Starting Firestore listeners...');

    const tasksQuery = collection(db, 'tasks');

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Task));
      
      setTasks(taskList);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
      setIsLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Department)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'departments');
    });

    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Report)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });

    const notificationsQuery = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubTasks();
      unsubUsers();
      unsubDepts();
      unsubReports();
      unsubNotifications();
    };
  }, [user, authReady, isLoading]);

  // Automated background status update
  React.useEffect(() => {
    if (!isLoading && tasks.length > 0 && user) {
      const tasksWithWrongStatus = tasks.filter(task => {
        const autoStatus = getAutoStatus(task.dueDate, task.status);
        return autoStatus !== task.status;
      });

      if (tasksWithWrongStatus.length > 0) {
        console.log(`[AUTO-STATUS] Phát hiện ${tasksWithWrongStatus.length} công việc sai trạng thái. Đang tự động cập nhật...`);
        tasksWithWrongStatus.forEach(async (task) => {
          const newStatus = getAutoStatus(task.dueDate, task.status);
          try {
            await updateDoc(doc(db, 'tasks', task.id), { status: newStatus });
          } catch (error) {
            console.error(`Lỗi tự động cập nhật trạng thái cho task ${task.id}:`, error);
          }
        });
      }
    }
  }, [tasks.length, isLoading, user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setSessionExpired(false);
    localStorage.setItem('ubnd_user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    console.log('Bắt đầu đăng xuất...');
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất khỏi Firebase:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('ubnd_user');
      console.log('Đã xóa phiên làm việc cục bộ.');
    }
  };

  // Cleanup effect: Triggers when tasks are loaded
  React.useEffect(() => {
    if (!isLoading && tasks.length > 0 && user && (user.role === 'admin' || user.role === 'chairman')) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

      const oldCompletedTasks = tasks.filter(task => {
        if (task.status !== 'completed' || !task.completedAt) return false;
        
        const completedDate = new Date(task.completedAt);
        const compYear = completedDate.getFullYear();
        const compMonth = completedDate.getMonth();

        // If completed in a previous year, it's definitely old
        if (compYear < currentYear) return true;
        // If completed in the current year but a previous month
        if (compYear === currentYear && compMonth < currentMonth) return true;
        
        return false;
      });

      if (oldCompletedTasks.length > 0) {
        console.log(`Phát hiện ${oldCompletedTasks.length} công việc đã hoàn thành từ các tháng trước. Đang tự động xóa...`);
        oldCompletedTasks.forEach(task => {
          handleDeleteTask(task.id, true);
        });
      }
    }
  }, [tasks.length, isLoading, user]);

  const handleAddTask = async (newTask: Partial<Task>) => {
    const dueDate = newTask.dueDate || new Date().toISOString().split('T')[0];
    const id = Math.random().toString(36).substr(2, 9);
    const task: Task = {
      id,
      title: newTask.title || 'Công việc mới',
      description: newTask.description || '',
      assigneeIds: newTask.assigneeIds || (user ? [user.id] : ['1']),
      assignedBy: newTask.assignedBy || user?.id || '1',
      dueDate: dueDate,
      status: getAutoStatus(dueDate, 'pending'),
      priority: newTask.priority || 'medium',
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (newTask.status === 'completed' || getAutoStatus(dueDate, 'pending') === 'completed') {
      task.completedAt = new Date().toISOString().split('T')[0];
    }
    
    try {
      await setDoc(doc(db, 'tasks', id), task);
      setLastModifiedId(id);

      // Create notifications for all assignees if they are not the current user
      if (task.assigneeIds && task.assigneeIds.length > 0) {
        for (const assigneeId of task.assigneeIds) {
          if (assigneeId !== user?.id) {
            await handleCreateNotification({
              userId: assigneeId,
              title: 'Công việc mới được giao',
              content: `Bạn vừa được giao công việc: ${task.title}`,
              taskId: task.id,
              type: 'task_assigned'
            });
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks/' + id);
      alert('Không thể thêm công việc: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const newDueDate = updates.dueDate || task.dueDate;
      const newStatus = updates.status || getAutoStatus(newDueDate, task.status);
      
      const updatedData: any = { ...updates, status: newStatus };
      if (newStatus === 'completed' && task.status !== 'completed') {
        updatedData.completedAt = new Date().toISOString().split('T')[0];
      } else if (newStatus !== 'completed' && task.status === 'completed') {
        // If status was changed back from completed, remove completedAt
        updatedData.completedAt = deleteField();
      }

      await updateDoc(taskRef, updatedData);
      setLastModifiedId(id);

      // --- Enhanced Notification Logic ---
      
      // 1. Handle Reassignment
      if (updates.assigneeIds) {
        const oldAssignees = task.assigneeIds || [];
        const newAssignees = updates.assigneeIds;
        
        // Find newly added assignees
        const addedAssignees = newAssignees.filter(id => !oldAssignees.includes(id));
        // Find removed assignees
        const removedAssignees = oldAssignees.filter(id => !newAssignees.includes(id));

        // Notify new assignees
        for (const assigneeId of addedAssignees) {
          if (assigneeId !== user?.id) {
            await handleCreateNotification({
              userId: assigneeId,
              title: 'Công việc mới được giao',
              content: `Bạn vừa được giao công việc: "${task.title}"`,
              taskId: task.id,
              type: 'task_assigned'
            });
          }
        }

        // Notify removed assignees
        for (const assigneeId of removedAssignees) {
          if (assigneeId !== user?.id) {
            await handleCreateNotification({
              userId: assigneeId,
              title: 'Thay đổi người thực hiện',
              content: `Công việc "${task.title}" của bạn đã được chuyển cho người khác.`,
              taskId: task.id,
              type: 'task_updated'
            });
          }
        }
      }

      // 2. Handle other updates for the relevant parties
      const currentAssigneeIds = updates.assigneeIds || task.assigneeIds || [];
      const currentAssigner = updates.assignedBy || task.assignedBy;
      
      // Notify all current assignees and the assigner if they didn't make the change
      const partiesToNotify = new Set([...currentAssigneeIds, currentAssigner]);
      partiesToNotify.delete(user?.id || '');
      
      if (partiesToNotify.size > 0) {
        const changedFields: string[] = [];
        if (updates.status && updates.status !== task.status) changedFields.push('trạng thái');
        if (updates.priority && updates.priority !== task.priority) changedFields.push('độ ưu tiên');
        if (updates.dueDate && updates.dueDate !== task.dueDate) changedFields.push('hạn xử lý');
        if (updates.title && updates.title !== task.title) changedFields.push('tiêu đề');
        if (updates.description && updates.description !== task.description) changedFields.push('nội dung');

        if (changedFields.length > 0) {
          const isStatusOnly = changedFields.length === 1 && changedFields[0] === 'trạng thái';
          const statusText = newStatus === 'completed' ? 'hoàn thành' : (newStatus === 'in-progress' ? 'đang thực hiện' : 'chờ xử lý');
          
          for (const partyId of partiesToNotify) {
            await handleCreateNotification({
              userId: partyId,
              title: isStatusOnly ? 'Cập nhật trạng thái công việc' : 'Cập nhật thông tin công việc',
              content: isStatusOnly 
                ? `${user?.name} đã cập nhật trạng thái công việc "${task.title}" thành ${statusText}`
                : `${user?.name} đã cập nhật ${changedFields.join(', ')} của công việc "${task.title}"`,
              taskId: task.id,
              type: (updates.status === 'completed') ? 'task_completed' : 'task_updated'
            });
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks/' + id);
    }
  };

  const handleDeleteTask = async (id: string, force: boolean = false) => {
    console.log(`%c[DELETE_FLOW] Bắt đầu xóa ID: ${id}, Force: ${force}`, 'color: white; background: red; font-weight: bold;');
    
    if (!id) {
      console.error('[DELETE_FLOW] ID rỗng!');
      return;
    }

    const task = tasks.find(t => t.id === id);
    if (!task) {
      console.error(`[DELETE_FLOW] Không tìm thấy task trong state local để xóa (ID: ${id})`);
      console.log('Các ID hiện có:', tasks.map(t => t.id));
      return;
    }

    // Kiểm tra quyền trên client (mềm)
    if (!force && task.status !== 'completed' && !(user?.role === 'admin' || user?.role === 'chairman')) {
      alert('Bạn chỉ có thể xóa các công việc đã ở trạng thái "Hoàn thành".');
      return;
    }

    try {
      console.log(`[DELETE_FLOW] Đang thực hiện xóa thực tế trên Firestore cho: "${task.title}"`);
      
      // Optimistic UI update
      setTasks(prev => prev.filter(t => t.id !== id));

      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);
      
      console.log(`%c[DELETE_FLOW] ĐÃ XÓA THÀNH CÔNG TRÊN FIRESTORE: ${id}`, 'color: green; font-weight: bold;');
      
      if (!force) {
        setNotifications(prev => [{
          id: 'temp-' + Date.now(),
          userId: user?.id || '',
          title: 'Đã xóa công việc',
          content: `Công việc "${task.title}" đã được xóa thành công.`,
          type: 'task_updated',
          createdAt: new Date().toISOString(),
          isRead: false
        }, ...prev]);
      }
    } catch (error: any) {
      console.error('%c[DELETE_FLOW] LỖI KHI XÓA TRÊN FIRESTORE:', 'color: red; font-weight: bold;', error);
      
      // Rollback UI
      setTasks(prev => {
        if (prev.find(t => t.id === id)) return prev;
        return [...prev, task];
      });

      if (error.code === 'permission-denied') {
        alert('Lỗi: Bạn không có quyền xóa dữ liệu này. (Firestore Rules Denied)');
      } else {
        alert('Lỗi kỹ thuật khi xóa: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleAddUser = async (newUser: Partial<User>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const userData: User = {
      id,
      username: newUser.username || '',
      password: newUser.password || '123',
      name: newUser.name || '',
      email: newUser.email || '',
      role: newUser.role || 'staff',
      position: newUser.position || '',
      department: newUser.department || '',
      phone: newUser.phone || '',
      birthYear: newUser.birthYear || '',
      gender: newUser.gender || 'Nam',
      hometown: newUser.hometown || '',
    };
    
    try {
      await setDoc(doc(db, 'users', id), userData);
      setLastModifiedId(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users/' + id);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', id), updates);
      setLastModifiedId(id);
      
      if (user && id === user.id) {
        const updatedCurrentUser = { ...user, ...updates };
        setUser(updatedCurrentUser);
        localStorage.setItem('ubnd_user', JSON.stringify(updatedCurrentUser));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/' + id);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'users/' + id);
    }
  };

  const handleAddDepartment = async (newDept: Partial<Department>) => {
    const id = 'd' + Date.now();
    const dept: Department = {
      id,
      name: newDept.name || '',
      headId: newDept.headId || '',
      description: newDept.description || '',
    };
    
    try {
      await setDoc(doc(db, 'departments', id), dept);
      setLastModifiedId(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'departments/' + id);
    }
  };

  const handleUpdateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      await updateDoc(doc(db, 'departments', id), updates);
      setLastModifiedId(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'departments/' + id);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'departments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'departments/' + id);
    }
  };

  // Automated Cleanup: Delete read notifications older than 24h
  React.useEffect(() => {
    if (!isLoading && user && notifications.length > 0) {
      const now = new Date();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      
      const oldReadNotifications = notifications.filter(n => {
        if (!n.isRead) return false;
        const createdDate = new Date(n.createdAt);
        return (now.getTime() - createdDate.getTime()) > ONE_DAY_MS;
      });

      if (oldReadNotifications.length > 0) {
        console.log(`[CLEANUP] Phát hiện ${oldReadNotifications.length} thông báo cũ (>24h). Đang xóa...`);
        oldReadNotifications.forEach(n => {
          handleDeleteNotification(n.id);
        });
      }
    }
  }, [notifications.length, isLoading, user]);

  if (!user) {
    return <Login onLogin={handleLogin} sessionExpired={sessionExpired} />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const handleNavigate = (tab: string, filter?: string) => {
    setActiveTab(tab);
    if (tab === 'tasks' && filter !== undefined) {
      setTaskFilter(filter);
    } else if (tab !== 'tasks') {
      setTaskFilter('');
    }
  };

  const handleCreateNotification = async (data: Partial<Notification>) => {
    if (!data.userId) return;
    
    const id = 'n' + Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      userId: data.userId,
      title: data.title || 'Thông báo mới',
      content: data.content || '',
      taskId: data.taskId,
      type: data.type || 'task_updated',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    try {
      await setDoc(doc(db, 'notifications', id), notification);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications/' + id);
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    // Optimistic local update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

    // If it's a temporary local-only notification, don't try to update Firestore
    if (id.startsWith('temp-')) {
      return;
    }

    try {
      await setDoc(doc(db, 'notifications', id), { isRead: true }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications/' + id);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    // Local update first
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        // Skip temp notifications in batch update to Firestore
        if (!n.id.startsWith('temp-')) {
          batch.set(doc(db, 'notifications', n.id), { isRead: true }, { merge: true });
        }
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications_batch');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notifications/' + id);
    }
  };

  const renderContent = () => {
    if (!user) return null;

    // Hierarchical filtering logic
    const getVisibleTasks = () => {
      if (user.role === 'admin' || user.role === 'chairman') return tasks;
      
      if (user.role === 'vice_chairman') {
        return tasks.filter(t => {
          if (t.assigneeIds && t.assigneeIds.includes(user.id)) return true;
          // Vice chairman sees Head, Deputy Head, and Staff
          return t.assigneeIds && t.assigneeIds.some(assigneeId => {
            const assignee = users.find(u => u.id === assigneeId);
            return assignee && ['head', 'deputy_head', 'staff'].includes(assignee.role);
          });
        });
      }

      if (user.role === 'head') {
        return tasks.filter(t => {
          if (t.assigneeIds && t.assigneeIds.includes(user.id)) return true;
          // Head sees Deputy Head and Staff in their department
          return t.assigneeIds && t.assigneeIds.some(assigneeId => {
            const assignee = users.find(u => u.id === assigneeId);
            return assignee && assignee.department === user.department && ['deputy_head', 'staff'].includes(assignee.role);
          });
        });
      }

      if (user.role === 'deputy_head') {
        return tasks.filter(t => {
          if (t.assigneeIds && t.assigneeIds.includes(user.id)) return true;
          // Deputy Head sees Staff in their department
          return t.assigneeIds && t.assigneeIds.some(assigneeId => {
            const assignee = users.find(u => u.id === assigneeId);
            return assignee && assignee.department === user.department && assignee.role === 'staff';
          });
        });
      }

      // Staff only see their own tasks
      return tasks.filter(t => t.assigneeIds && t.assigneeIds.includes(user.id));
    };

    const getVisibleUsers = () => {
      // Only the admin account can see everyone (including itself)
      if (user.role === 'admin') return users;
      
      // All other accounts (Chairman, Vice Chairman, etc.) see everyone EXCEPT the admin account
      return users.filter(u => u.role !== 'admin');
    };

    const visibleTasks = getVisibleTasks();
    const visibleUsers = getVisibleUsers();

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={visibleTasks} staff={visibleUsers} departments={departments} onNavigate={handleNavigate} />;
      case 'tasks':
        return (
          <Tasks 
            tasks={visibleTasks} 
            staff={visibleUsers} 
            currentUser={user}
            lastModifiedId={lastModifiedId}
            initialFilter={taskFilter}
            onAddTask={handleAddTask} 
            onUpdateTask={handleUpdateTask} 
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'reports':
        return <Reports tasks={visibleTasks} staff={visibleUsers} departments={departments} />;
      case 'personnel':
        return (
          <Personnel 
            staff={visibleUsers} 
            departments={departments}
            currentUser={user}
            lastModifiedId={lastModifiedId}
            onAddUser={handleAddUser} 
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'departments':
        return (
          <Departments 
            departments={departments} 
            users={visibleUsers} 
            currentUser={user}
            lastModifiedId={lastModifiedId}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        );
      case 'performance':
        return <Performance tasks={tasks} users={users} currentUser={user} />;
      default:
        return <Dashboard tasks={visibleTasks} staff={users} departments={departments} onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout} 
      user={user}
      notifications={notifications}
      onMarkNotificationAsRead={handleMarkNotificationAsRead}
      onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      onNavigateToTask={(taskId) => {
        handleNavigate('tasks', '');
        setLastModifiedId(taskId);
      }}
      onUpdateProfile={(updates) => user && handleUpdateUser(user.id, updates)}
      onShowIntro={() => setShowIntro(true)}
      onShowCeremony={() => setShowCeremony(true)}
    >
      {renderContent()}
      {showIntro && <IntroSlides onClose={() => setShowIntro(false)} />}
      {showCeremony && (
        <LaunchCeremony 
          onComplete={() => {
            setShowCeremony(false);
            setShowIntro(true);
          }} 
          onClose={() => setShowCeremony(false)} 
        />
      )}
    </Layout>
  );
}

