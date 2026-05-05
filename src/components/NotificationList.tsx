import * as React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Notification } from '../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToTask: (taskId: string) => void;
}

export function NotificationList({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onNavigateToTask 
}: NotificationListProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <AlertCircle className="text-blue-500" size={18} />;
      case 'task_updated':
        return <Clock className="text-amber-500" size={18} />;
      case 'task_completed':
        return <CheckCircle2 className="text-emerald-500" size={18} />;
      default:
        return <Bell className="text-slate-500" size={18} />;
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-80 sm:w-96 bg-white overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
              {unreadCount} mới
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 h-8 text-xs font-medium"
            onClick={onMarkAllAsRead}
          >
            Đánh dấu đã đọc hết
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-8 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Bell size={24} className="opacity-20" />
            </div>
            <p className="text-sm font-medium">Bạn chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 pb-2">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => {
                  if (!notification.isRead) onMarkAsRead(notification.id);
                  if (notification.taskId) onNavigateToTask(notification.taskId);
                }}
                className={cn(
                  "p-4 hover:bg-slate-50 cursor-pointer transition-colors relative group",
                  !notification.isRead && "bg-blue-50/40"
                )}
              >
                <div className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm leading-tight mb-1",
                      !notification.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-500 mb-2">
                      {notification.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium lowercase">
                        {format(new Date(notification.createdAt), 'HH:mm, dd/MM/yyyy', { locale: vi })}
                      </span>
                      {notification.taskId && (
                        <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Xem chi tiết <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
