import { useState, useEffect } from 'react';

export default function TypeWriter({ 
  text, 
  speed = 50, 
  delay = 0,
  className = '',
  onComplete = () => {}
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout;
    
    const startTyping = () => {
      setIsTyping(true);
      setDisplayedText('');
      let index = 0;

      const type = () => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
          timeout = setTimeout(type, speed);
        } else {
          setIsTyping(false);
          onComplete();
        }
      };

      type();
    };

    timeout = setTimeout(startTyping, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, onComplete]);

  // Blink cursor when not typing
  useEffect(() => {
    if (isTyping) {
      setShowCursor(true);
      return;
    }

    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [isTyping]);

  return (
    <span className={className}>
      {displayedText}
      <span 
        className={`inline-block w-0.5 h-5 ml-0.5 bg-current transition-opacity duration-100 ${
          showCursor ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ verticalAlign: 'middle' }}
      />
    </span>
  );
}

// Multi-text typewriter that cycles through texts
export function CycleTypeWriter({ 
  texts, 
  typeSpeed = 50, 
  deleteSpeed = 30,
  pauseTime = 2000,
  className = ''
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    let timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isDeleting) {
      if (displayedText === '') {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deleteSpeed);
      }
    } else {
      if (displayedText === currentText) {
        setIsPaused(true);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, typeSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, isPaused, textIndex, texts, typeSpeed, deleteSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayedText}
      <span className="inline-block w-0.5 h-5 ml-0.5 bg-current animate-pulse" style={{ verticalAlign: 'middle' }} />
    </span>
  );
}
