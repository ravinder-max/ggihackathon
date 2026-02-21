import { useRef, useState } from 'react';

export default function AnimatedCard({ 
  children, 
  className = '', 
  lift = true,
  scale = false
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className={`relative transition-all duration-300 ease-out ${className} ${
        lift ? 'hover-lift' : ''
      } ${scale ? 'hover-scale' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered && scale ? 'scale(1.02)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
