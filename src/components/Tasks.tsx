import * as React from 'react';
import { Task, User, TaskPriority, TaskStatus } from '@/src/types';
import { cn } from '@/lib/utils';
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
  Trash2,
  Pencil,
  Check,
  ChevronsUpDown
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
  onValueChange: (value: string[]) => void;
  placeholder: string;
}

function MultiUserSelect({ users, value, onValueChange, placeholder }: MultiUserSelectProps) {
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
          className="w-full justify-between font-normal min-h-10 h-auto py-2"
        >
          <div className="flex flex-wrap gap-1 items-center">
            {value.length > 0 ? (
              value.map(id => {
                const user = users.find(u => u.id === id);
                return (
                  <Badge key={id} variant="secondary" className="font-normal">
                    {user?.name}
                  </Badge>
                );
              })
            ) : (
              <span className="text-slate-500">{placeholder}</span>
            )}
          </div>
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
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  
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
  const [assignedBy, setAssignedBy] = React.useState(currentUser?.id || '');
  const [dueDate, setDueDate] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [status, setStatus] = React.useState<TaskStatus>('pending');

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
    setAssignedBy(currentUser?.id || '');
    setDueDate('');
    setPriority('medium');
    setStatus('pending');
  };

  const handleSave = () => {
    if (!title) return;
    onAddTask({ 
      title, 
      description, 
      assigneeIds: assigneeIds.length > 0 ? assigneeIds : (staff[0] ? [staff[0].id] : []), 
      assignedBy: assignedBy || currentUser?.id || '',
      dueDate, 
      priority,
      status
    });
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setAssigneeIds(task.assigneeIds || []);
    setAssignedBy(task.assignedBy || '');
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setStatus(task.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingTask || !title) return;
    onUpdateTask(editingTask.id, { title, description, assigneeIds, assignedBy, dueDate, priority, status });
    resetForm();
    setEditingTask(null);
    setIsEditDialogOpen(false);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">UBND XÃ CON CUÔNG - Công việc</h1>
          <p className="text-slate-500">Theo dõi và phân công nhiệm vụ cho cán bộ nhân viên.</p>
        </div>
        {!isStaff && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Thêm công việc</Button>} />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm công việc mới</DialogTitle>
                <DialogDescription>Nhập thông tin chi tiết để phân công công việc mới.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input id="title" placeholder="Tên công việc..." value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea id="description" placeholder="Chi tiết công việc..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="assigned">Người thực hiện</Label>
                    <MultiUserSelect 
                      users={staff} 
                      value={assigneeIds} 
                      onValueChange={setAssigneeIds} 
                      placeholder="Chọn cán bộ" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assignedBy">Người giao</Label>
                    <SingleUserSelect 
                      users={staff} 
                      value={assignedBy} 
                      onValueChange={setAssignedBy} 
                      placeholder="Chọn người giao" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="due">Hạn chót</Label>
                    <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Mức độ ưu tiên</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                      <SelectTrigger><SelectValue placeholder="Chọn mức độ" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                      <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chưa bắt đầu</SelectItem>
                        <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="overdue">Quá hạn</SelectItem>
                      </SelectContent>
                    </Select>
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

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
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
                  <TableHead className="w-[250px]">Công việc</TableHead>
                  <TableHead>Người thực hiện</TableHead>
                  <TableHead>Người giao</TableHead>
                  <TableHead>Hạn chót</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow 
                      key={task.id} 
                      ref={task.id === lastModifiedId ? highlightedRef : null}
                      className={cn(
                        "transition-all duration-500",
                        task.id === lastModifiedId 
                          ? "bg-blue-50/80 ring-1 ring-blue-200 shadow-sm z-10" 
                          : "hover:bg-slate-50/50"
                      )}
                    >
                      <TableCell className="max-w-[400px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-900 leading-snug whitespace-normal break-words">{task.title}</span>
                          <span className="text-xs text-slate-500 whitespace-normal break-words leading-normal">{task.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(task.assigneeIds || []).map(id => (
                            <div key={id} className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-600">
                              <span className="font-bold">{getStaffName(id).charAt(0)}</span>
                              <span>{getStaffName(id)}</span>
                            </div>
                          ))}
                          {(task.assigneeIds || []).length === 0 && <span className="text-sm text-slate-400">Chưa định danh</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 italic">{getStaffName(task.assignedBy)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          {task.dueDate}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority, task.status)}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={16} className="text-slate-400" /></Button>} />
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa công việc</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết cho công việc.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Tiêu đề</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-assigned">Người thực hiện</Label>
                <MultiUserSelect 
                  users={staff} 
                  value={assigneeIds} 
                  onValueChange={setAssigneeIds} 
                  placeholder="Chọn cán bộ" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-assignedBy">Người giao</Label>
                <SingleUserSelect 
                  users={staff} 
                  value={assignedBy} 
                  onValueChange={setAssignedBy} 
                  placeholder="Chọn người giao" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-due">Hạn chót</Label>
                <Input id="edit-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Mức độ ưu tiên</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger><SelectValue placeholder="Chọn mức độ" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chưa bắt đầu</SelectItem>
                    <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdate} className="bg-blue-600" disabled={!title}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
