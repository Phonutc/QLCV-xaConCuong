import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import { Task, User, UserRole } from '../types';
import { cn } from '@/lib/utils';

interface PerformanceProps {
  tasks: Task[];
  users: User[];
  currentUser: User | null;
}

export default function Performance({ tasks, users, currentUser }: PerformanceProps) {
  const [timeRange, setTimeRange] = React.useState<'month' | 'quarter' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  if (!currentUser) return null;

  // Filter tasks based on time range
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.dueDate);
      if (timeRange === 'month') {
        return taskDate.getMonth() + 1 === selectedMonth && taskDate.getFullYear() === selectedYear;
      } else if (timeRange === 'quarter') {
        const quarter = Math.floor(taskDate.getMonth() / 3) + 1;
        const selectedQuarter = Math.floor((selectedMonth - 1) / 3) + 1;
        return quarter === selectedQuarter && taskDate.getFullYear() === selectedYear;
      } else {
        return taskDate.getFullYear() === selectedYear;
      }
    });
  }, [tasks, timeRange, selectedMonth, selectedYear]);

  // Calculate statistics for ALL users (for ranking chart)
  const allUserStats = React.useMemo(() => {
    return users
      .filter(user => user.role !== 'admin' && user.role !== 'chairman')
      .map(user => {
        const assignedTasks = filteredTasks.filter(t => t.assigneeIds?.includes(user.id));
        const completedTasks = assignedTasks.filter(t => t.status === 'completed');
        const overdueTasks = assignedTasks.filter(t => {
          const isOverdue = t.status !== 'completed' && new Date(t.dueDate) < new Date();
          return isOverdue || t.status === 'overdue';
        });

        const completionRate = assignedTasks.length > 0 
          ? Math.round((completedTasks.length / assignedTasks.length) * 100) 
          : 0;

        return {
          id: user.id,
          name: user.name,
          department: user.department,
          role: user.role,
          total: assignedTasks.length,
          completed: completedTasks.length,
          overdue: overdueTasks.length,
          rate: completionRate
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [users, filteredTasks]);

  // Filter visible stats in the table based on role
  const visibleUserStats = React.useMemo(() => {
    return allUserStats.filter(stat => {
      // Admin, Chairman, Vice Chairman see everyone
      if (['admin', 'chairman', 'vice_chairman'].includes(currentUser.role)) return true;
      
      // Head and Deputy Head see their department
      if (['head', 'deputy_head'].includes(currentUser.role)) {
        return stat.department === currentUser.department;
      }
      
      // Staff see only themselves
      return stat.id === currentUser.id;
    });
  }, [allUserStats, currentUser]);

  const topPerformers = allUserStats.slice(0, 8);

  const visibleTasksForSummary = React.useMemo(() => {
    return filteredTasks.filter(task => {
      if (['admin', 'chairman', 'vice_chairman'].includes(currentUser.role)) return true;
      if (['head', 'deputy_head'].includes(currentUser.role)) {
        return task.assigneeIds && task.assigneeIds.some(aid => {
          const u = users.find(user => user.id === aid);
          return u && u.department === currentUser.department;
        });
      }
      return task.assigneeIds && task.assigneeIds.includes(currentUser.id);
    });
  }, [filteredTasks, currentUser, users]);

  const totalStats = {
    total: visibleTasksForSummary.length,
    completed: visibleTasksForSummary.filter(t => t.status === 'completed').length,
    overdue: visibleTasksForSummary.filter(t => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate) < new Date())).length,
    rate: visibleTasksForSummary.length > 0 ? Math.round((visibleTasksForSummary.filter(t => t.status === 'completed').length / visibleTasksForSummary.length) * 100) : 0
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đánh giá Hiệu quả Công việc</h1>
          <p className="text-slate-500">Phân tích và thống kê chỉ số hoàn thành của cán bộ, nhân viên.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 shadow-sm">
            <Filter size={16} className="text-slate-400" />
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[110px] border-none shadow-none focus:ring-0 h-7 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Theo Tháng</SelectItem>
                <SelectItem value="quarter">Theo Quý</SelectItem>
                <SelectItem value="year">Theo Năm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {timeRange !== 'year' && (
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="w-[120px] bg-white text-sm h-9">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>Tháng {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[100px] bg-white text-sm h-9">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tổng công việc</p>
                <h3 className="text-2xl font-bold text-blue-900 mt-1">{totalStats.total}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Đã hoàn thành</p>
                <h3 className="text-2xl font-bold text-emerald-900 mt-1">{totalStats.completed}</h3>
              </div>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <CheckCircle2 className="text-emerald-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Tỷ lệ chung</p>
                <h3 className="text-2xl font-bold text-amber-900 mt-1">{totalStats.rate}%</h3>
              </div>
              <div className="bg-amber-100 p-2 rounded-lg">
                <Clock className="text-amber-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-rose-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600">Số việc trễ hạn</p>
                <h3 className="text-2xl font-bold text-rose-900 mt-1">{totalStats.overdue}</h3>
              </div>
              <div className="bg-rose-100 p-2 rounded-lg">
                <AlertTriangle className="text-rose-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Completion Rates */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Top 8 hoàn thành xuất sắc (%)</CardTitle>
            <CardDescription>Bảng xếp hạng hiệu quả công việc toàn xã</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPerformers}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
                    {topPerformers.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.id === currentUser.id ? '#8b5cf6' : (entry.rate > 80 ? '#10b981' : entry.rate > 50 ? '#3b82f6' : '#f59e0b')} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* List: Bottom performers or high overdue counts - only for managers */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              {['admin', 'chairman', 'vice_chairman', 'head', 'deputy_head'].includes(currentUser.role) 
                ? 'Cảnh báo chậm trễ' 
                : 'Trạng thái cá nhân'}
            </CardTitle>
            <CardDescription>
              {['admin', 'chairman', 'vice_chairman', 'head', 'deputy_head'].includes(currentUser.role)
                ? 'Danh sách cần đôn đốc thực hiện'
                : 'Số liệu công việc trễ hạn của bạn'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visibleUserStats.filter(s => s.overdue > 0).sort((a, b) => b.overdue - a.overdue).slice(0, 5).map((stat) => (
                <div key={stat.id} className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                      {stat.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{stat.name}</p>
                      <p className="text-xs text-slate-500">{stat.department}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="destructive" className="bg-rose-500 text-[10px]">
                      {stat.overdue} việc trễ
                    </Badge>
                  </div>
                </div>
              ))}
              {visibleUserStats.filter(s => s.overdue > 0).length === 0 && (
                <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                  <p className="text-sm text-slate-500 font-medium">Không có công việc nào trễ hạn.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <div>
            <CardTitle className="text-lg font-bold">
              {currentUser.role === 'staff' ? 'Kết quả cá nhân' : 'Bảng Tổng hợp Chỉ số (KPI)'}
            </CardTitle>
            <CardDescription>
              {currentUser.role === 'staff' ? 'Chi tiết hiệu quả công việc của bạn' : 'Chi tiết kết quả thực hiện của nhân viên quản lý'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="font-bold">Nhân viên</TableHead>
                <TableHead className="text-center font-bold">Tổng việc</TableHead>
                <TableHead className="text-center font-bold">Đã xong</TableHead>
                <TableHead className="text-center font-bold">Trễ hạn</TableHead>
                <TableHead className="w-[200px] font-bold">Tỷ lệ hoàn thành</TableHead>
                <TableHead className="text-right font-bold">Đánh giá</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleUserStats.map((stat) => (
                <TableRow key={stat.id} className={cn("group hover:bg-slate-50/50", stat.id === currentUser.id && "bg-purple-50/30")}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">
                        {stat.name} {stat.id === currentUser.id && "(Bạn)"}
                      </span>
                      <span className="text-xs text-slate-500">{stat.department} • {stat.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{stat.total}</TableCell>
                  <TableCell className="text-center text-emerald-600 font-bold">{stat.completed}</TableCell>
                  <TableCell className="text-center font-bold">
                    <span className={stat.overdue > 0 ? "text-rose-600" : "text-slate-400"}>
                      {stat.overdue}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-medium">{stat.rate}%</span>
                      </div>
                      <Progress value={stat.rate} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      className={cn(
                        "text-[10px] px-2 py-0 border-none",
                        stat.rate >= 90 ? "bg-emerald-500 text-white" :
                        stat.rate >= 70 ? "bg-blue-500 text-white" :
                        stat.rate >= 50 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                      )}
                    >
                      {stat.rate >= 90 ? "Xuất sắc" :
                       stat.rate >= 70 ? "Tốt" :
                       stat.rate >= 50 ? "Trung bình" : "Cần cố gắng"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
