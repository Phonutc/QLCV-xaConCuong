import { Task, Report, User, Reminder, Department } from './types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Văn phòng UBND', headId: '1', description: 'Phòng hành chính tổng hợp' },
  { id: 'd2', name: 'Tư pháp - Hộ tịch', headId: '2', description: 'Quản lý tư pháp và hộ tịch' },
  { id: 'd3', name: 'Địa chính - Xây dựng', headId: '3', description: 'Quản lý đất đai và xây dựng' },
  { id: 'd4', name: 'Văn hóa - Xã hội', headId: '4', description: 'Quản lý văn hóa, thể thao và xã hội' },
  { id: 'd5', name: 'Tài chính - Kế toán', headId: '5', description: 'Quản lý tài chính ngân sách xã' },
];

export const INITIAL_STAFF: User[] = [
  { id: '1', username: 'admin', email: 'Phon96.UTC@gmail.com', name: 'Nguyễn Văn An', position: 'Chủ tịch', department: 'Lãnh đạo', role: 'admin' },
  { id: '2', username: 'canbo1', email: '', name: 'Trần Thị Bình', position: 'Phó Chủ tịch', department: 'Lãnh đạo', role: 'staff' },
  { id: '3', username: 'canbo2', name: 'Lê Văn Cường', position: 'Cán bộ Địa chính', department: 'Địa chính - Xây dựng', role: 'staff' },
  { id: '4', username: 'canbo3', name: 'Phạm Thị Dung', position: 'Cán bộ Tư pháp', department: 'Tư pháp - Hộ tịch', role: 'staff' },
  { id: '5', username: 'canbo4', name: 'Hoàng Văn Em', position: 'Cán bộ Văn hóa', department: 'Văn hóa - Xã hội', role: 'staff' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Chuẩn bị họp Hội đồng nhân dân',
    description: 'Soạn thảo báo cáo tình hình kinh tế xã hội quý 1.',
    assigneeIds: ['1'],
    assignedBy: '1',
    dueDate: '2026-04-15',
    status: 'in-progress',
    priority: 'urgent',
    createdAt: '2026-04-10',
  },
  {
    id: 't2',
    title: 'Kiểm tra công tác tiêm chủng',
    description: 'Phối hợp với Trạm y tế kiểm tra tiến độ tiêm chủng mở rộng.',
    assigneeIds: ['5'],
    assignedBy: '1',
    dueDate: '2026-04-13',
    status: 'pending',
    priority: 'high',
    createdAt: '2026-04-11',
  },
  {
    id: 't3',
    title: 'Xử lý hồ sơ đất đai tồn đọng',
    description: 'Giải quyết 5 hồ sơ xin cấp GCN QSDĐ tại thôn A.',
    assigneeIds: ['3'],
    assignedBy: '1',
    dueDate: '2026-04-20',
    status: 'pending',
    priority: 'medium',
    createdAt: '2026-04-12',
  },
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'r1',
    title: 'Báo cáo tuần 2 tháng 4',
    content: 'Tình hình an ninh trật tự ổn định. Đã hoàn thành 80% kế hoạch thu ngân sách.',
    author: '2',
    date: '2026-04-11',
    type: 'weekly',
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  { id: 'rem1', content: 'Họp giao ban sáng thứ Hai lúc 8:00', date: '2026-04-13', isRead: false, userId: '1' },
  { id: 'rem2', content: 'Hạn cuối nộp báo cáo tháng là ngày 25', date: '2026-04-25', isRead: false, userId: '1' },
];
