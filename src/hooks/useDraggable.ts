import { useState, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableProps {
  initialPosition: Position;
  onPositionChange?: (position: Position) => void;
}

export const useDraggable = ({ initialPosition, onPositionChange }: UseDraggableProps) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement | null>(null);

  const handleMouseDown = (e: MouseEvent) => {
    if (elementRef.current && 
       (e.target === elementRef.current || 
        (e.target as HTMLElement).classList.contains('draggable-handle'))) {
      setIsDragging(true);
      const rect = elementRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && elementRef.current) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      
      setPosition(newPosition);
      onPositionChange?.(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    elementRef,
    handleMouseDown,
  };
};