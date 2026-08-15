// src/components/ui/LogoIcon.tsx
interface LogoIconProps {
  size?: number;
  className?: string;
  showBadge?: boolean;
}

export function LogoIcon({ size = 64, className = '', showBadge = true }: LogoIconProps) {
  const badgeSize = size * 0.35;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main circle background */}
      <circle cx="50" cy="50" r="45" fill="white" />
      
      {/* Inner shadow ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke="rgba(74,144,217,0.15)" 
        strokeWidth="4"
      />
      
      {/* "O" letter */}
      <text 
        x="50" 
        y="68" 
        fontFamily="'Poppins', sans-serif" 
        fontSize="55" 
        fontWeight="bold" 
        fill="#4A90D9" 
        textAnchor="middle"
      >
        O
      </text>
      
      {/* Speech bubble badge */}
      {showBadge && (
        <g transform={`translate(${85}, ${15})`}>
          {/* Badge background */}
          <circle cx="0" cy="0" r={badgeSize} fill="#F5A623" />
          
          {/* Speech emoji */}
          <text 
            x="0" 
            y={badgeSize * 0.3} 
            fontSize={badgeSize * 0.7} 
            textAnchor="middle" 
            dominantBaseline="central"
          >
            💬
          </text>
        </g>
      )}
    </svg>
  );
}