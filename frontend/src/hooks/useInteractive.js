import { useState, useEffect, useCallback, useRef } from 'react';

// Hook for mouse position tracking
export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
}

// Hook for element hover with magnetic effect
export function useMagneticEffect(ref, strength = 0.3) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;
    setPosition({ x, y });
  }, [ref, strength]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, handleMouseMove, handleMouseLeave]);

  return position;
}

// Hook for scroll animations
export function useScrollAnimation(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Hook for typing effect
export function useTypingEffect(text, speed = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
}

// Hook for counter animation
export function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const startCounting = useCallback(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return { count, isAnimating, startCounting };
}

// Hook for parallax effect
export function useParallax(speed = 0.5) {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const relativeScroll = scrolled - elementTop + window.innerHeight;
      setOffset(relativeScroll * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
}

// Hook for ripple effect
export function useRipple() {
  const createRipple = useCallback((event, element) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-effect 0.6s linear;
      pointer-events: none;
      left: ${x}px;
      top: ${y}px;
      width: 100px;
      height: 100px;
      margin-left: -50px;
      margin-top: -50px;
    `;

    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }, []);

  return createRipple;
}

// Hook for shake animation
export function useShake() {
  const [isShaking, setIsShaking] = useState(false);

  const shake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  return { isShaking, shake };
}

// Hook for glow effect following mouse
export function useGlowEffect(ref) {
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowPosition({ x, y });
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, [ref, handleMouseMove]);

  return glowPosition;
}
