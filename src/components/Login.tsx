import * as React from 'react';
import { User } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LogIn, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

import { db, auth, googleProvider } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLogin: (user: User) => void;
  sessionExpired?: boolean;
}

export function Login({ onLogin, sessionExpired }: LoginProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(true);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (sessionExpired) {
      setError('Phiên làm việc đã hết hạn do bạn không thao tác trong thời gian dài. Vui lòng đăng nhập lại.');
    }
  }, [sessionExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const q = query(
        collection(db, 'users'), 
        where('username', '==', username),
        where('password', '==', password)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as User;
        onLogin(userData);
      } else {
        setError('Sai tài khoản hoặc mật khẩu');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError('Không thể kết nối tới cơ sở dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;

      if (!email) {
        throw new Error('Không lấy được email từ Google');
      }

      // Check if this email is allowed in our users collection
      const q = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as User;
        onLogin(userData);
      } else {
        setError(`Tài khoản Google (${email}) chưa được cấp quyền truy cập hệ thống.`);
        // Sign out from Firebase if not allowed
        await auth.signOut();
      }
    } catch (err: any) {
      console.error('Lỗi Google Login:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Cửa sổ đăng nhập bị chặn. Vui lòng bật tab mới hoặc mở app ở tab khác.');
      } else {
        setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">UBND XÃ YÊN THÀNH</h1>
          <p className="text-slate-500">Hệ thống Quản lý Công việc Nội bộ</p>
        </div>

        <Card className="border-none shadow-xl ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>Vui lòng nhập tài khoản để truy cập hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tài khoản</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="username"
                    placeholder="Tên đăng nhập"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">Duy trì đăng nhập (Ghi nhớ)</Label>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10" disabled={isLoading}>
                {isLoading && !username ? 'Đang thực hiện...' : 'Đăng nhập'}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Hoặc</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-10 gap-2 border-slate-200"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                Đăng nhập bằng Google
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>© 2026 Ủy ban nhân dân xã. Bảo lưu mọi quyền.</p>
        </div>
      </motion.div>
    </div>
  );
}
