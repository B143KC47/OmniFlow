import React from 'react';

interface IconBaseProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
  className?: string;
}

const IconBase: React.FC<IconBaseProps> = ({
  children,
  size = 16,
  color = 'currentColor',
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
    >
      {children}
    </svg>
  );
};

export default IconBase;