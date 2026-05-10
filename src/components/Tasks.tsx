import * as React from 'react';
import { Task, User, TaskPriority, TaskStatus, ChecklistItem } from '@/src/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Trash2,
  Pencil,
  Check,
  ChevronsUpDown,
  ListTodo
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TasksProps {
  tasks: Task[];
  staff: User[];
  currentUser: User | null;
  lastModifiedId: string | null;
  initialFilter?: string;
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

// UserSelect component implementation moved to a better spot or uses proper imports now.

interface MultiUserSelectProps {
  users: User[];
  value: string[];
  mainAssigneeId?: string;
  onValueChange: (value: string[]) => void;
  placeholder: string;
}

function MultiUserSelect({ users, value, mainAssigneeId, onValueChange, placeholder }: MultiUserSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleUser = (userId: string) => {
    const newValue = value.includes(userId)
      ? value.filter(id => id !== userId)
      : [...value, userId];
    onValueChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal min-h-12 h-auto py-3 px-4 bg-white border-slate-200 hover:bg-slate-50 transition-all rounded-xl shadow-sm"
        >
          <div className="flex flex-wrap gap-2 items-center">
            {value.length > 0 ? (
              value.map(id => {
                const user = users.find(u => u.id === id);
                const isMain = id === mainAssigneeId;
                return (
                  <Badge 
                    key={id} 
                    variant={isMain ? "default" : "secondary"} 
                    className={cn(
                      "font-bold text-[10px] px-2 py-1 uppercase tracking-tight",
                      isMain ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-700/20" : "bg-slate-100 text-slate-500 border-none"
                    )}
                  >
                    {isMain ? `[CHỦ TRÌ] ` : `[PHỐI HỢP] `}{user?.name}
                  </Badge>
                );
              })
            ) : (
              <span className="text-slate-400 italic text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
        <Command>
          <CommandInput placeholder="Tìm kiếm tên..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => toggleUser(user.id)}
                >
                  <div className={cn(
                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    value.includes(user.id) ? "bg-primary text-primary-foreground" : "opacity-50"
                  )}>
                    {value.includes(user.id) && <Check className="h-3 w-3" />}
                  </div>
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Single User Select for "Assigned By"
function SingleUserSelect({ users, value, onValueChange, placeholder }: { users: User[], value: string, onValueChange: (v: string) => void, placeholder: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value
            ? users.find((user) => user.id === value)?.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm kiếm tên..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => {
                    onValueChange(user.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function Tasks({ tasks, staff, currentUser, lastModifiedId, initialFilter = '', onAddTask, onUpdateTask, onDeleteTask }: TasksProps) {
  const [searchTerm, setSearchTerm] = React.useState(initialFilter);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [reportTask, setReportTask] = React.useState<Task | null>(null);
  const [reportChecklist, setReportChecklist] = React.useState<ChecklistItem[]>([]);
  const [reportNewItem, setReportNewItem] = React.useState('');
  const [reportStatus, setReportStatus] = React.useState<TaskStatus>('pending');
  
  // Full edit state for report dialog
  const [reportTitle, setReportTitle] = React.useState('');
  const [reportDescription, setReportDescription] = React.useState('');
  const [reportDueDate, setReportDueDate] = React.useState('');
  const [reportPriority, setReportPriority] = React.useState<TaskPriority>('medium');
  const [reportAssigneeIds, setReportAssigneeIds] = React.useState<string[]>([]);
  const [reportMainAssigneeId, setReportMainAssigneeId] = React.useState<string>('');
  
  // Update search term if initialFilter changes
  React.useEffect(() => {
    setSearchTerm(initialFilter);
  }, [initialFilter]);

  const highlightedRef = React.useRef<HTMLTableRowElement>(null);

  React.useEffect(() => {
    if (lastModifiedId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [lastModifiedId]);

  const isStaff = currentUser?.role === 'staff';
  
  // Form state
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [assigneeIds, setAssigneeIds] = React.useState<string[]>([]);
  const [mainAssigneeId, setMainAssigneeId] = React.useState<string>('');
  const [assignedBy, setAssignedBy] = React.useState(currentUser?.id || '');
  const [dueDate, setDueDate] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [status, setStatus] = React.useState<TaskStatus>('pending');
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = React.useState('');

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Chưa định danh';

  const filteredTasks = tasks.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const assigneeNames = (t.assigneeIds || []).map(id => getStaffName(id).toLowerCase()).join(', ');
    const priorityText = t.priority === 'urgent' ? 'khẩn cấp' : 
                        t.priority === 'high' ? 'cao' : 
                        t.priority === 'medium' ? 'trung bình' : 'thấp';
    const statusText = t.status === 'completed' ? 'hoàn thành' : 
                      t.status === 'in-progress' ? 'đang thực hiện' : 
                      t.status === 'overdue' ? 'quá hạn' : 'chưa bắt đầu';

    return (
      t.title.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower) ||
      assigneeNames.includes(searchLower) ||
      t.dueDate.includes(searchLower) ||
      priorityText.includes(searchLower) ||
      statusText.includes(searchLower)
    );
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssigneeIds([]);
    setMainAssigneeId('');
    setAssignedBy(currentUser?.id || '');
    setDueDate('');
    setPriority('medium');
    setStatus('pending');
    setChecklist([]);
    setNewChecklistItem('');
  };

  const handleSave = () => {
    if (!title) return;
    onAddTask({ 
      title, 
      description, 
      assigneeIds: assigneeIds.length > 0 ? assigneeIds : (staff[0] ? [staff[0].id] : []), 
      mainAssigneeId: mainAssigneeId || (assigneeIds.length > 0 ? assigneeIds[0] : (staff[0] ? staff[0].id : '')),
      assignedBy: assignedBy || currentUser?.id || '',
      dueDate, 
      priority,
      status,
      checklist
    });
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setAssigneeIds(task.assigneeIds || []);
    setMainAssigneeId(task.mainAssigneeId || '');
    setAssignedBy(task.assignedBy || '');
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setStatus(task.status);
    setChecklist(task.checklist || []);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingTask || !title) return;
    onUpdateTask(editingTask.id, { 
      title, 
      description, 
      assigneeIds, 
      mainAssigneeId: mainAssigneeId || (assigneeIds.length > 0 ? assigneeIds[0] : ''),
      assignedBy, 
      dueDate, 
      priority, 
      status, 
      checklist 
    });
    resetForm();
    setEditingTask(null);
    setIsEditDialogOpen(false);
  };

  // Inline editing state
  const [inlineEditing, setInlineEditing] = React.useState<{ id: string, field: 'title' | 'description' | 'dueDate' } | null>(null);
  const [inlineValue, setInlineValue] = React.useState('');

  const startInlineEdit = (id: string, field: 'title' | 'description' | 'dueDate', value: string) => {
    if (isStaff) return; // Staff can't edit these but can update reports
    setInlineEditing({ id, field });
    setInlineValue(value);
  };

  const cancelInlineEdit = () => {
    setInlineEditing(null);
    setInlineValue('');
  };

  const saveInlineEdit = () => {
    if (!inlineEditing) return;
    onUpdateTask(inlineEditing.id, { [inlineEditing.field]: inlineValue });
    cancelInlineEdit();
  };

  const handleOpenReport = (task: Task) => {
    setReportTask(task);
    setReportTitle(task.title);
    setReportDescription(task.description || '');
    setReportDueDate(task.dueDate);
    setReportPriority(task.priority);
    setReportAssigneeIds(task.assigneeIds || []);
    setReportMainAssigneeId(task.mainAssigneeId || '');
    
    setReportChecklist(task.checklist || []);
    setReportNewItem('');
    setReportStatus(task.status);
    setIsReportDialogOpen(true);
  };

  const canFullEdit = (task: Task) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'chairman') return true;
    if (task.assignedBy === currentUser.id) return true;
    return false;
  };

  const handleSaveReport = () => {
    if (!reportTask) return;
    
    let newStatus = reportStatus;
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

    const isFullEditable = canFullEdit(reportTask);

    onUpdateTask(reportTask.id, { 
      checklist: reportChecklist,
      status: newStatus as TaskStatus,
      ...(isFullEditable && {
        title: reportTitle,
        description: reportDescription,
        dueDate: reportDueDate,
        priority: reportPriority,
        assigneeIds: reportAssigneeIds,
        mainAssigneeId: reportMainAssigneeId
      })
    });
    setIsReportDialogOpen(false);
    setReportTask(null);
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

  const toggleReportEditUser = (userId: string) => {
    const newValue = reportAssigneeIds.includes(userId)
      ? reportAssigneeIds.filter(id => id !== userId)
      : [...reportAssigneeIds, userId];
    setReportAssigneeIds(newValue);
    if (newValue.length === 1) setReportMainAssigneeId(newValue[0]);
    if (newValue.length === 0) setReportMainAssigneeId('');
    if (newValue.length > 0 && !newValue.includes(reportMainAssigneeId)) setReportMainAssigneeId(newValue[0]);
  };

  const toggleReportItem = (id: string) => {
    setReportChecklist(reportChecklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeReportItem = (id: string) => {
    setReportChecklist(reportChecklist.filter(item => item.id !== id));
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const item: ChecklistItem = {
      id: Math.random().toString(36).substring(2, 11),
      title: newChecklistItem.trim(),
      completed: false
    };
    const updatedChecklist = [...checklist, item];
    setChecklist(updatedChecklist);
    setNewChecklistItem('');

    // Khi thêm một hạng mục mới (chưa hoàn thành), nếu đang là "Hoàn thành" thì phải chuyển về "Đang thực hiện"
    if (status === 'completed') {
      setStatus('in-progress');
    }
  };

  const toggleChecklistItem = (id: string) => {
    const updatedChecklist = checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);

    // Tự động chuyển trạng thái dựa trên checklist
    if (updatedChecklist.length > 0) {
      const allCompleted = updatedChecklist.every(item => item.completed);
      const someCompleted = updatedChecklist.some(item => item.completed);

      if (allCompleted) {
        setStatus('completed');
      } else if (status === 'completed') {
        // Nếu đang Hoàn thành mà bỏ tích bất kỳ hạng mục nào -> Quay về Đang thực hiện
        setStatus('in-progress');
      } else if (someCompleted && status === 'pending') {
        setStatus('in-progress');
      }
    }
  };

  const removeChecklistItem = (id: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== id);
    setChecklist(updatedChecklist);

    // Tự động cập nhật trạng thái khi xóa hạng mục
    if (updatedChecklist.length > 0) {
      const allCompleted = updatedChecklist.every(item => item.completed);
      if (allCompleted && status !== 'completed') {
        setStatus('completed');
      }
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">UBND XÃ CON CUÔNG - Công việc</h1>
          <p className="text-slate-500">Theo dõi và phân công nhiệm vụ cho cán bộ nhân viên.</p>
        </div>
        {!isStaff && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Thêm công việc
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Thêm công việc mới</DialogTitle>
              <DialogDescription>Nhập thông tin chi tiết để phân công công việc mới.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="font-semibold">Tiêu đề</Label>
                <Input id="title" placeholder="Tên công việc..." value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="font-semibold">Mô tả</Label>
                <Textarea id="description" placeholder="Chi tiết công việc..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="assigned" className="text-sm font-semibold text-slate-700">Người thực hiện</Label>
                    <MultiUserSelect 
                      users={staff} 
                      value={assigneeIds} 
                      mainAssigneeId={mainAssigneeId}
                      onValueChange={(ids) => {
                        setAssigneeIds(ids);
                        if (ids.length === 1) setMainAssigneeId(ids[0]);
                        if (ids.length === 0) setMainAssigneeId('');
                        if (ids.length > 0 && !ids.includes(mainAssigneeId)) setMainAssigneeId(ids[0]);
                      }} 
                      placeholder="Chọn bộ phận, cán bộ thực hiện..." 
                    />
                  </div>
                  
                  {assigneeIds.length > 0 && (
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 block border-b border-blue-100 pb-2">Phân vai trò</Label>
                      <div className="space-y-3">
                        {assigneeIds.map(id => {
                          const isMain = id === mainAssigneeId;
                          return (
                            <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:border-blue-200">
                              <span className="text-sm font-bold text-slate-700 truncate max-w-[140px]">{getStaffName(id)}</span>
                              <div className="flex gap-1 p-1 bg-slate-100/50 rounded-lg border border-slate-200/50">
                                <button
                                  type="button"
                                  onClick={() => setMainAssigneeId(id)}
                                  className={cn(
                                    "px-4 py-1.5 rounded-md text-[10px] font-black transition-all duration-200 uppercase",
                                    isMain ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                  )}
                                >
                                  Chủ trì
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isMain) {
                                      const other = assigneeIds.find(oid => oid !== id);
                                      setMainAssigneeId(other || '');
                                    }
                                  }}
                                  className={cn(
                                    "px-4 py-1.5 rounded-md text-[10px] font-black transition-all duration-200 uppercase",
                                    !isMain ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                  )}
                                >
                                  Phối hợp
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="assignedBy" className="text-sm font-semibold text-slate-700">Người giao</Label>
                    <SingleUserSelect 
                      users={staff} 
                      value={assignedBy} 
                      onValueChange={setAssignedBy} 
                      placeholder="Chọn lãnh đạo giao..." 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="due" className="font-semibold text-sm">Hạn chót</Label>
                      <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl h-10" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority" className="font-semibold text-sm">Mức độ ưu tiên</Label>
                      <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                        <SelectTrigger className="rounded-xl h-10">
                          <SelectValue>
                            {priority === 'urgent' ? 'Khẩn cấp' : priority === 'high' ? 'Cao' : priority === 'medium' ? 'Trung bình' : 'Thấp'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Thấp</SelectItem>
                          <SelectItem value="medium">Trung bình</SelectItem>
                          <SelectItem value="high">Cao</SelectItem>
                          <SelectItem value="urgent">Khẩn cấp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status" className="font-semibold text-sm">Trạng thái hiện tại</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                    <SelectTrigger className="rounded-xl h-10">
                      <SelectValue>
                        {status === 'completed' ? 'Hoàn thành' : status === 'in-progress' ? 'Đang thực hiện' : status === 'overdue' ? 'Quá hạn' : 'Chưa bắt đầu'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chưa bắt đầu</SelectItem>
                      <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="overdue">Quá hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

                <div className="grid gap-3">
                  <Label>Báo cáo các hạng mục công việc</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Thêm đầu việc nhỏ..." 
                      value={newChecklistItem} 
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                    />
                    <Button type="button" size="sm" onClick={addChecklistItem} className="bg-slate-900">Thêm</Button>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 bg-slate-50/50 group">
                        <Checkbox 
                          checked={item.completed} 
                          onCheckedChange={() => toggleChecklistItem(item.id)}
                        />
                        <span className={cn(
                          "flex-1 text-sm",
                          item.completed ? "text-slate-400 line-through" : "text-slate-700"
                        )}>
                          {item.title}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                          onClick={() => removeChecklistItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleSave} className="bg-blue-600" disabled={!title}>Lưu công việc</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm theo tên, nội dung, người thực hiện, ngày tháng, trạng thái..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[28%]">Công việc</TableHead>
                  <TableHead className="text-center w-[14%]">Báo cáo công việc</TableHead>
                  <TableHead className="w-[18%]">Người thực hiện</TableHead>
                  <TableHead className="w-[12%]">Người giao</TableHead>
                  <TableHead className="w-[10%]">Hạn chót</TableHead>
                  <TableHead className="w-[8%]">Ưu tiên</TableHead>
                  <TableHead className="w-[10%]">Trạng thái</TableHead>
                  <TableHead className="text-right w-[40px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const completedItems = (task.checklist || []).filter(i => i.completed).length;
                    const totalItems = (task.checklist || []).length;
                    const progress = task.status === 'completed' 
                      ? 100 
                      : (totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0);

                    return (
                      <TableRow 
                        key={task.id} 
                        ref={task.id === lastModifiedId ? highlightedRef : null}
                        className={cn(
                          "transition-all duration-300 hover-lift relative",
                          task.id === lastModifiedId 
                            ? "bg-blue-50/80 ring-1 ring-blue-200 shadow-sm z-10" 
                            : "hover:bg-slate-50/50"
                        )}
                      >
                        <TableCell 
                          className={cn(
                            "max-w-[400px] transition-colors relative",
                            !isStaff ? "cursor-pointer hover:bg-slate-100/50" : ""
                          )}
                        >
                          {inlineEditing?.id === task.id && inlineEditing?.field === 'title' ? (
                            <div className="flex flex-col gap-2 p-1">
                              <Input 
                                autoFocus
                                value={inlineValue}
                                onChange={(e) => setInlineValue(e.target.value)}
                                onBlur={saveInlineEdit}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveInlineEdit();
                                  if (e.key === 'Escape') cancelInlineEdit();
                                }}
                                className="h-9 rounded-lg border-blue-400 focus:ring-blue-500 shadow-sm"
                              />
                            </div>
                          ) : (
                            <div 
                              className="flex flex-col gap-1 group/title"
                              onClick={() => startInlineEdit(task.id, 'title', task.title)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 leading-snug whitespace-normal break-words">{task.title}</span>
                                {!isStaff && <Pencil size={10} className="text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity" />}
                              </div>
                              <div 
                                className="relative group/desc"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startInlineEdit(task.id, 'description', task.description);
                                }}
                              >
                                {inlineEditing?.id === task.id && inlineEditing?.field === 'description' ? (
                                  <Textarea 
                                    autoFocus
                                    value={inlineValue}
                                    onChange={(e) => setInlineValue(e.target.value)}
                                    onBlur={saveInlineEdit}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        saveInlineEdit();
                                      }
                                      if (e.key === 'Escape') cancelInlineEdit();
                                    }}
                                    className="text-xs p-2 rounded-lg border-blue-400 focus:ring-blue-500 shadow-sm min-h-[60px]"
                                    rows={2}
                                  />
                                ) : (
                                  <div className="flex items-start gap-1">
                                    <span className="text-xs text-slate-500 whitespace-normal break-words leading-normal block min-h-[1.2em]">
                                      {task.description || <span className="italic opacity-50 text-[10px]">Nhấn để thêm mô tả chi tiết...</span>}
                                    </span>
                                    {!isStaff && <Pencil size={10} className="text-slate-300 opacity-0 group-hover/desc:opacity-100 transition-opacity mt-0.5 shrink-0" />}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div 
                            className="flex flex-col items-center justify-center gap-1 min-w-[120px] cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors group/report"
                            onClick={() => handleOpenReport(task)}
                          >
                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100/50 group-hover/report:border-blue-300">
                              <ListTodo size={14} className="text-blue-600" />
                              <span className="text-xs font-bold text-blue-700">
                                {completedItems}/{totalItems} hạng mục
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 italic">
                              Đã hoàn thành {progress}%
                            </span>
                            <span className="text-[10px] font-bold text-blue-500 mt-1 flex items-center gap-0.5 group-hover/report:text-blue-700 transition-colors uppercase">
                              + Cập nhật báo cáo
                            </span>
                          </div>
                        </TableCell>
                        <TableCell 
                          className={cn(
                            "transition-colors",
                            !isStaff ? "cursor-pointer hover:bg-slate-100/50" : ""
                          )}
                        >
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="flex flex-col gap-2 min-w-[150px] py-1 group/assignee relative cursor-pointer text-left">
                                {task.mainAssigneeId && (
                                  <div className="flex items-center gap-3 bg-blue-50 px-3 py-2.5 rounded-xl border border-blue-200/50 shadow-sm shadow-blue-100/50 transition-all hover:bg-blue-100/30 group-hover/assignee:ring-2 group-hover/assignee:ring-blue-100">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-white">
                                      <Users size={14} strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Chủ trì</span>
                                      <span className="text-xs font-bold text-slate-900 leading-tight">{getStaffName(task.mainAssigneeId)}</span>
                                    </div>
                                    {!isStaff && (
                                      <div className="ml-auto opacity-0 group-hover/assignee:opacity-100 transition-opacity">
                                        <Users size={12} className="text-blue-400" />
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1.5 px-0.5 mt-1">
                                  {(task.assigneeIds || []).filter(id => id !== task.mainAssigneeId).map(id => (
                                    <div key={id} className="flex items-center gap-2 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/50 text-[10px] text-slate-700 font-bold shadow-sm transition-all hover:bg-slate-200/50">
                                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                      <span>{getStaffName(id)}</span>
                                    </div>
                                  ))}
                                </div>
                                {(!task.assigneeIds || task.assigneeIds.length === 0) && (
                                  <span className="text-xs text-slate-300 italic px-2 font-medium">Chưa phân công</span>
                                )}
                              </div>
                            </PopoverTrigger>
                            {!isStaff && (
                              <PopoverContent className="w-80 p-4 rounded-2xl shadow-xl border-slate-200" align="start">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                      <Users size={16} className="text-blue-600" />
                                      Điều chỉnh phân công
                                    </h4>
                                  </div>
                                  <MultiUserSelect 
                                    users={staff} 
                                    value={task.assigneeIds || []} 
                                    mainAssigneeId={task.mainAssigneeId}
                                    onValueChange={(ids) => {
                                      const updates: Partial<Task> = { assigneeIds: ids };
                                      if (ids.length === 1) updates.mainAssigneeId = ids[0];
                                      if (ids.length === 0) updates.mainAssigneeId = '';
                                      if (ids.length > 0 && !ids.includes(task.mainAssigneeId || '')) updates.mainAssigneeId = ids[0];
                                      onUpdateTask(task.id, updates);
                                    }} 
                                    placeholder="Chọn cán bộ..." 
                                  />
                                  {task.assigneeIds && task.assigneeIds.length > 1 && (
                                    <div className="space-y-2 pt-2">
                                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Người chủ trì chính</span>
                                      <div className="grid grid-cols-1 gap-1 max-h-[150px] overflow-y-auto pr-1">
                                        {task.assigneeIds.map(id => (
                                          <Button
                                            key={id}
                                            variant={task.mainAssigneeId === id ? "default" : "ghost"}
                                            size="sm"
                                            className={cn(
                                              "text-xs h-9 justify-start rounded-lg px-3 transition-all",
                                              task.mainAssigneeId === id ? "bg-blue-600 text-white shadow-md font-bold" : "text-slate-600 hover:bg-slate-100"
                                            )}
                                            onClick={() => onUpdateTask(task.id, { mainAssigneeId: id })}
                                          >
                                            <div className={cn(
                                              "h-2 w-2 rounded-full mr-2",
                                              task.mainAssigneeId === id ? "bg-white" : "bg-slate-300"
                                            )} />
                                            {getStaffName(id)}
                                            {task.mainAssigneeId === id && <Check className="ml-auto h-3 w-3" />}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            )}
                          </Popover>
                        </TableCell>
                      <TableCell 
                        className={cn(
                          "transition-colors",
                          !isStaff ? "cursor-pointer hover:bg-slate-100/50" : ""
                        )}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="flex flex-col items-start gap-1 group/author cursor-pointer">
                              <span className="text-sm text-slate-500 italic">{getStaffName(task.assignedBy)}</span>
                              {!isStaff && <Pencil size={10} className="text-slate-300 opacity-0 group-hover/author:opacity-100 transition-opacity" />}
                            </div>
                          </PopoverTrigger>
                          {!isStaff && (
                            <PopoverContent className="w-64 p-0 rounded-xl" align="center">
                              <Command>
                                <CommandInput placeholder="Tìm người giao..." />
                                <CommandList>
                                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                  <CommandGroup>
                                    {staff.map((s) => (
                                      <CommandItem
                                        key={s.id}
                                        value={s.name}
                                        onSelect={() => onUpdateTask(task.id, { assignedBy: s.id })}
                                        className="text-xs"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-3 w-3",
                                            task.assignedBy === s.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {s.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          )}
                        </Popover>
                      </TableCell>
                      <TableCell 
                        className={cn(
                          "transition-colors",
                          !isStaff ? "cursor-pointer hover:bg-slate-100/50" : ""
                        )}
                      >
                        <div 
                          className="flex items-center justify-center gap-2 text-sm text-slate-600 group/date"
                          onClick={() => startInlineEdit(task.id, 'dueDate', task.dueDate)}
                        >
                          {inlineEditing?.id === task.id && inlineEditing?.field === 'dueDate' ? (
                            <Input 
                              type="date"
                              autoFocus
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onBlur={saveInlineEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit();
                                if (e.key === 'Escape') cancelInlineEdit();
                              }}
                              className="h-8 w-32 text-xs rounded-lg border-blue-400"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 group-hover/date:border-blue-300 transition-colors">
                                <Calendar size={14} className="text-slate-400 group-hover/date:text-blue-500" />
                                <span className={cn(
                                  "font-bold text-xs",
                                  task.status === 'overdue' ? "text-red-600" : "text-slate-700"
                                )}>{task.dueDate || 'N/A'}</span>
                              </div>
                              {!isStaff && <span className="text-[8px] font-bold text-blue-500 opacity-0 group-hover/date:opacity-100 transition-opacity uppercase tracking-tighter">Đổi ngày</span>}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-1">
                        <Select 
                          value={task.priority} 
                          onValueChange={(val) => onUpdateTask(task.id, { priority: val as TaskPriority })}
                          disabled={isStaff}
                        >
                          <SelectTrigger className={cn(
                            "h-8 text-[10px] uppercase font-black border-none shadow-none focus:ring-0 w-full rounded-lg transition-all",
                            task.status === 'completed' ? "bg-slate-50 text-slate-400" :
                            task.priority === 'urgent' ? "bg-red-50 text-red-700 hover:bg-red-100/70" :
                            task.priority === 'high' ? "bg-orange-50 text-orange-700 hover:bg-orange-100/70" :
                            task.priority === 'medium' ? "bg-blue-50 text-blue-700 hover:bg-blue-100/70" : "bg-slate-50 text-slate-700 hover:bg-slate-100/70"
                          )}>
                            <SelectValue>
                              {task.priority === 'urgent' ? "⚡ KHẨN CẤP" : 
                               task.priority === 'high' ? "🔥 CAO" : 
                               task.priority === 'medium' ? "🔷 TRUNG BÌNH" : "THẤP"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-xl min-w-[140px]">
                            <SelectItem value="urgent" className="text-[10px] font-black text-red-700 focus:bg-red-50 focus:text-red-700 py-2">⚡ KHẨN CẤP</SelectItem>
                            <SelectItem value="high" className="text-[10px] font-black text-orange-700 focus:bg-orange-50 focus:text-orange-700 py-2">🔥 CAO</SelectItem>
                            <SelectItem value="medium" className="text-[10px] font-black text-blue-700 focus:bg-blue-50 focus:text-blue-700 py-2">🔷 TRUNG BÌNH</SelectItem>
                            <SelectItem value="low" className="text-[10px] font-black text-slate-700 focus:bg-slate-50 focus:text-slate-700 py-2">⚪ THẤP</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1">
                        <Select 
                          value={task.status} 
                          onValueChange={(val) => onUpdateTask(task.id, { status: val as TaskStatus })}
                          disabled={!((task.assigneeIds || []).includes(currentUser?.id || '') || currentUser?.role === 'admin' || currentUser?.role === 'chairman')}
                        >
                          <SelectTrigger className={cn(
                            "h-8 text-[10px] uppercase font-black border-none shadow-none focus:ring-0 w-full rounded-lg transition-all",
                            task.status === 'completed' ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70" :
                            task.status === 'in-progress' ? "bg-blue-50 text-blue-700 hover:bg-blue-100/70" :
                            task.status === 'overdue' ? "bg-red-50 text-red-700 hover:bg-red-100/70" : "bg-amber-50 text-amber-700 hover:bg-amber-100/70"
                          )}>
                            <SelectValue>
                              {task.status === 'completed' ? "HOÀN THÀNH" :
                               task.status === 'in-progress' ? "ĐANG THỰC HIỆN" :
                               task.status === 'overdue' ? "QUÁ HẠN" : "CHƯA BẮT ĐẦU"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-xl min-w-[180px]">
                            <SelectItem value="pending" className="py-2 focus:bg-amber-50">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-amber-700 uppercase">Chưa bắt đầu</span>
                                  <span className="text-[9px] text-slate-400 leading-none">Công việc mới giao</span>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="in-progress" className="py-2 focus:bg-blue-50">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-blue-700 uppercase">Đang thực hiện</span>
                                  <span className="text-[9px] text-slate-400 leading-none">Đang triển khai</span>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="completed" className="py-2 focus:bg-emerald-50">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-emerald-700 uppercase">Hoàn thành</span>
                                  <span className="text-[9px] text-slate-400 leading-none">Đã hoàn tất</span>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="overdue" className="py-2 focus:bg-red-50">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-red-700 uppercase">Quá hạn</span>
                                  <span className="text-[9px] text-slate-400 leading-none">Trễ hạn định</span>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} className="text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {!isStaff && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(task)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'in-progress' })}>
                              <Clock className="mr-2 h-4 w-4" /> Đang thực hiện
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'completed' })}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Hoàn thành
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'pending' })}>
                              <AlertCircle className="mr-2 h-4 w-4" /> Chưa bắt đầu
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateTask(task.id, { status: 'overdue' })}>
                              <AlertCircle className="mr-2 h-4 w-4 text-red-600" /> Quá hạn
                            </DropdownMenuItem>
                            {!isStaff && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className={cn(
                                    "text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer w-full",
                                    task.status !== 'completed' && !(currentUser?.role === 'admin' || currentUser?.role === 'chairman') && "opacity-50"
                                  )} 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('[DEBUG] Delete clicked for task:', task.id);
                                    onDeleteTask(task.id);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> 
                                  <span>Xóa công việc</span>
                                  {task.status !== 'completed' && !(currentUser?.role === 'admin' || currentUser?.role === 'chairman') && (
                                    <span className="ml-auto text-[10px] bg-red-50 px-1 rounded italic">Cần hoàn thành</span>
                                  )}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                      Không tìm thấy công việc nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setEditingTask(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Chỉnh sửa công việc</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết cho công việc.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="font-semibold">Tiêu đề</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="font-semibold">Mô tả</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-assigned" className="text-sm font-semibold text-slate-700">Người thực hiện</Label>
                  <MultiUserSelect 
                    users={staff} 
                    value={assigneeIds} 
                    mainAssigneeId={mainAssigneeId}
                    onValueChange={(ids) => {
                      setAssigneeIds(ids);
                      if (ids.length === 1) setMainAssigneeId(ids[0]);
                      if (ids.length === 0) setMainAssigneeId('');
                      if (ids.length > 0 && !ids.includes(mainAssigneeId)) setMainAssigneeId(ids[0]);
                    }} 
                    placeholder="Chọn bộ phận, cán bộ thực hiện..." 
                  />
                </div>
                
                {assigneeIds.length > 0 && (
                  <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 block border-b border-blue-100 pb-2">Phân vai trò</Label>
                    <div className="space-y-3">
                      {assigneeIds.map(id => {
                        const isMain = id === mainAssigneeId;
                        return (
                          <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm transition-all hover:border-blue-200">
                            <span className="text-sm font-bold text-slate-700 truncate max-w-[140px]">{getStaffName(id)}</span>
                            <div className="flex gap-1 p-1 bg-slate-100/50 rounded-lg border border-slate-200/50">
                              <button
                                type="button"
                                onClick={() => setMainAssigneeId(id)}
                                className={cn(
                                  "px-4 py-1.5 rounded-md text-[10px] font-black transition-all duration-200 uppercase",
                                  isMain ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                )}
                              >
                                Chủ trì
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isMain) {
                                    const other = assigneeIds.find(oid => oid !== id);
                                    setMainAssigneeId(other || '');
                                  }
                                }}
                                className={cn(
                                  "px-4 py-1.5 rounded-md text-[10px] font-black transition-all duration-200 uppercase",
                                  !isMain ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                )}
                              >
                                Phối hợp
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-assignedBy" className="text-sm font-semibold text-slate-700">Người giao</Label>
                  <SingleUserSelect 
                    users={staff} 
                    value={assignedBy} 
                    onValueChange={setAssignedBy} 
                    placeholder="Chọn lãnh đạo giao..." 
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-due" className="font-semibold text-sm">Hạn chót</Label>
                    <Input id="edit-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl h-10" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-priority" className="font-semibold text-sm">Mức độ ưu tiên</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                      <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Chọn mức độ" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status" className="font-semibold text-sm">Trạng thái hiện tại</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chưa bắt đầu</SelectItem>
                    <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              <Label>Báo cáo các hạng mục công việc</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Thêm đầu việc nhỏ..." 
                  value={newChecklistItem} 
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                />
                <Button type="button" size="sm" onClick={addChecklistItem} className="bg-slate-900">Thêm</Button>
              </div>
              <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 bg-slate-50/50 group">
                    <Checkbox 
                      checked={item.completed} 
                      onCheckedChange={() => toggleChecklistItem(item.id)}
                    />
                    <span className={cn(
                      "flex-1 text-sm",
                      item.completed ? "text-slate-400 line-through" : "text-slate-700"
                    )}>
                      {item.title}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                      onClick={() => removeChecklistItem(item.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdate} className="bg-blue-600" disabled={!title}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Checklist Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl p-0 border-none">
          {reportTask && (
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
                {(canFullEdit(reportTask)) ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Tiêu đề công việc</Label>
                      <Input 
                        value={reportTitle} 
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="text-xl font-bold text-slate-900 border-slate-200 focus:ring-blue-500 rounded-2xl h-12 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Mô tả chi tiết</Label>
                      <Textarea 
                        value={reportDescription} 
                        onChange={(e) => setReportDescription(e.target.value)}
                        className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 text-sm text-slate-700 leading-relaxed font-semibold resize-none min-h-[120px] focus-visible:ring-blue-500 shadow-inner"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Tiêu đề công việc</p>
                      <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{reportTask.title}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Mô tả chi tiết</p>
                      <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 shadow-inner">
                        <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                          {reportTask.description || 'Không có mô tả chi tiết'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Due Date and Status */}
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Hạn chót</Label>
                    {(canFullEdit(reportTask)) ? (
                      <Input 
                        type="date"
                        value={reportDueDate}
                        onChange={(e) => setReportDueDate(e.target.value)}
                        className="rounded-2xl border-slate-200 h-12 w-full font-bold text-blue-600 bg-white shadow-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-2.5 text-sm font-black text-blue-700 bg-blue-50/80 px-4 py-3 rounded-2xl border border-blue-100/80 w-fit shadow-sm">
                        <Clock size={16} className="text-blue-500" />
                        {reportTask.dueDate}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Độ ưu tiên</Label>
                    <div className="flex items-center pt-1">
                      {(canFullEdit(reportTask)) ? (
                        <Select value={reportPriority} onValueChange={(v) => setReportPriority(v as TaskPriority)}>
                          <SelectTrigger className="rounded-2xl h-11 border-slate-200 bg-white font-bold text-slate-700 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="low" className="font-bold">Thấp</SelectItem>
                            <SelectItem value="medium" className="font-bold text-blue-600">Trung bình</SelectItem>
                            <SelectItem value="high" className="font-bold text-orange-600">Cao</SelectItem>
                            <SelectItem value="urgent" className="font-bold text-red-600">Khẩn cấp</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getPriorityBadge(reportTask.priority, reportTask.status)
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Section */}
                <div className="space-y-4">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 block">Thực hiện nhiệm vụ</Label>
                  
                  {(canFullEdit(reportTask)) ? (
                    <div className="space-y-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between font-bold h-12 py-2 px-4 bg-white border-slate-200 hover:bg-slate-50 transition-all rounded-2xl shadow-sm text-sm"
                          >
                            <div className="flex flex-wrap gap-1 items-center truncate">
                              {reportAssigneeIds.length > 0 ? (
                                `${reportAssigneeIds.length} nhân sự tham gia`
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
                                    onSelect={() => toggleReportEditUser(s.id)}
                                    className="rounded-lg m-1 p-2 font-bold"
                                  >
                                    <div className={cn(
                                      "mr-3 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                                      reportAssigneeIds.includes(s.id) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 bg-white"
                                    )}>
                                      {reportAssigneeIds.includes(s.id) && <Check className="h-4 w-4" strokeWidth={3} />}
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
                        {reportAssigneeIds.map(id => {
                          const s = staff.find(sm => sm.id === id);
                          const isMain = id === reportMainAssigneeId;
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
                                onClick={() => setReportMainAssigneeId(id)}
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
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-3">
                        {(reportTask.assigneeIds || []).filter(id => id === reportTask.mainAssigneeId).map(id => {
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
                        {(reportTask.assigneeIds || []).filter(id => id !== reportTask.mainAssigneeId).map(id => {
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
                      {staff.find(s => s.id === reportTask.assignedBy)?.name || 'Chưa định danh'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar and Section Title */}
                <div className="space-y-6 pt-8 border-t border-slate-100">
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

                  {/* Checklist and Input */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Thêm hạng mục công việc mới..."
                        value={reportNewItem}
                        onChange={(e) => setReportNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addReportItem()}
                        disabled={!((reportTask.assigneeIds || []).includes(currentUser?.id || '') || canFullEdit(reportTask))}
                        className="rounded-2xl border-slate-200 h-12 text-sm font-bold focus-visible:ring-blue-500 shadow-sm py-4 px-5"
                      />
                      <Button 
                        onClick={addReportItem} 
                        disabled={!((reportTask.assigneeIds || []).includes(currentUser?.id || '') || canFullEdit(reportTask))}
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
                            disabled={!((reportTask.assigneeIds || []).includes(currentUser?.id || '') || canFullEdit(reportTask))}
                            className="h-6 w-6 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all shadow-sm"
                          />
                          <span className={cn(
                            "flex-1 text-sm font-bold tracking-tight",
                            item.completed ? "text-slate-400 line-through font-semibold" : "text-slate-700"
                          )}>
                            {item.title}
                          </span>
                          {((reportTask.assigneeIds || []).includes(currentUser?.id || '') || canFullEdit(reportTask)) && (
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

                {/* Status Update */}
                <div className="grid grid-cols-2 gap-6 items-end pt-8">
                  <div className="space-y-3">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] block leading-none">Trạng thái công việc</p>
                    <Select value={reportStatus} onValueChange={(v) => setReportStatus(v as TaskStatus)} disabled={!((reportTask.assigneeIds || []).includes(currentUser?.id || '') || canFullEdit(reportTask))}>
                      <SelectTrigger className="rounded-2xl h-12 border-slate-200 bg-white font-black text-slate-800 shadow-sm focus:ring-blue-500">
                        <SelectValue />
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
                    disabled={!((reportTask.assigneeIds || []).includes(currentUser?.id || '') || canFullEdit(reportTask))}
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
