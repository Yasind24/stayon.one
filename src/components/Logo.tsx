import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        className="transform rotate-45"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="15"
          fill="url(#logoGradient)"
          className="drop-shadow-lg"
        />
      </svg>
      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        Stayon.one
      </span>
    </div>
  );
}