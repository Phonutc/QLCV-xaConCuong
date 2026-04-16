export type UserRole = 'admin' | 'chairman' | 'vice_chairman' | 'head' | 'deputy_head' | 'staff';

export interface User {
  id: string;
  username: string;
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

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
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
