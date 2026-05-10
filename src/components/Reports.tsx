import * as React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { User, Task, Department } from '../types';

interface ReportsProps {
  tasks: Task[];
  staff: User[];
  departments: Department[];
}

export function Reports({ tasks, staff, departments }: ReportsProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Data for Personnel by Department
  const personnelData = departments.map(dept => ({
    name: dept.name,
    count: staff.filter(u => u.department === dept.name).length
  }));

  // Data for Tasks by Status
  const statusData = [
    { name: 'Chưa bắt đầu', value: tasks.filter(t => t.status === 'pending').length, color: '#94a3b8' },
    { name: 'Đang thực hiện', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Hoàn thành', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'Quá hạn', value: tasks.filter(t => t.status === 'overdue').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Data for Tasks by Priority (excluding completed tasks)
  const priorityData = [
    { name: 'Thấp', count: tasks.filter(t => t.status !== 'completed' && t.priority === 'low').length, color: '#94a3b8' },
    { name: 'Trung bình', count: tasks.filter(t => t.status !== 'completed' && t.priority === 'medium').length, color: '#3b82f6' },
    { name: 'Cao', count: tasks.filter(t => t.status !== 'completed' && t.priority === 'high').length, color: '#f97316' },
    { name: 'Khẩn cấp', count: tasks.filter(t => t.status !== 'completed' && t.priority === 'urgent').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">UBND XÃ CON CUÔNG - Báo cáo</h1>
        <p className="text-slate-500">Phân tích dữ liệu nhân sự và công việc</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm ring-1 ring-slate-200 hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Nhân sự theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div id="personnel-dept-chart" className="h-[400px] w-full min-h-[400px] min-w-[0px]">
              {isMounted && (
                <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                  <BarChart 
                    data={personnelData} 
                    layout="vertical"
                    margin={{ left: 40, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      width={150}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200 hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Công việc theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div id="task-status-chart" className="h-[300px] w-full min-h-[300px] min-w-[0px]">
              {isMounted && (
                <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200 hover-lift">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Công việc theo mức độ ưu tiên</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div id="task-priority-chart" className="h-[300px] w-full min-h-[300px] min-w-[0px]">
              {isMounted && (
                <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
