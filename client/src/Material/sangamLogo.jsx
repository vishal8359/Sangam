import '@fontsource/pacifico'; 

const SangamLogo = () => (
  <svg
    width="200"
    height="42"
    viewBox="0 0 200 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grapeGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7B3FBF" />
        <stop offset="50%" stopColor="#A271F7" />
        <stop offset="100%" stopColor="#D8B4FE" />
      </linearGradient>

      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="#5A2FA8" floodOpacity="0.6" />
      </filter>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#C3A0F7" floodOpacity="0.9" />
        </filter>

    </defs>

    <text
      x="53%"
      y="51%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="'Pacifico', cursive"
      fontWeight="800"
      fontSize="62"
      letterSpacing="3"
      fill="url(#grapeGradient)"
      filter="url(#shadow)"
      style={{ transform: 'rotate(0deg)', transformOrigin: 'center' }}
    >
      Sangam
    </text>

    <text
      x="50%"
      y="55%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="'Pacifico', cursive"
      fontWeight="700"
      fontSize="70"
      letterSpacing="1.5"
      fill="#F9F3FF"
      stroke="url(#grapeGradient)"
      strokeWidth="1.3"
      filter="url(#glow)"
      style={{ transform: 'rotate(0deg)', transformOrigin: 'center' }}
    >
      Sangam
    </text>
  </svg>
);

export default SangamLogo;
