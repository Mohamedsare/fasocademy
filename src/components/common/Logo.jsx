import React from 'react';

const sizeClasses = {
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto',
  lg: 'h-10 w-auto',
};

export default function Logo({ size = 'md', zoom = 1 }) {
  return (
    <span
      className="inline-block origin-center"
      style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
    >
      <img
        src="/logo/logo.png"
        alt="FasoCademy"
        className={`${sizeClasses[size]} object-contain`}
      />
    </span>
  );
}