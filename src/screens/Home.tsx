import type { Theme } from '../theme';

interface Props {
  t: Theme;
  appName: string;
  onPlay: () => void;
}

export default function Home({ t, appName, onPlay }: Props) {
  return (
    <div className="yn-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '42px 30px 30px' }}>
      <div style={{ fontSize: 14, letterSpacing: '.32em', textTransform: 'uppercase', color: t.dim, fontWeight: 600 }}>El juego de</div>
      <h1 style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 74, lineHeight: 0.92, margin: '10px 0 0', letterSpacing: '-.02em', ...t.titleStyle }}>{appName}</h1>
      <div style={{ marginTop: 18, fontSize: 17, lineHeight: 1.5, color: t.dim, maxWidth: 300 }}>
        Elige tus listas, mézclalas al azar y descubre quién tiene más secretos.
      </div>

      <div style={{ flex: 1, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 140, lineHeight: 1, fontWeight: 700, fontFamily: t.fontHead, animation: 'ynFloat 5s ease-in-out infinite', ...t.titleStyle }}>∞</div>
      </div>

      <button onClick={onPlay} style={{ width: '100%', padding: 21, borderRadius: t.radius, background: t.heroGrad, color: t.accentText, fontFamily: t.fontHead, fontWeight: 700, fontSize: 20, boxShadow: t.btnShadow }}>
        Jugar
      </button>
    </div>
  );
}
