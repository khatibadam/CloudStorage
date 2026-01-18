import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.55 0.25 275)" />
          <stop offset="50%" stopColor="oklch(0.6 0.25 300)" />
          <stop offset="100%" stopColor="oklch(0.7 0.2 200)" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="oklch(0.55 0.25 275)"
            floodOpacity="0.3"
          />
        </filter>
      </defs>

      {/* Cloud shape */}
      <path
        d="M36 22c0-4.97-4.03-9-9-9-3.92 0-7.26 2.51-8.48 6.02C16.93 18.37 15.01 17 12.8 17 9.58 17 7 19.58 7 22.8c0 .4.04.79.11 1.17C5.27 24.9 4 26.81 4 29c0 3.31 2.69 6 6 6h27c3.31 0 6-2.69 6-6 0-2.76-1.86-5.08-4.4-5.78C38.85 22.73 39 22.13 39 21.5c0-.17-.01-.34-.02-.5H36z"
        fill="url(#cloudGradient)"
        filter="url(#shadow)"
      />

      {/* Upload arrow */}
      <g transform="translate(24, 26)">
        <path d="M0 -8L-5 -2H-2.5V4H2.5V-2H5L0 -8Z" fill="white" opacity="0.95" />
      </g>

      {/* Decorative dots */}
      <circle cx="13" cy="28" r="1.5" fill="white" opacity="0.6" />
      <circle cx="17" cy="31" r="1" fill="white" opacity="0.4" />
      <circle cx="32" cy="27" r="1.5" fill="white" opacity="0.6" />
      <circle cx="35" cy="30" r="1" fill="white" opacity="0.4" />
    </svg>
  );
}

const sizeClasses = {
  sm: {
    icon: "h-6 w-6",
    text: "text-lg",
  },
  md: {
    icon: "h-8 w-8",
    text: "text-2xl",
  },
  lg: {
    icon: "h-10 w-10",
    text: "text-3xl",
  },
};

export function Logo({
  className,
  size = "md",
  showText = true,
  href = "/",
}: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon className={sizeClasses[size].icon} />
      {showText && (
        <span className={cn("font-bold gradient-text", sizeClasses[size].text)}>
          CloudStorage
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}

export { LogoIcon };
