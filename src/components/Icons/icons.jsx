import React from 'react';

/*
  Set de íconos de línea, monocromos (heredan color vía currentColor).
  Reemplaza a los emojis del proyecto por una iconografía sobria y consistente,
  acorde a la identidad visual de Hygeia Nexus.
*/

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Svg = ({ size = 18, className, children, style }) => (
  <svg width={size} height={size} className={className} style={style} {...base}>
    {children}
  </svg>
);

export const IconPill = (props) => (
  <Svg {...props}>
    <rect x="3.2" y="9.2" width="17.6" height="7.2" rx="3.6" transform="rotate(-35 12 12)" />
    <line x1="9.3" y1="14.7" x2="14.7" y2="9.3" transform="rotate(-35 12 12)" />
  </Svg>
);

export const IconBell = (props) => (
  <Svg {...props}>
    <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.2 1.5 5.2H4.5S6 14 6 10Z" />
    <path d="M10 18.5a2 2 0 0 0 4 0" />
  </Svg>
);

export const IconHome = (props) => (
  <Svg {...props}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9h12v-9" />
    <path d="M10 19v-5h4v5" />
  </Svg>
);

export const IconBox = (props) => (
  <Svg {...props}>
    <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4Z" />
    <path d="M3.5 7.5 12 11.5l8.5-4" />
    <path d="M12 11.5v9" />
  </Svg>
);

export const IconFactory = (props) => (
  <Svg {...props}>
    <path d="M3.5 20.5V12l5 3V12l5 3V9l5 3v8.5Z" />
    <path d="M3.5 20.5h17" />
    <path d="M18.5 12V8" />
  </Svg>
);

export const IconReceipt = (props) => (
  <Svg {...props}>
    <path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3Z" />
    <line x1="8.5" y1="8" x2="15.5" y2="8" />
    <line x1="8.5" y1="11.5" x2="15.5" y2="11.5" />
    <line x1="8.5" y1="15" x2="13" y2="15" />
  </Svg>
);

export const IconClipboard = (props) => (
  <Svg {...props}>
    <rect x="5" y="4.5" width="14" height="16" rx="2" />
    <rect x="9" y="3" width="6" height="3" rx="1" />
    <line x1="8.2" y1="11" x2="15.8" y2="11" />
    <line x1="8.2" y1="14.5" x2="15.8" y2="14.5" />
    <line x1="8.2" y1="18" x2="12.5" y2="18" />
  </Svg>
);

export const IconChart = (props) => (
  <Svg {...props}>
    <line x1="4" y1="20" x2="20" y2="20" />
    <rect x="6" y="13" width="3" height="7" />
    <rect x="11" y="8.5" width="3" height="11.5" />
    <rect x="16" y="4.5" width="3" height="15.5" />
  </Svg>
);

export const IconAlertTriangle = (props) => (
  <Svg {...props}>
    <path d="M12 4 21 19.5H3Z" />
    <line x1="12" y1="10" x2="12" y2="14.2" />
    <circle cx="12" cy="16.8" r="0.18" fill="currentColor" stroke="none" />
    <line x1="12" y1="16.6" x2="12" y2="16.8" strokeWidth="2.4" />
  </Svg>
);

export const IconSearch = (props) => (
  <Svg {...props}>
    <circle cx="10.8" cy="10.8" r="6.3" />
    <line x1="15.5" y1="15.5" x2="20" y2="20" />
  </Svg>
);

export const IconRefresh = (props) => (
  <Svg {...props}>
    <path d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5L19.5 8" />
    <path d="M19.5 4.5V8H16" />
    <path d="M19.5 12a7.5 7.5 0 0 1-12.6 5.5L4.5 16" />
    <path d="M4.5 19.5V16H8" />
  </Svg>
);

export const IconPencil = (props) => (
  <Svg {...props}>
    <path d="M4 16.5 15.2 5.3a1.7 1.7 0 0 1 2.4 0l1.1 1.1a1.7 1.7 0 0 1 0 2.4L7.5 20l-4 1Z" />
    <line x1="13.5" y1="7" x2="17" y2="10.5" />
  </Svg>
);

export const IconTrash = (props) => (
  <Svg {...props}>
    <path d="M5 7h14" />
    <path d="M9.5 7V5.2a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
    <path d="M6.5 7 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4A1.5 1.5 0 0 0 16.7 19L17.5 7" />
    <line x1="10.2" y1="10.5" x2="10.2" y2="16.7" />
    <line x1="13.8" y1="10.5" x2="13.8" y2="16.7" />
  </Svg>
);

export const IconShield = (props) => (
  <Svg {...props}>
    <path d="M12 3.5 19 6.3v5.4c0 4.3-2.9 7.2-7 8.8-4.1-1.6-7-4.5-7-8.8V6.3Z" />
    <path d="M9 12.1l2 2 4-4.2" />
  </Svg>
);

export const IconArrowUp = (props) => (
  <Svg {...props}>
    <line x1="12" y1="19" x2="12" y2="5.5" />
    <path d="M6.5 10.5 12 5l5.5 5.5" />
  </Svg>
);

export const IconCart = (props) => (
  <Svg {...props}>
    <path d="M3.5 4.5h2l2.2 11.3a1.6 1.6 0 0 0 1.6 1.3h7.6a1.6 1.6 0 0 0 1.6-1.3l1.3-7.3H6.3" />
    <circle cx="10" cy="20" r="1.1" />
    <circle cx="17" cy="20" r="1.1" />
  </Svg>
);

export const IconNote = (props) => (
  <Svg {...props}>
    <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="11.5" x2="16" y2="11.5" />
    <line x1="8" y1="15" x2="13" y2="15" />
  </Svg>
);

export const IconUsers = (props) => (
  <Svg {...props}>
    <circle cx="9" cy="8.3" r="3" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M15.5 6a3 3 0 0 1 0 5.8" />
    <path d="M15.5 14c2.6 0.3 4.5 2.1 4.5 5" />
  </Svg>
);

export const IconX = (props) => (
  <Svg {...props}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </Svg>
);

export const IconEye = (props) => (
  <Svg {...props}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.6" />
  </Svg>
);
