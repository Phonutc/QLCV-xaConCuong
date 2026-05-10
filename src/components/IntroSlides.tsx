import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  CheckSquare, 
  FileText, 
  ShieldCheck, 
  Smartphone, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Play,
  Monitor,
  Zap,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Slide {
  title: string;
  subtitle: string;
  content: string;
  icon: React.ReactNode;
  color: string;
  points: string[];
}

const slides: Slide[] = [
  {
    title: "Chào mừng đến với Hệ thống Quản lý UBND",
    subtitle: "Giải pháp chuyển đổi số toàn diện cho cấp Xã",
    content: "Hệ thống được thiết kế riêng để tối ưu hóa quy trình làm việc, giúp cán bộ quản lý công việc khoa học và hiệu quả hơn.",
    icon: <Building2 className="w-20 h-20" />,
    color: "bg-blue-600",
    points: [
      "Quản lý tập trung dữ liệu",
      "Giao diện thân thiện, dễ dùng",
      "Hỗ trợ ra quyết định nhanh chóng"
    ]
  },
  {
    title: "Thực trạng & Thách thức",
    subtitle: "Tại sao chúng ta cần thay đổi?",
    content: "Quy trình thủ công gây ra nhiều bất cập trong việc theo dõi tiến độ và lưu trữ thông tin.",
    icon: <Users className="w-20 h-20" />,
    color: "bg-amber-500",
    points: [
      "Quản lý qua giấy tờ, Zalo dễ trôi tin",
      "Khó khăn trong việc báo cáo tổng hợp",
      "Thiếu công cụ nhắc việc tự động"
    ]
  },
  {
    title: "Giải pháp chúng tôi mang lại",
    subtitle: "Số hóa mọi quy trình nghiệp vụ",
    content: "Ứng dụng công nghệ hiện đại để tự động hóa các khâu quản lý từ nhân sự đến công việc chuyên môn.",
    icon: <Zap className="w-20 h-20" />,
    color: "bg-emerald-500",
    points: [
      "Quản lý nhân sự chi tiết",
      "Giao việc và theo dõi tiến độ thời gian thực",
      "Hệ thống báo cáo thông minh, chính xác"
    ]
  },
  {
    title: "Các tính năng cốt lõi",
    subtitle: "Công cụ mạnh mẽ cho cán bộ",
    content: "Trang bị đầy đủ các module cần thiết cho hoạt động hàng ngày của UBND.",
    icon: <Monitor className="w-20 h-20" />,
    color: "bg-indigo-600",
    points: [
      "Dashboard: Thống kê số liệu trực quan",
      "Task: Quản lý công việc đa tầng",
      "Report: Tổng hợp báo cáo tự động"
    ]
  },
  {
    title: "Bảo mật & Tiện ích",
    subtitle: "An toàn dữ liệu - Sử dụng mọi lúc mọi nơi",
    content: "Hệ thống bảo mật đa tầng kết hợp với khả năng truy cập linh hoạt trên mọi thiết bị.",
    icon: <ShieldCheck className="w-20 h-20" />,
    color: "bg-slate-800",
    points: [
      "Đăng nhập an toàn qua tài khoản Google",
      "Phân quyền chi tiết theo chức vụ",
      "Hoạt động mượt mà trên Điện thoại & PC"
    ]
  },
  {
    title: "Tầm nhìn & Phát triển",
    subtitle: "Hướng tới Chính quyền số hiện đại",
    content: "Đây là bước đi quan trọng trong lộ trình hiện đại hóa hành chính tại xã CON CUÔNG.",
    icon: <BarChart3 className="w-20 h-20" />,
    color: "bg-rose-600",
    points: [
      "Nâng cao hiệu quả phục vụ nhân dân",
      "Chuyên nghiệp hóa đội ngũ cán bộ",
      "Sẵn sàng tích hợp các dịch vụ công"
    ]
  }
];

interface IntroSlidesProps {
  onClose: () => void;
}

export function IntroSlides({ onClose }: IntroSlidesProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const next = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Building2 size={18} />
          </div>
          <span className="font-bold text-slate-900 tracking-widest text-sm">UBND XÃ CON CUÔNG</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center p-8 md:p-16"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest">
                    Slide {currentSlide + 1} / {slides.length}
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-xl md:text-2xl font-light text-blue-600 tracking-wide">
                    {slides[currentSlide].subtitle}
                  </p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-slate-500 leading-relaxed font-light"
                >
                  {slides[currentSlide].content}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid gap-3"
                >
                  {slides[currentSlide].points.map((point, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                      <span className="text-slate-700 font-medium">{point}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="hidden lg:flex justify-center"
              >
                <div className={`p-20 rounded-[3rem] ${slides[currentSlide].color} text-white shadow-2xl transform hover:rotate-3 transition-transform duration-500`}>
                  {slides[currentSlide].icon}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="p-8 border-t border-slate-100 flex items-center justify-between">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`}
            />
          ))}
        </div>

        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            onClick={prev}
            disabled={currentSlide === 0}
            className="rounded-full px-6"
          >
            <ChevronLeft className="mr-2 w-5 h-5" /> Quay lại
          </Button>
          <Button 
            onClick={next}
            className="rounded-full px-8 bg-blue-600 hover:bg-blue-700"
          >
            {currentSlide === slides.length - 1 ? "Bắt đầu sử dụng" : "Tiếp theo"}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
