interface EbinexLogoProps {
  width?: number;
  height?: number;
  className?: string;
  textColor?: string;
  accentColor?: string;
  showText?: boolean;
}

export default function EbinexLogo({
  width = 120,
  height = 40,
  className = "",
  textColor = "currentColor",
  accentColor = "rgb(1,219,151)",
  showText = true,
}: EbinexLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Symbol */}
      <g>
        {/* Chart lines */}
        <path
          d="M10 30L20 20L30 25L40 15"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* E shape */}
        <rect x="5" y="10" width="5" height="20" fill={accentColor} rx="1" />
        <rect x="5" y="10" width="15" height="4" fill={accentColor} rx="1" />
        <rect x="5" y="18" width="12" height="4" fill={accentColor} rx="1" />
        <rect x="5" y="26" width="15" height="4" fill={accentColor} rx="1" />
      </g>

      {/* Text */}
      {showText && (
        <g fill={textColor}>
          <path d="M50 15H55C57.7614 15 60 17.2386 60 20C60 22.7614 57.7614 25 55 25H50V15ZM55 22C56.1046 22 57 21.1046 57 20C57 18.8954 56.1046 18 55 18H53V22H55Z" />
          <path d="M62 15H65V22C65 23.1046 65.8954 24 67 24C68.1046 24 69 23.1046 69 22V15H72V22C72 24.7614 69.7614 27 67 27C64.2386 27 62 24.7614 62 22V15Z" />
          <path d="M74 15H77V25H74V15Z" />
          <path d="M79 15H82L86 20.5L90 15H93V25H90V19.5L86 24L82 19.5V25H79V15Z" />
          <path d="M95 15H105V18H102V25H98V18H95V15Z" />
          <path d="M107 15H110L114 25H111L110.5 23.5H106.5L106 25H103L107 15ZM107.5 21H109.5L108.5 18L107.5 21Z" />
        </g>
      )}
    </svg>
  );
}
