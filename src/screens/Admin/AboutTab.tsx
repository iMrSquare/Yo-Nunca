import type { Theme } from '../../theme';

const APP_VERSION = '1.0.0';
const AUTHOR_URL = 'https://imrsquare.com';
const GITHUB_URL = 'https://github.com/iMrSquare';

interface Props {
  t: Theme;
}

function HeartIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={color} style={{ flex: 'none' }}>
      <path d="M12 21s-6.7-4.35-9.33-8.2C1 10.1 1.5 6.5 4.6 4.9c2.1-1.1 4.4-.4 5.9 1.4l1.5 1.8 1.5-1.8c1.5-1.8 3.8-2.5 5.9-1.4 3.1 1.6 3.6 5.2 1.93 7.9C18.7 16.65 12 21 12 21z" />
    </svg>
  );
}

function GithubIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={color} style={{ flex: 'none' }}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.82 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

export default function AboutTab({ t }: Props) {
  return (
    <div className="yn-scroll" style={{ flex: 1, padding: '16px 24px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ marginTop: 30, fontSize: 64, lineHeight: 1, fontWeight: 700, fontFamily: t.fontHead, animation: 'ynFloat 5s ease-in-out infinite', ...t.titleStyle }}>∞</div>
      <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 32, marginTop: 16, letterSpacing: '-.02em', ...t.titleStyle }}>YO NUNCA</div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          style={{ padding: '6px 16px', borderRadius: 99, background: t.surface, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <GithubIcon color={t.dim} />
        </a>
        <div style={{ padding: '6px 16px', borderRadius: 99, background: t.surface, border: `1px solid ${t.border}`, fontSize: 13, fontWeight: 600, color: t.dim }}>
          v{APP_VERSION}
        </div>
      </div>

      <div style={{ marginTop: 44, fontSize: 14, color: t.dim, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>Hecho con</span>
        <HeartIcon color={t.accent} />
        <span>por</span>
        <a href={AUTHOR_URL} target="_blank" rel="noreferrer" style={{ color: t.text, fontWeight: 600, textDecoration: 'none' }}>
          imrsquare.com
        </a>
      </div>
    </div>
  );
}
