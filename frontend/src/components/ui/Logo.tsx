import React from 'react'

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  showText?: boolean
  textColorClass?: string
  textClassName?: string
}

export function LogoIcon({ size = 32, className, ...props }: { size?: number; className?: string; [key: string]: any }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Teal Rounded Rectangle (Top-Left) */}
      <rect
        x="10"
        y="10"
        width="60"
        height="60"
        rx="20"
        fill="#0fbba2"
      />
      {/* Purple Rounded Rectangle (Bottom-Right, overlapping) */}
      <rect
        x="30"
        y="30"
        width="60"
        height="60"
        rx="20"
        fill="#735bf2"
        fillOpacity="0.8"
      />
    </svg>
  )
}

export default function Logo({
  size = 32,
  showText = true,
  textColorClass = 'text-[--foreground]',
  textClassName = 'text-lg font-bold tracking-tight font-sans',
  className = '',
  ...props
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} {...props}>
      <LogoIcon size={size} />
      {showText && (
        <span className={`${textColorClass} ${textClassName}`}>
          FloFi
        </span>
      )}
    </div>
  )
}
