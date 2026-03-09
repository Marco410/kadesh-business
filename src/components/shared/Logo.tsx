"use client";

import Image from 'next/image';


export default function Logo({ size = 48, className = '' }: { size?: number, className?: string }) {
  return (
    <Image 
      src="/logo.png" 
      alt="KADESH logo" 
      width={size} 
      height={size} 
      className={`rounded-xl bg-transparent ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        objectFit: 'contain'
      }}
    />
  );
}
