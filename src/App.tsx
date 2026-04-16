/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Tasks } from './components/Tasks';
import { Reports } from './components/Reports';
import { Personnel } from './components/Personnel';
import { Departments } from './components/Departments';
import { Login } from './components/Login';
import { Task, User, Report, Reminder, Department, TaskStatus } from './types';
import { db, auth } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = React.useState<User | null>(() => {
    const saved = localStorage.getItem('ubnd_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = React.useState(() => {
    return localStorage.getItem('ubnd_active_tab') || 'dashboard';
  });
  
  const [taskFilter, setTaskFilter] = React.useState('');
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [lastModifiedId, setLastModifiedId] = React.useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = React.useState(false);

  // Session Timeout Logic (30 minutes)
  const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
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
    if (!user) return;

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const taskList = snapshot.docs.map(doc => doc.data() as Task);
      const updatedTasks = taskList.map(t => ({
        ...t,
        status: getAutoStatus(t.dueDate, t.status)
      }));
      setTasks(updatedTasks);
      setIsLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as User));
    });

    const unsubDepts = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => doc.data() as Department));
    });

    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      setReports(snapshot.docs.map(doc => doc.data() as Report));
    });

    return () => {
      unsubTasks();
      unsubUsers();
      unsubDepts();
      unsubReports();
    };
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setSessionExpired(false);
    localStorage.setItem('ubnd_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ubnd_user');
  };

  const handleAddTask = async (newTask: Partial<Task>) => {
    const dueDate = newTask.dueDate || new Date().toISOString().split('T')[0];
    const id = Math.random().toString(36).substr(2, 9);
    const task: Task = {
      id,
      title: newTask.title || 'Công việc mới',
      description: newTask.description || '',
      assignedTo: newTask.assignedTo || user?.id || '1',
      assignedBy: newTask.assignedBy || user?.id || '1',
      dueDate: dueDate,
      status: getAutoStatus(dueDate, 'pending'),
      priority: newTask.priority || 'medium',
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    try {
      await setDoc(doc(db, 'tasks', id), task);
      setLastModifiedId(id);
    } catch (error) {
      console.error('Lỗi khi thêm công việc:', error);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const newDueDate = updates.dueDate || task.dueDate;
      const newStatus = updates.status || getAutoStatus(newDueDate, task.status);
      
      await updateDoc(taskRef, { ...updates, status: newStatus });
      setLastModifiedId(id);
    } catch (error) {
      console.error('Lỗi khi cập nhật công việc:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error('Lỗi khi xóa công việc:', error);
    }
  };

  const handleAddUser = async (newUser: Partial<User>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const userData: User = {
      id,
      username: newUser.username || '',
      password: newUser.password || '123',
      name: newUser.name || '',
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
      console.error('Lỗi khi thêm nhân sự:', error);
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
      console.error('Lỗi khi cập nhật nhân sự:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      console.error('Lỗi khi xóa nhân sự:', error);
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
      console.error('Lỗi khi thêm phòng ban:', error);
    }
  };

  const handleUpdateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      await updateDoc(doc(db, 'departments', id), updates);
      setLastModifiedId(id);
    } catch (error) {
      console.error('Lỗi khi cập nhật phòng ban:', error);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'departments', id));
    } catch (error) {
      console.error('Lỗi khi xóa phòng ban:', error);
    }
  };

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

  const renderContent = () => {
    if (!user) return null;

    // Hierarchical filtering logic
    const getVisibleTasks = () => {
      if (user.role === 'admin' || user.role === 'chairman') return tasks;
      
      if (user.role === 'vice_chairman') {
        return tasks.filter(t => {
          if (t.assignedTo === user.id) return true;
          const assignee = users.find(u => u.id === t.assignedTo);
          // Vice chairman sees Head, Deputy Head, and Staff
          return assignee && ['head', 'deputy_head', 'staff'].includes(assignee.role);
        });
      }

      if (user.role === 'head') {
        return tasks.filter(t => {
          if (t.assignedTo === user.id) return true;
          const assignee = users.find(u => u.id === t.assignedTo);
          // Head sees Deputy Head and Staff in their department
          return assignee && assignee.department === user.department && ['deputy_head', 'staff'].includes(assignee.role);
        });
      }

      if (user.role === 'deputy_head') {
        return tasks.filter(t => {
          if (t.assignedTo === user.id) return true;
          const assignee = users.find(u => u.id === t.assignedTo);
          // Deputy Head sees Staff in their department
          return assignee && assignee.department === user.department && assignee.role === 'staff';
        });
      }

      // Staff only see their own tasks
      return tasks.filter(t => t.assignedTo === user.id);
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
            lastModifiedId={lastModifiedId}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        );
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
      onUpdateProfile={(updates) => user && handleUpdateUser(user.id, updates)}
    >
      {renderContent()}
    </Layout>
  );
}

