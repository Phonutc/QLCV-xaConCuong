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
  Pencil
} from 'lucide-react';
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

export function Tasks({ tasks, staff, currentUser, lastModifiedId, initialFilter = '', onAddTask, onUpdateTask, onDeleteTask }: TasksProps) {
  const [searchTerm, setSearchTerm] = React.useState(initialFilter);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  
  // Update search term if initialFilter changes
  React.useEffect(() => {
    if (initialFilter) {
      setSearchTerm(initialFilter);
    }
  }, [initialFilter]);

  const isStaff = currentUser?.role === 'staff';
  
  // Form state
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [assignedTo, setAssignedTo] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Chưa phân công';

  const filteredTasks = tasks.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const staffName = getStaffName(t.assignedTo).toLowerCase();
    const priorityText = t.priority === 'urgent' ? 'khẩn cấp' : 
                        t.priority === 'high' ? 'cao' : 
                        t.priority === 'medium' ? 'trung bình' : 'thấp';
    const statusText = t.status === 'completed' ? 'hoàn thành' : 
                      t.status === 'in-progress' ? 'đang thực hiện' : 
                      t.status === 'overdue' ? 'quá hạn' : 'chưa bắt đầu';

    return (
      t.title.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower) ||
      staffName.includes(searchLower) ||
      t.dueDate.includes(searchLower) ||
      priorityText.includes(searchLower) ||
      statusText.includes(searchLower)
    );
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setDueDate('');
    setPriority('medium');
  };

  const handleSave = () => {
    if (!title) return;
    onAddTask({ title, description, assignedTo: assignedTo || staff[0]?.id, dueDate, priority });
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setAssignedTo(task.assignedTo);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingTask || !title) return;
    onUpdateTask(editingTask.id, { title, description, assignedTo, dueDate, priority });
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">UBND XÃ YÊN THÀNH - Công việc</h1>
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
                  <Input id="description" placeholder="Chi tiết công việc..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="assigned">Người thực hiện</Label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger><SelectValue placeholder="Chọn cán bộ" /></SelectTrigger>
                      <SelectContent>
                        {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="due">Hạn chót</Label>
                    <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <TableHead className="w-[300px]">Công việc</TableHead>
                  <TableHead>Người thực hiện</TableHead>
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
                      className={cn(
                        "transition-all duration-500",
                        task.id === lastModifiedId 
                          ? "bg-blue-50/80 ring-1 ring-blue-200 shadow-sm z-10" 
                          : "hover:bg-slate-50/50"
                      )}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{task.title}</span>
                          <span className="text-xs text-slate-500 line-clamp-1">{task.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            {getStaffName(task.assignedTo).charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600">{getStaffName(task.assignedTo)}</span>
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
                                <DropdownMenuItem className="text-red-600" onClick={() => onDeleteTask(task.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Xóa công việc
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
              <Input id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-assigned">Người thực hiện</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger><SelectValue placeholder="Chọn cán bộ" /></SelectTrigger>
                  <SelectContent>
                    {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-due">Hạn chót</Label>
                <Input id="edit-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
