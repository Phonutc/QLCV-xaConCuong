import { User, UserRole, Department } from '@/src/types';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Plus, 
  Search,
  Building2,
  Pencil,
  Trash2,
  Calendar,
  User as UserIcon,
  MapPin
} from 'lucide-react';
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

interface PersonnelProps {
  staff: User[];
  departments: Department[];
  currentUser: User | null;
  lastModifiedId: string | null;
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

export function Personnel({ staff, departments, currentUser, lastModifiedId, onAddUser, onUpdateUser, onDeleteUser }: PersonnelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const isStaff = currentUser?.role === 'staff';
  const isAdmin = currentUser?.role === 'admin';
  
  // Form state
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [position, setPosition] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('staff');
  const [birthYear, setBirthYear] = React.useState('');
  const [gender, setGender] = React.useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [hometown, setHometown] = React.useState('');
  const [error, setError] = React.useState('');

  const roleOrder: Record<UserRole, number> = {
    'admin': 0,
    'chairman': 1,
    'vice_chairman': 2,
    'head': 3,
    'deputy_head': 4,
    'staff': 5,
  };

  const sortedStaff = staff
    .filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.hometown && s.hometown.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99));

  const resetForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setPosition('');
    setDepartment('');
    setPhone('');
    setRole('staff');
    setBirthYear('');
    setGender('Nam');
    setHometown('');
    setError('');
  };

  const handleAdd = () => {
    if (!name || !username) return;
    
    // Check if username already exists
    const usernameExists = staff.some(s => s.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
      setError('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      return;
    }

    onAddUser({ name, username, email, password, position, department, phone, role, birthYear, gender, hometown });
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email || '');
    setPassword(''); // Don't show existing password
    setPosition(user.position);
    setDepartment(user.department);
    setPhone(user.phone || '');
    setRole(user.role);
    setBirthYear(user.birthYear || '');
    setGender(user.gender || 'Nam');
    setHometown(user.hometown || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingUser || !name) return;

    // Check if username already exists for another user
    const usernameExists = staff.some(s => 
      s.id !== editingUser.id && 
      s.username.toLowerCase() === username.toLowerCase()
    );
    
    if (usernameExists) {
      setError('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      return;
    }

    const updates: Partial<User> = { name, username, email, position, department, phone, role, birthYear, gender, hometown };
    if (password) updates.password = password;
    onUpdateUser(editingUser.id, updates);
    resetForm();
    setEditingUser(null);
    setIsEditDialogOpen(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'chairman': return 'Chủ tịch';
      case 'vice_chairman': return 'Phó Chủ tịch';
      case 'head': return 'Trưởng phòng';
      case 'deputy_head': return 'Phó phòng';
      case 'staff': return 'Cán bộ';
      default: return 'Cán bộ';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">UBND XÃ CON CUÔNG - Nhân sự</h1>
          <p className="text-slate-500">Quản lý thông tin và liên hệ của cán bộ, công chức xã.</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Thêm cán bộ</Button>} />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm cán bộ mới</DialogTitle>
                <DialogDescription>Tạo tài khoản mới cho cán bộ nhân viên.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="canbo_xyz" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Google (Để giới hạn truy cập)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="position">Chức vụ</Label>
                  <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Cán bộ Địa chính" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Bộ phận</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bộ phận" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="birthYear">Năm sinh</Label>
                    <Input id="birthYear" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder="1990" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hometown">Quê quán</Label>
                  <Input id="hometown" value={hometown} onChange={(e) => setHometown(e.target.value)} placeholder="CON CUÔNG, Nghệ An" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Vai trò / Quyền hạn</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Cán bộ</SelectItem>
                      <SelectItem value="deputy_head">Phó phòng</SelectItem>
                      <SelectItem value="head">Trưởng phòng</SelectItem>
                      <SelectItem value="vice_chairman">Phó Chủ tịch</SelectItem>
                      <SelectItem value="chairman">Chủ tịch</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <div className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleAdd} className="bg-blue-600" disabled={!name || !username || !password}>Lưu thông tin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm cán bộ theo tên, chức vụ, phòng ban..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedStaff.map((person) => (
          <Card 
            key={person.id} 
            className={cn(
              "border-none shadow-sm ring-1 hover-lift",
              person.id === lastModifiedId 
                ? "ring-2 ring-blue-500 shadow-lg scale-[1.02] z-10 bg-blue-50/30" 
                : "ring-slate-200"
            )}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.username}${person.gender === 'Nữ' ? '&top[]=longHair,bob,curly,dreads,frizzle' : '&top[]=shortHair,dreads,frizzle,shaggy,shaggyMullet'}`} />
                  <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">{person.name}</CardTitle>
                  <p className="text-sm font-medium text-blue-600">{person.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {(currentUser?.id === person.id || isAdmin) && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleEdit(person)}>
                    <Pencil size={16} />
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => onDeleteUser(person.id)}>
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building2 size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{person.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span>{person.birthYear || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <UserIcon size={14} className="text-slate-400 shrink-0" />
                  <span>{person.gender || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{person.hometown || 'N/A'}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  <span className="font-medium">{person.phone || 'Chưa cập nhật'}</span>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none text-[10px]">
                  {getRoleLabel(person.role)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { setEditingUser(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin cán bộ</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết cho cán bộ.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Họ và tên</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Tên đăng nhập</Label>
              <Input id="edit-username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!isAdmin} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email Google</Label>
              <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
            </div>
            {isAdmin && (
              <div className="grid gap-2">
                <Label htmlFor="edit-password">Mật khẩu mới (để trống nếu không đổi)</Label>
                <Input id="edit-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Chức vụ</Label>
              <Input id="edit-position" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Bộ phận</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bộ phận" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-birthYear">Năm sinh</Label>
                <Input id="edit-birthYear" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-gender">Giới tính</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-hometown">Quê quán</Label>
              <Input id="edit-hometown" value={hometown} onChange={(e) => setHometown(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Số điện thoại</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Vai trò / Quyền hạn</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={!isAdmin}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Cán bộ</SelectItem>
                  <SelectItem value="deputy_head">Phó phòng</SelectItem>
                  <SelectItem value="head">Trưởng phòng</SelectItem>
                  <SelectItem value="vice_chairman">Phó Chủ tịch</SelectItem>
                  <SelectItem value="chairman">Chủ tịch</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleUpdate} className="bg-blue-600" disabled={!name}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
