import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = `
    font-normal tracking-[0.15em] uppercase
    transition-all duration-300
    border
  `;

  const variantStyles = {
    primary: `
      bg-white text-black border-white
      hover:bg-transparent hover:text-white
    `,
    outline: `
      bg-transparent text-white border-[#333333]
      hover:border-white
    `,
  };

  const sizeStyles = {
    sm: 'px-6 py-2 text-[11px]',
    md: 'px-8 py-3 text-[11px]',
    lg: 'px-10 py-4 text-[12px]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
