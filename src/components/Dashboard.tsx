import * as React from 'react';
import { 
  Users, 
  Building2, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  ListTodo,
  Trash2,
  Plus
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from 'lucide-react';
import { User, Task, Department, ChecklistItem, TaskStatus } from '../types';
import { cn } from '@/lib/utils';

interface DashboardProps {
  tasks: Task[];
  staff: User[];
  departments: Department[];
  currentUser: User | null;
  onNavigate: (tab: string, filter?: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

export function Dashboard({ tasks, staff, departments, currentUser, onNavigate, onUpdateTask }: DashboardProps) {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  
  // Full edit state
  const [editTitle, setEditTitle] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editDueDate, setEditDueDate] = React.useState('');
  const [editPriority, setEditPriority] = React.useState<string>('medium');
  const [editAssigneeIds, setEditAssigneeIds] = React.useState<string[]>([]);
  const [editMainAssigneeId, setEditMainAssigneeId] = React.useState<string>('');

  const [reportChecklist, setReportChecklist] = React.useState<ChecklistItem[]>([]);
  const [reportNewItem, setReportNewItem] = React.useState('');
  const [reportStatus, setReportStatus] = React.useState<TaskStatus>('pending');

  React.useEffect(() => {
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditDescription(selectedTask.description || '');
      setEditDueDate(selectedTask.dueDate);
      setEditPriority(selectedTask.priority);
      setEditAssigneeIds(selectedTask.assigneeIds || []);
      setEditMainAssigneeId(selectedTask.mainAssigneeId || '');

      setReportChecklist(selectedTask.checklist || []);
      setReportStatus(selectedTask.status);
      setReportNewItem('');
    }
  }, [selectedTask]);

  const canFullEdit = (task: Task) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'chairman') return true;
    if (task.assignedBy === currentUser.id) return true;
    return false;
  };

  const canReport = (task: Task) => {
    if (!currentUser) return false;
    if (canFullEdit(task)) return true;
    if (task.assigneeIds?.includes(currentUser.id)) return true;
    return false;
  };

  const isFullEditable = selectedTask ? canFullEdit(selectedTask) : false;
  const isReportable = selectedTask ? canReport(selectedTask) : false;
  const isCollaboratorManager = selectedTask ? (
    !isFullEditable && 
    selectedTask.mainAssigneeId === currentUser?.id && 
    ['admin', 'chairman', 'vice_chairman', 'head', 'deputy_head'].includes(currentUser?.role || '')
  ) : false;

  const managementStaffList = React.useMemo(() => {
    if (!currentUser) return [];
    if (['admin', 'chairman', 'vice_chairman'].includes(currentUser.role)) {
      return staff.filter(s => s.id !== currentUser.id);
    }
    if (currentUser.role === 'head') {
      return staff.filter(s => 
        s.department === currentUser.department && 
        (s.role === 'deputy_head' || s.role === 'staff') &&
        s.id !== currentUser.id
      );
    }
    if (currentUser.role === 'deputy_head') {
      return staff.filter(s => 
        s.department === currentUser.department && 
        s.role === 'staff' &&
        s.id !== currentUser.id
      );
    }
    return [];
  }, [staff, currentUser]);

  const handleSaveReport = () => {
    if (!selectedTask) return;
    
    let newStatus = reportStatus;
    // Logic for auto-calculating status if checklist items exist
    if (reportChecklist.length > 0) {
      const allCompleted = reportChecklist.every(item => item.completed);
      const someCompleted = reportChecklist.some(item => item.completed);

      if (allCompleted) {
        newStatus = 'completed';
      } else if (newStatus === 'completed') {
        newStatus = 'in-progress';
      } else if (someCompleted && (newStatus === 'pending' || newStatus === 'overdue')) {
        newStatus = 'in-progress';
      }
    }

    onUpdateTask(selectedTask.id, { 
      checklist: reportChecklist,
      status: newStatus as TaskStatus,
      ...(isCollaboratorManager && {
        assigneeIds: editAssigneeIds,
      }),
      ...(isFullEditable && {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
        priority: editPriority as any,
        assigneeIds: editAssigneeIds,
        mainAssigneeId: editMainAssigneeId
      })
    });
    setSelectedTask(null);
  };

  const addReportItem = () => {
    if (!reportNewItem.trim()) return;
    const item: ChecklistItem = {
      id: Math.random().toString(36).substring(2, 11),
      title: reportNewItem.trim(),
      completed: false
    };
    setReportChecklist([...reportChecklist, item]);
    setReportNewItem('');
  };

  const toggleReportItem = (id: string) => {
    setReportChecklist(reportChecklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeReportItem = (id: string) => {
    setReportChecklist(reportChecklist.filter(item => item.id !== id));
  };

  const toggleEditUser = (userId: string) => {
    const newValue = editAssigneeIds.includes(userId)
      ? editAssigneeIds.filter(id => id !== userId)
      : [...editAssigneeIds, userId];
    setEditAssigneeIds(newValue);
    if (newValue.length === 1) setEditMainAssigneeId(newValue[0]);
    if (newValue.length === 0) setEditMainAssigneeId('');
    if (newValue.length > 0 && !newValue.includes(editMainAssigneeId)) setEditMainAssigneeId(newValue[0]);
  };

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
      label: 'Tổng việc', 
      value: tasks.length, 
      sub: 'Tất cả nhiệm vụ', 
      icon: CheckSquare, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      tab: 'tasks',
      filter: ''
    },
    { 
      label: 'Đang làm', 
      value: tasks.filter(t => t.status === 'in-progress' || t.status === 'pending').length, 
      sub: 'Cần thực hiện', 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      tab: 'tasks',
      filter: 'đang thực hiện'
    },
    { 
      label: 'Hoàn thành', 
      value: tasks.filter(t => t.status === 'completed').length, 
      sub: 'Đúng tiến độ', 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      tab: 'tasks',
      filter: 'hoàn thành'
    },
    { 
      label: 'Quá hạn', 
      value: tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0))).length, 
      sub: 'Chậm tiến độ', 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      tab: 'tasks',
      filter: 'quá hạn'
    },
  ];

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const upcomingTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'overdue' && new Date(t.dueDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string, dueDate?: string) => {
    const isOverdue = dueDate && status !== 'completed' && new Date(dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
    
    if (status === 'completed') return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Hoàn thành</Badge>;
    if (status === 'overdue' || isOverdue) return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Quá hạn</Badge>;
    if (status === 'in-progress') return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Đang thực hiện</Badge>;
    return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">Chưa bắt đầu</Badge>;
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

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="border-none shadow-sm ring-1 ring-slate-200 cursor-pointer hover-lift group"
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
        <Card className="border-none shadow-sm ring-1 ring-slate-200 hover-lift">
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
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] mt-1 uppercase tracking-tight">
                      <ListTodo size={12} strokeWidth={3} />
                      <span>{(task.checklist || []).filter(i => i.completed).length}/{(task.checklist || []).length} mục báo cáo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority, task.status)}
                    {getStatusBadge(task.status, task.dueDate)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200 mt-0 hover-lift">
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
                    <p className="text-xs text-slate-500 font-medium">{task.dueDate}</p>
                    <div className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] mt-1 uppercase tracking-tight">
                      <ListTodo size={12} strokeWidth={3} />
                      <span>{(task.checklist || []).filter(i => i.completed).length}/{(task.checklist || []).length} mục báo cáo</span>
                    </div>
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
        <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl p-0 border-none">
          {selectedTask && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <DialogTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Chi tiết công việc
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 font-medium">
                    Thông tin chi tiết về nhiệm vụ được giao
                  </DialogDescription>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Title and Description */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Tiêu đề công việc</Label>
                    {isFullEditable ? (
                      <Input 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-xl font-bold text-slate-900 border-slate-200 focus:ring-blue-500 rounded-2xl h-12 shadow-sm"
                      />
                    ) : (
                      <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{selectedTask.title}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Mô tả chi tiết</Label>
                    {isFullEditable ? (
                      <Textarea 
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 text-sm text-slate-700 leading-relaxed font-semibold resize-none min-h-[120px] focus-visible:ring-blue-500 shadow-inner"
                        placeholder="Nhập mô tả chi tiết nhiệm vụ..."
                      />
                    ) : (
                      <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 shadow-inner">
                        <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                          {selectedTask.description || 'Không có mô tả chi tiết'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Due Date and Status */}
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Hạn chót</Label>
                    {isFullEditable ? (
                      <Input 
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="rounded-2xl border-slate-200 h-12 w-full font-bold text-blue-600 bg-white shadow-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-2.5 text-sm font-black text-blue-700 bg-blue-50/80 px-4 py-3 rounded-2xl border border-blue-100/80 w-fit shadow-sm">
                        <Clock size={16} className="text-blue-500" />
                        {selectedTask.dueDate}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Độ ưu tiên</Label>
                    <div className="flex items-center pt-1">
                      {isFullEditable ? (
                        <Select value={editPriority} onValueChange={setEditPriority}>
                          <SelectTrigger className="rounded-2xl h-11 border-slate-200 bg-white font-bold text-slate-700 shadow-sm">
                            <SelectValue>
                              {editPriority === 'urgent' ? "Khẩn cấp" : 
                               editPriority === 'high' ? "Cao" : 
                               editPriority === 'medium' ? "Trung bình" : "Thấp"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="low" className="font-bold">Thấp</SelectItem>
                            <SelectItem value="medium" className="font-bold text-blue-600">Trung bình</SelectItem>
                            <SelectItem value="high" className="font-bold text-orange-600">Cao</SelectItem>
                            <SelectItem value="urgent" className="font-bold text-red-600">Khẩn cấp</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getPriorityBadge(selectedTask.priority, selectedTask.status)
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Section */}
                <div className="space-y-4">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Thực hiện nhiệm vụ</Label>
                  
                  {isFullEditable ? (
                    <div className="space-y-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between font-bold h-12 py-2 px-4 bg-white border-slate-200 hover:bg-slate-50 transition-all rounded-2xl shadow-sm text-sm"
                          >
                            <div className="flex flex-wrap gap-1 items-center truncate">
                              {editAssigneeIds.length > 0 ? (
                                `${editAssigneeIds.length} nhân sự tham gia`
                              ) : (
                                <span className="text-slate-400 italic">Chọn nhân sự thực hiện...</span>
                              )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40 text-blue-600" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
                          <Command>
                            <CommandInput placeholder="Tìm kiếm nhân sự..." className="h-11" />
                            <CommandList className="max-h-64 custom-scrollbar">
                              <CommandEmpty>Không tìm thấy nhân sự.</CommandEmpty>
                              <CommandGroup>
                                {staff.map((s) => (
                                  <CommandItem
                                    key={s.id}
                                    value={s.name}
                                    onSelect={() => toggleEditUser(s.id)}
                                    className="rounded-lg m-1 p-2 font-bold"
                                  >
                                    <div className={cn(
                                      "mr-3 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                                      editAssigneeIds.includes(s.id) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 bg-white"
                                    )}>
                                      {editAssigneeIds.includes(s.id) && <Check className="h-4 w-4" strokeWidth={3} />}
                                    </div>
                                    <span className="text-sm">{s.name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {editAssigneeIds.map(id => {
                          const s = staff.find(sm => sm.id === id);
                          const isMain = id === editMainAssigneeId;
                          return (
                            <div key={id} className={cn(
                              "flex items-center justify-between p-3 rounded-2xl border transition-all",
                              isMain ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-100 shadow-xs"
                            )}>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white",
                                  isMain ? "bg-blue-600" : "bg-slate-300"
                                )}>
                                  {s?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span className="text-[11px] font-black text-slate-700 truncate max-w-[120px]">{s?.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditMainAssigneeId(id)}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black transition-all uppercase tracking-tighter shadow-sm",
                                  isMain ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                )}
                              >
                                {isMain ? 'CHỦ TRÌ' : 'PHỐI HỢP'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : isCollaboratorManager ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500">Giám đốc/Phó phòng: Quyền bổ sung người phối hợp</p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button size="sm" variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-bold gap-2">
                              <Plus size={14} />
                              Bổ sung người phối hợp
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-slate-100" align="end">
                            <Command>
                              <CommandInput placeholder="Tìm cấp dưới..." className="h-11" />
                              <CommandList className="max-h-64 custom-scrollbar">
                                <CommandEmpty>Không tìm thấy nhân sự phù hợp.</CommandEmpty>
                                <CommandGroup heading="Danh sách cấp dưới">
                                  {managementStaffList.map((s) => (
                                    <CommandItem
                                      key={s.id}
                                      value={s.name}
                                      onSelect={() => toggleEditUser(s.id)}
                                      className="rounded-lg m-1 p-2 font-bold"
                                    >
                                      <div className={cn(
                                        "mr-3 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                                        editAssigneeIds.includes(s.id) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 bg-white"
                                      )}>
                                        {editAssigneeIds.includes(s.id) && <Check className="h-4 w-4" strokeWidth={3} />}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm">{s.name}</span>
                                        <span className="text-[10px] text-slate-400">{s.position}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {editAssigneeIds.map(id => {
                          const s = staff.find(sm => sm.id === id);
                          const isMain = id === editMainAssigneeId;
                          return (
                            <div key={id} className={cn(
                              "flex items-center justify-between p-3 rounded-2xl border transition-all",
                              isMain ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-slate-100 shadow-xs"
                            )}>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white",
                                  isMain ? "bg-blue-600" : "bg-slate-300"
                                )}>
                                  {s?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <span className="text-[11px] font-black text-slate-700 truncate max-w-[120px]">{s?.name}</span>
                              </div>
                              <div className={cn(
                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter",
                                isMain ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                              )}>
                                {isMain ? 'CHỦ TRÌ' : 'PHỐI HỢP'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Separate Main (Chủ trì) and Participants (Phối hợp) */}
                      <div className="space-y-3">
                        {(selectedTask.assigneeIds || []).filter(id => id === selectedTask.mainAssigneeId).map(id => {
                          const s = staff.find(staffMember => staffMember.id === id);
                          return (
                            <div key={id} className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/80 border border-blue-100 shadow-sm transition-all hover:shadow-md">
                              <div className="h-10 w-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center text-xs font-black text-white shrink-0">
                                {s?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                  CHỦ TRÌ
                                </p>
                                <p className="text-base font-black text-slate-800 truncate leading-none">
                                  {s?.name || 'Không xác định'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {(selectedTask.assigneeIds || []).filter(id => id !== selectedTask.mainAssigneeId).map(id => {
                          const s = staff.find(sm => sm.id === id);
                          return (
                            <div key={id} className="flex items-center gap-2.5 p-2 pr-4 rounded-2xl bg-slate-50 border border-slate-100/80 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                              <div className="h-8 w-8 rounded-xl bg-slate-300 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                {s?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                                  PHỐI HỢP
                                </p>
                                <p className="text-xs font-bold text-slate-700 truncate leading-none">
                                  {s?.name}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assigner */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-white">
                    <Users size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] block leading-none">Người giao nhiệm vụ</Label>
                    <p className="text-base font-black text-slate-800">
                      {staff.find(s => s.id === selectedTask.assignedBy)?.name || 'Chưa định danh'}
                    </p>
                  </div>
                </div>

                {/* Progress and Checklist Section */}
                <div className="pt-8 border-t border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                        <ListTodo size={18} strokeWidth={2.5} />
                      </div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                        BÁO CÁO CHI TIẾT ({reportChecklist.filter(i => i.completed).length}/{reportChecklist.length} MỤC)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-blue-600 tracking-widest uppercase mb-1">
                        TIẾN ĐỘ: {reportChecklist.length > 0 ? Math.round((reportChecklist.filter(i => i.completed).length / reportChecklist.length) * 100) : 0}%
                      </p>
                      <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-700 shadow-lg shadow-blue-200"
                          style={{ width: `${reportChecklist.length > 0 ? Math.round((reportChecklist.filter(i => i.completed).length / reportChecklist.length) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Thêm hạng mục công việc mới..."
                        value={reportNewItem}
                        onChange={(e) => setReportNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addReportItem()}
                        disabled={!isReportable}
                        className="rounded-2xl border-slate-200 h-12 text-sm font-bold focus-visible:ring-blue-500 shadow-sm py-4 px-5"
                      />
                      <Button 
                        onClick={addReportItem} 
                        disabled={!isReportable}
                        className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-8 h-12 font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
                      >
                        THÊM
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar p-1">
                      {reportChecklist.map((item) => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border transition-all group relative",
                            item.completed 
                              ? "bg-slate-50/50 border-slate-100" 
                              : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50/50"
                          )}
                        >
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => toggleReportItem(item.id)}
                            disabled={!isReportable}
                            className="h-6 w-6 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all shadow-sm"
                          />
                          <span className={cn(
                            "flex-1 text-sm font-bold tracking-tight",
                            item.completed ? "text-slate-400 line-through font-semibold" : "text-slate-700"
                          )}>
                            {item.title}
                          </span>
                          {isReportable && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              onClick={() => removeReportItem(item.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Update & Save */}
                <div className="grid grid-cols-2 gap-6 items-end pt-8">
                  <div className="space-y-3">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] block leading-none">Trạng thái công việc</p>
                    <Select value={reportStatus} onValueChange={(v) => setReportStatus(v as TaskStatus)} disabled={!isReportable}>
                      <SelectTrigger className="rounded-2xl h-12 border-slate-200 bg-white font-black text-slate-800 shadow-sm focus:ring-blue-500">
                        <SelectValue>
                          {reportStatus === 'completed' ? "HOÀN THÀNH" :
                           reportStatus === 'in-progress' ? "ĐANG THỰC HIỆN" :
                           reportStatus === 'overdue' ? "QUÁ HẠN" : "CHƯA BẮT ĐẦU"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="pending" className="font-bold">CHƯA BẮT ĐẦU</SelectItem>
                        <SelectItem value="in-progress" className="font-bold text-blue-600">ĐANG THỰC HIỆN</SelectItem>
                        <SelectItem value="completed" className="font-bold text-emerald-600">HOÀN THÀNH</SelectItem>
                        <SelectItem value="overdue" className="font-bold text-red-600">QUÁ HẠN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleSaveReport} 
                    disabled={!isReportable}
                    className="h-12 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 transition-all active:scale-[0.98] uppercase tracking-wider"
                  >
                    Lưu Báo Cáo Công Việc
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
