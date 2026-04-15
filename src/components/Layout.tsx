import * as React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  LogOut,
  Menu,
  X,
  Building2,
  ChevronRight,
  User as UserIcon,
  Settings,
  Camera,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User } from '../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
}

export function Layout({ children, activeTab, setActiveTab, user, onLogout, onUpdateProfile }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [newName, setNewName] = React.useState(user?.name || '');
  const [newAvatar, setNewAvatar] = React.useState(user?.avatarUrl || '');

  React.useEffect(() => {
    if (user) {
      setNewName(user.name);
      setNewAvatar(user.avatarUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = () => {
    onUpdateProfile({ name: newName, avatarUrl: newAvatar });
    setIsProfileDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'personnel', label: 'Nhân sự', icon: Users, adminOnly: true },
    { id: 'tasks', label: 'Công việc', icon: CheckSquare },
    { id: 'reports', label: 'Báo cáo', icon: FileText },
    { id: 'departments', label: 'Phòng ban', icon: Building2, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.adminOnly) return true;
    return ['admin', 'chairman', 'vice_chairman'].includes(user?.role || '');
  });

  return (
    <div className="flex h-screen bg-slate-200/50 overflow-hidden text-slate-900 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0f172a] text-slate-300 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight uppercase tracking-wider">UBND XÃ YÊN THÀNH</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Quản lý nhân sự</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
              )} />
              <span>{item.label}</span>
              {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest italic">Produced by Phạm Phồn</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-slate-300 z-50 transition-transform duration-300 md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-white text-sm uppercase tracking-wider">UBND XÃ YÊN THÀNH</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest italic">Produced by Phạm Phồn</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 md:flex-none" />

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-4 hover:bg-slate-50 p-1 rounded-xl transition-colors outline-none cursor-pointer">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-900 leading-none">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.position}</span>
                </div>
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-200">
                  <AvatarImage src={user?.avatarUrl || `https://picsum.photos/seed/${user?.id}/200`} />
                  <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                    {user?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Đổi tên & Ảnh đại diện</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cập nhật hồ sơ</DialogTitle>
              <DialogDescription>Thay đổi tên hiển thị và ảnh đại diện của bạn.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl ring-1 ring-slate-200">
                    <AvatarImage src={newAvatar || `https://picsum.photos/seed/${user?.id}/200`} />
                    <AvatarFallback className="text-2xl">{user?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} />
                    <input 
                      type="file" 
                      accept="image/*"
                      className="sr-only" 
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400">Nhấn vào ảnh để tải lên từ thiết bị</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-name">Họ và tên</Label>
                <Input 
                  id="profile-name" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-upload" className="flex items-center gap-2">
                  <Upload size={14} />
                  Tải ảnh lên từ thiết bị
                </Label>
                <Input 
                  id="profile-upload" 
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-avatar">Hoặc dán link ảnh (URL)</Label>
                <Input 
                  id="profile-avatar" 
                  placeholder="https://example.com/avatar.jpg"
                  value={newAvatar.startsWith('data:') ? '' : newAvatar} 
                  onChange={(e) => setNewAvatar(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleUpdateProfile} className="bg-blue-600">Lưu thay đổi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-200/30">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
