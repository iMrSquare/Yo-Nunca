import type { CSSProperties } from 'react';

export interface Theme {
  bg: string;
  text: string;
  dim: string;
  surface: string;
  surface2: string;
  cardBg: string;
  border: string;
  accent: string;
  accent2: string;
  accentText: string;
  fontHead: string;
  fontBody: string;
  radius: string;
  heroGrad: string;
  cardShadow: string;
  btnShadow: string;
  titleStyle: CSSProperties;
  footerBg: string;
}

export const THEME: Theme = {
  bg: 'radial-gradient(125% 80% at 50% -8%, #1c0c33 0%, #070410 62%)',
  text: '#f3ecff', dim: 'rgba(243,236,255,.55)',
  surface: 'rgba(255,255,255,.06)', surface2: 'rgba(255,255,255,.11)',
  cardBg: 'linear-gradient(160deg, rgba(155,92,255,.16), rgba(33,230,193,.05))',
  border: 'rgba(255,255,255,.13)',
  accent: '#ff2e9a', accent2: '#21e6c1', accentText: '#0a0410',
  fontHead: "'Space Grotesk',sans-serif", fontBody: "'Space Grotesk',sans-serif",
  radius: '22px',
  heroGrad: 'linear-gradient(135deg,#ff2e9a 0%,#9b5cff 55%,#21e6c1 100%)',
  cardShadow: '0 26px 70px rgba(155,92,255,.34)',
  btnShadow: '0 6px 16px rgba(255,46,154,.32)',
  titleStyle: {
    background: 'linear-gradient(135deg,#ff2e9a,#9b5cff 55%,#21e6c1)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
  },
  footerBg: 'rgba(7,4,16,.72)',
};
