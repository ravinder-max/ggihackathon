import { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({ 
  end, 
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  triggerOnView = true
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!triggerOnView) {
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [triggerOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function - easeOutQuart
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref} className={`font-mono ${className}`}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Circular progress with animation
export function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 10,
  color = '#6366f1',
  className = ''
}) {
  const [progress, setProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// Linear progress bar with animation
export function LinearProgress({ 
  percentage, 
  height = 8,
  color = 'bg-gradient-to-r from-indigo-500 to-teal-500',
  className = ''
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div 
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000 ease-out relative`}
        style={{ width: `${progress}%` }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
