// SocietyLogo.jsx
import * as React from 'react';

export default function SocietyLogo(props) {
  return (
    <svg
      width="50"
      height="40"
      viewBox="0 0 125 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // so you can pass className/style later if needed
    >
      <defs>
        <linearGradient id="gradA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3F51B5" />
          <stop offset="100%" stopColor="#5C6BC0" />
        </linearGradient>
        <linearGradient id="gradB" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5C6BC0" />
          <stop offset="100%" stopColor="#3F51B5" />
        </linearGradient>
        <filter
          id="shadow"
          x="-20%"
          y="-20%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="3"
            floodColor="#2c387e"
            floodOpacity="0.5"
          />
        </filter>
      </defs>

      <circle
        cx="40"
        cy="60"
        r="30"
        stroke="url(#gradA)"
        strokeWidth="8"
        fill="none"
        filter="url(#shadow)"
      />
      <circle
        cx="80"
        cy="60"
        r="30"
        stroke="url(#gradB)"
        strokeWidth="8"
        fill="none"
        filter="url(#shadow)"
      />
      <clipPath id="clipLeft">
        <rect x="40" y="30" width="40" height="60" />
      </clipPath>
      <circle
        cx="40"
        cy="60"
        r="30"
        stroke="#3F51B5"
        strokeWidth="8"
        fill="none"
        clipPath="url(#clipLeft)"
      />
      <circle
        cx="60"
        cy="95"
        r="30"
        stroke="url(#gradA)"
        strokeWidth="8"
        fill="none"
        filter="url(#shadow)"
      />
      <clipPath id="clipBottom">
        <rect x="30" y="60" width="60" height="40" />
      </clipPath>
      <circle
        cx="60"
        cy="95"
        r="30"
        stroke="#5C6BC0"
        strokeWidth="8"
        fill="none"
        clipPath="url(#clipBottom)"
      />
    </svg>
  );
}
