import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Building2, MousePointer2, Sparkles } from 'lucide-react';

interface LaunchCeremonyProps {
  onComplete: () => void;
  onClose: () => void;
}

export function LaunchCeremony({ onComplete, onClose }: LaunchCeremonyProps) {
  const [status, setStatus] = React.useState<'idle' | 'activating' | 'launched'>('idle');
  const [countdown, setCountdown] = React.useState(5);

  const handleActivate = () => {
    setStatus('activating');
    
    // Complex Firework Sequence
    const duration = 6 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        // Grand finale burst
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#3b82f6', '#fbbf24', '#ef4444', '#10b981'],
          startVelocity: 45
        });
        return clearInterval(interval);
      }

      // Random side bursts
      const particleCount = 40;
      confetti({ 
        particleCount, 
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#3b82f6', '#ffffff']
      });
      confetti({ 
        particleCount, 
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#3b82f6', '#ffffff']
      });

      // Random small bursts in center
      if (Math.random() > 0.5) {
        confetti({
          particleCount: 20,
          spread: 100,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#fbbf24', '#ffffff']
        });
      }
    }, 400);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('launched');
          setTimeout(() => {
            onComplete();
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#00051a] flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Background Layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Deep blue glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_#1e3a8a_0%,_#00051a_70%)] opacity-40" />
        
        {/* Starfield simulation */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: Math.random() }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>

        {/* Techno Grid */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* Activation Shockwaves */}
        <AnimatePresence>
          {status === 'activating' && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 8, opacity: [0, 0.2, 0] }}
                  transition={{ duration: 4, delay: i * 1.5, ease: "easeOut", repeat: Infinity }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-blue-400"
                />
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#3b82f6_0%,_transparent_60%)]"
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 text-center flex flex-col items-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.8)]">
            <Building2 size={20} />
          </div>
          <span className="text-xl font-medium text-white/90 tracking-[0.4em] uppercase">UBND XÃ YÊN THÀNH</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <h1 className="relative text-5xl md:text-7xl lg:text-9xl font-bold text-white tracking-tighter leading-tight font-heading">
                <span className="relative z-10">HỆ THỐNG</span>
                <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] mt-2">
                  QUẢN LÝ CÔNG VIỆC
                </span>
              </h1>
              
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-blue-300 font-medium tracking-[0.2em] uppercase text-sm md:text-base">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_white]" /> HIỆN ĐẠI</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_white]" /> KẾT NỐI</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_white]" /> HIỆU QUẢ</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_white]" /> BẢO MẬT</span>
              </div>
              
              <div className="pt-16 relative">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full"
                ></motion.div>
                <button
                  onClick={handleActivate}
                  className="relative group px-16 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-2xl font-black tracking-widest shadow-[0_0_50px_rgba(37,99,235,0.6)] transition-all overflow-hidden"
                >
                  <span className="relative z-10">KÍCH HOẠT HỆ THỐNG</span>
                  <motion.div 
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </button>
              </div>
              
              <div className="flex flex-col items-center gap-3 text-blue-400/50 mt-12">
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <MousePointer2 size={20} />
                </motion.div>
                <p className="text-sm font-medium tracking-wide">Xin mời lãnh đạo thực hiện nghi thức ra mắt hệ thống</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="launched"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-blue-400 opacity-20 blur-3xl rounded-full"
                />
                <motion.div
                  animate={{ 
                    rotate: 360,
                    boxShadow: [
                      '0 0 20px rgba(59,130,246,0.5)',
                      '0 0 60px rgba(59,130,246,0.8)',
                      '0 0 20px rgba(59,130,246,0.5)'
                    ]
                  }}
                  transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, boxShadow: { duration: 2, repeat: Infinity } }}
                  className="relative mx-auto w-32 h-32 rounded-full border-2 border-blue-400 flex items-center justify-center text-blue-300"
                >
                  <Sparkles size={48} className="animate-pulse" />
                </motion.div>
              </div>
              
              <div className="space-y-6">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight font-heading"
                >
                  CHÍNH THỨC <span className="text-blue-400">RA MẮT</span> <br />
                  <span className="text-3xl md:text-5xl lg:text-6xl opacity-90 font-light mt-4 block">HỆ THỐNG QUẢN LÝ CÔNG VIỆC</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-blue-200/60 text-lg md:text-xl font-medium tracking-[0.2em]"
                >
                  KẾT NỐI - ĐIỀU HÀNH - PHỤC VỤ NHÂN DÂN
                </motion.p>
              </div>

              <div className="pt-10">
                <div className="w-64 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: "linear" }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                  />
                </div>
                <p className="mt-4 text-white/30 text-xs uppercase tracking-[0.5em]">Tự động khởi tạo Dashboard ({countdown}s)</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-white/20 hover:text-white/60 transition-colors p-2"
      >
        <span className="text-xs tracking-widest">THOÁT</span>
      </button>

      {/* Horizon Light */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40 shadow-[0_0_30px_#3b82f6]" />
    </div>
  );
}
