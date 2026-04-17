import * as React from 'react';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  User as UserIcon,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Department, User } from '../types';

interface DepartmentsProps {
  departments: Department[];
  users: User[];
  currentUser: User | null;
  lastModifiedId: string | null;
  onAddDepartment: (dept: Partial<Department>) => void;
  onUpdateDepartment: (id: string, updates: Partial<Department>) => void;
  onDeleteDepartment: (id: string) => void;
}

export function Departments({ 
  departments, 
  users, 
  currentUser,
  lastModifiedId,
  onAddDepartment, 
  onUpdateDepartment, 
  onDeleteDepartment 
}: DepartmentsProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isViewStaffOpen, setIsViewStaffOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState<Department | null>(null);
  const [viewingDept, setViewingDept] = React.useState<Department | null>(null);
  
  const isAdmin = currentUser?.role === 'admin';
  
  // Form state
  const [name, setName] = React.useState('');
  const [headId, setHeadId] = React.useState('');
  const [description, setDescription] = React.useState('');

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setHeadId('');
    setDescription('');
  };

  const handleSave = () => {
    if (!name) return;
    onAddDepartment({ name, headId, description });
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setHeadId(dept.headId);
    setDescription(dept.description);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingDept || !name) return;
    onUpdateDepartment(editingDept.id, { name, headId, description });
    resetForm();
    setEditingDept(null);
    setIsEditDialogOpen(false);
  };

  const getHeadName = (id: string) => users.find(u => u.id === id)?.name || 'Chưa có trưởng phòng';
  const getStaffCount = (deptName: string) => users.filter(u => u.department === deptName).length;
  
  const getDeptStaff = (deptName: string) => {
    const roleOrder: Record<string, number> = {
      'admin': 0,
      'chairman': 1,
      'vice_chairman': 2,
      'head': 3,
      'deputy_head': 4,
      'staff': 5,
    };

    return users
      .filter(u => u.department === deptName)
      .sort((a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">UBND XÃ YÊN THÀNH - Phòng ban</h1>
          <p className="text-slate-500">Quản lý cơ cấu tổ chức và các bộ phận chuyên môn.</p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Thêm phòng ban</Button>} />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm phòng ban mới</DialogTitle>
                <DialogDescription>Nhập thông tin cơ bản để tạo phòng ban mới.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên phòng ban</Label>
                  <Input id="name" placeholder="Văn phòng UBND" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="head">Trưởng phòng / Phụ trách</Label>
                  <Select value={headId} onValueChange={setHeadId}>
                    <SelectTrigger><SelectValue placeholder="Chọn cán bộ phụ trách" /></SelectTrigger>
                    <SelectContent>
                      {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Mô tả chức năng</Label>
                  <Input id="desc" placeholder="Mô tả ngắn gọn..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleSave} className="bg-blue-600" disabled={!name}>Lưu thông tin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm phòng ban..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepts.map((dept) => (
          <Card 
            key={dept.id} 
            className={cn(
              "border-none shadow-sm ring-1 transition-all duration-500 cursor-pointer group",
              dept.id === lastModifiedId 
                ? "ring-2 ring-blue-500 shadow-lg scale-[1.02] z-10 bg-blue-50/30" 
                : "ring-slate-200 hover:ring-blue-400 hover:shadow-md"
            )}
            onClick={() => {
              setViewingDept(dept);
              setIsViewStaffOpen(true);
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">{dept.name}</CardTitle>
              </div>
              {isAdmin && (
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical size={16} />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(dept)}>
                        <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => onDeleteDepartment(dept.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                {dept.description || 'Chưa có mô tả chức năng nhiệm vụ.'}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <UserIcon size={16} className="text-slate-400" />
                  <span className="font-medium">Trưởng phòng:</span>
                  <span>{getHeadName(dept.headId)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={16} className="text-slate-400" />
                  <span className="font-medium">Nhân sự:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs">{getStaffCount(dept.name)} người</span>
                </div>
              </div>
              <div className="pt-4 flex items-center justify-end text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Xem danh sách <ChevronRight size={14} className="ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setEditingDept(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết cho phòng ban.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên phòng ban</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-head">Trưởng phòng / Phụ trách</Label>
              <Select value={headId} onValueChange={setHeadId}>
                <SelectTrigger><SelectValue placeholder="Chọn cán bộ phụ trách" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc">Mô tả chức năng</Label>
              <Input id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdate} className="bg-blue-600" disabled={!name}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Staff Dialog */}
      <Dialog open={isViewStaffOpen} onOpenChange={setIsViewStaffOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-hidden flex flex-col bg-white shadow-2xl border-none">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
              Nhân sự: {viewingDept?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Danh sách cán bộ, công chức thuộc {viewingDept?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {viewingDept && getDeptStaff(viewingDept.name).length > 0 ? (
              <div className="space-y-4">
                {getDeptStaff(viewingDept.name).map((person) => (
                  <div key={person.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username}${person.gender === 'Nữ' ? '&top[]=longHair,bob,curly,dreads,frizzle' : '&top[]=shortHair,dreads,frizzle,shaggy,shaggyMullet'}`} />
                      <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 truncate">{person.name}</p>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                          {person.position}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {person.phone && (
                          <div className="flex items-center text-xs text-slate-500">
                            <Phone size={12} className="mr-1" />
                            {person.phone}
                          </div>
                        )}
                        <div className="flex items-center text-xs text-slate-500">
                          <UserIcon size={12} className="mr-1" />
                          {person.role === 'admin' ? 'Quản trị viên' : 
                           person.role === 'chairman' ? 'Chủ tịch' :
                           person.role === 'vice_chairman' ? 'Phó Chủ tịch' :
                           person.role === 'head' ? 'Trưởng phòng' :
                           person.role === 'deputy_head' ? 'Phó phòng' : 'Cán bộ'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có nhân sự nào trong phòng ban này.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewStaffOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
