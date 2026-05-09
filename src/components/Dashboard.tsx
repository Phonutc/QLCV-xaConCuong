import * as React from 'react';
import { 
  Users, 
  Building2, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { User, Task, Department } from '../types';
import { cn } from '@/lib/utils';

interface DashboardProps {
  tasks: Task[];
  staff: User[];
  departments: Department[];
  onNavigate: (tab: string, filter?: string) => void;
}

export function Dashboard({ tasks, staff, departments, onNavigate }: DashboardProps) {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const stats = [
    { 
      label: 'Nhân sự', 
      value: staff.length, 
      sub: 'Đang làm việc', 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      tab: 'personnel',
      filter: ''
    },
    { 
      label: 'Phòng ban', 
      value: departments.length, 
      sub: 'Phòng ban', 
      icon: Building2, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      tab: 'departments',
      filter: ''
    },
    { 
      label: 'Công việc', 
      value: tasks.filter(t => t.status === 'in-progress').length, 
      sub: 'Đang thực hiện', 
      icon: CheckSquare, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      tab: 'tasks',
      filter: 'đang thực hiện'
    },
    { 
      label: 'Hoàn thành', 
      value: tasks.filter(t => t.status === 'completed').length, 
      sub: 'Tổng cộng', 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      tab: 'tasks',
      filter: 'hoàn thành'
    },
    { 
      label: 'Quá hạn', 
      value: tasks.filter(t => t.status === 'overdue').length, 
      sub: 'Cần xử lý', 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      tab: 'tasks',
      filter: 'quá hạn'
    },
  ];

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Hoàn thành</Badge>;
      case 'in-progress': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Đang thực hiện</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Quá hạn</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">Chưa bắt đầu</Badge>;
    }
  };

  const getPriorityBadge = (priority: string, status?: string) => {
    if (status === 'completed') return null;
    switch (priority) {
      case 'urgent': return <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-50 border-none text-[10px] uppercase tracking-wider">Khẩn cấp</Badge>;
      case 'high': return <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 border-none text-[10px] uppercase tracking-wider">Cao</Badge>;
      case 'medium': return <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none text-[10px] uppercase tracking-wider">Trung bình</Badge>;
      default: return <Badge className="bg-slate-50 text-slate-600 hover:bg-slate-50 border-none text-[10px] uppercase tracking-wider">Thấp</Badge>;
    }
  };

  const getDaysRemaining = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return <Badge variant="destructive">Quá hạn</Badge>;
    if (days === 0) return <span className="text-amber-600 font-medium">Hôm nay</span>;
    return <span className="text-slate-600 font-medium">Còn {days} ngày</span>;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 font-heading">UBND XÃ CON CUÔNG</h1>
        <p className="text-slate-500 font-medium tracking-wide">Hệ thống chuyển đổi số & quản trị điều hành cán bộ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="border-none shadow-sm ring-1 ring-slate-200 cursor-pointer hover:ring-blue-400 hover:shadow-md transition-all group"
            onClick={() => onNavigate(stat.tab, stat.filter)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stat.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CheckSquare className="text-blue-600" size={20} />
              Công việc gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors whitespace-normal break-words">{task.title}</p>
                    <p className="text-xs text-slate-500">Hạn: {task.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority, task.status)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="text-blue-600" size={20} />
              Sắp đến hạn
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors whitespace-normal break-words">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.dueDate}</p>
                  </div>
                  <div className="text-xs">
                    {getDaysRemaining(task.dueDate)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Chi tiết công việc</DialogTitle>
            <DialogDescription>Thông tin chi tiết về nhiệm vụ được giao</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6 py-4">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tiêu đề</p>
                  <p className="text-lg font-bold text-slate-900 whitespace-normal break-words leading-snug">{selectedTask.title}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mô tả</p>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedTask.description || 'Không có mô tả'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hạn chót</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Clock size={14} className="text-blue-600" />
                      {selectedTask.dueDate}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</p>
                    <div>{getStatusBadge(selectedTask.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Độ ưu tiên</p>
                    <div>{getPriorityBadge(selectedTask.priority, selectedTask.status)}</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Người thực hiện</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selectedTask.assigneeIds || []).map(id => (
                        <Badge key={id} variant="secondary" className="text-[10px] font-normal">
                          {staff.find(s => s.id === id)?.name || 'Không xác định'}
                        </Badge>
                      ))}
                      {(selectedTask.assigneeIds || []).length === 0 && <span className="text-xs text-slate-400 italic">Chưa phân công</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
