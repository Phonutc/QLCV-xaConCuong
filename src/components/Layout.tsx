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
  Upload,
  Play,
  Sparkles,
  Bell,
  TrendingUp,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Notification } from '../types';
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
import { NotificationList } from './NotificationList';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  notifications?: Notification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onNavigateToTask?: (taskId: string) => void;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
  onShowIntro?: () => void;
  onShowCeremony?: () => void;
}

export function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  notifications = [],
  onMarkNotificationAsRead = () => {},
  onMarkAllNotificationsAsRead = () => {},
  onNavigateToTask = () => {},
  onLogout, 
  onUpdateProfile, 
  onShowIntro, 
  onShowCeremony 
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [newName, setNewName] = React.useState(user?.name || '');
  const [newAvatar, setNewAvatar] = React.useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errorVisible, setErrorVisible] = React.useState('');

  React.useEffect(() => {
    if (user) {
      setNewName(user.name);
      setNewAvatar(user.avatarUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = () => {
    setErrorVisible('');
    
    // Validate password change if any field is touched
    if (currentPassword || newPassword || confirmPassword) {
      if (user?.password && currentPassword !== user.password) {
        setErrorVisible('Mật khẩu hiện tại không chính xác');
        return;
      }
      if (newPassword.length < 4) {
        setErrorVisible('Mật khẩu mới phải có ít nhất 4 ký tự');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorVisible('Mật khẩu xác nhận không khớp');
        return;
      }
    }

    const updates: Partial<User> = { name: newName, avatarUrl: newAvatar };
    if (newPassword) {
      updates.password = newPassword;
    }

    onUpdateProfile(updates);
    setIsProfileDialogOpen(false);
    
    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
    { id: 'performance', label: 'Đánh giá', icon: TrendingUp },
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
            <h1 className="font-bold text-white text-lg leading-tight uppercase tracking-[0.15em] font-heading">UBND XÃ </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">Quản lý nhân sự</p>
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
                  : "hover:bg-slate-800 hover:text-white hover:translate-x-1"
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
            <span className="font-bold text-white text-sm uppercase tracking-wider">UBND XÃ </span>
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
            {onShowCeremony && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={onShowCeremony}
                className="hidden lg:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 font-medium tracking-wide"
              >
                <Sparkles size={16} />
                Lễ ra mắt hệ thống
              </Button>
            )}
            {onShowIntro && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onShowIntro}
                className="hidden lg:flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-medium tracking-wide"
              >
                <Play size={16} fill="currentColor" />
                Trình chiếu ra mắt
              </Button>
            )}

            <DropdownMenu open={isNotifOpen} onOpenChange={setIsNotifOpen}>
              <DropdownMenuTrigger render={
                <button className="relative h-10 w-10 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center outline-none cursor-pointer">
                  <Bell size={22} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>
              } />
              <DropdownMenuContent align="end" className="p-0 border-none shadow-2xl rounded-2xl overflow-hidden w-80 sm:w-96">
                <NotificationList 
                  notifications={notifications}
                  onMarkAsRead={(id) => {
                    onMarkNotificationAsRead(id);
                    setIsNotifOpen(false);
                  }}
                  onMarkAllAsRead={onMarkAllNotificationsAsRead}
                  onNavigateToTask={(taskId) => {
                    onNavigateToTask(taskId);
                    setIsNotifOpen(false);
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="flex items-center gap-4 hover:bg-slate-50 p-1 rounded-xl transition-colors outline-none cursor-pointer border-none bg-transparent">
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
                </button>
              } />
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

              <DropdownMenuSeparator className="my-2" />
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 text-slate-700">
                  <Lock size={16} />
                  Thay đổi mật khẩu
                </h4>
                
                {!user?.password ? (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
                    <Sparkles size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Tài khoản của bạn được liên kết với <strong>Google</strong>. Cài đặt bảo mật và mật khẩu được quản lý trực tiếp qua tài khoản Google của bạn.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                      <Input 
                        id="current-password" 
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">Mật khẩu mới</Label>
                      <Input 
                        id="new-password" 
                        type="password"
                        placeholder="Tối thiểu 4 ký tự"
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                      />
                    </div>
                  </>
                )}

                {errorVisible && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle size={16} />
                    {errorVisible}
                  </div>
                )}
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
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
