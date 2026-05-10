export type UserRole = 'admin' | 'chairman' | 'vice_chairman' | 'head' | 'deputy_head' | 'staff';

export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string;
  name: string;
  role: UserRole;
  position: string;
  department: string;
  phone?: string;
  avatarUrl?: string;
  birthYear?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  hometown?: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeIds: string[]; // User IDs
  mainAssigneeId?: string; // ID of the primary person responsible
  assignedBy: string; // User ID
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  completedAt?: string;
  checklist?: ChecklistItem[];
}

export interface Report {
  id: string;
  title: string;
  content: string;
  author: string; // User ID
  date: string;
  type: 'daily' | 'weekly' | 'monthly' | 'incident';
}

export interface Department {
  id: string;
  name: string;
  headId: string; // User ID
  description: string;
}

export interface Reminder {
  id: string;
  content: string;
  date: string;
  isRead: boolean;
  userId: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  taskId?: string;
  createdAt: string;
  isRead: boolean;
  type: 'task_assigned' | 'task_updated' | 'task_completed';
}
