import type { Theme } from '../../theme';
import type { QuestionList, Stats } from '../../types';

interface Props {
  t: Theme;
  lists: QuestionList[];
  stats: Stats;
}

export default function StatsTab({ t, lists, stats }: Props) {
  let topName = '—';
  let topVal = -1;
  lists.forEach((l) => {
    const v = stats.byCat[l.id] || 0;
    if (v > topVal) { topVal = v; topName = l.name.split(' ')[0]; }
  });

  const statTiles = [
    { label: 'Partidas jugadas', value: stats.games || 0, color: t.accent },
    { label: 'Preguntas mostradas', value: stats.questions || 0, color: t.accent2 },
    { label: 'Listas activas', value: lists.length, color: t.accent },
    { label: 'Lista favorita', value: topName, color: t.accent2 },
  ];

  const maxBar = Math.max(1, ...lists.map((l) => stats.byCat[l.id] || 0));
  const statBars = lists.map((l) => {
    const v = stats.byCat[l.id] || 0;
    return { name: l.name, color: l.color, value: v, pct: `${(v / maxBar) * 100}%` };
  });

  const recent = stats.recent || [];

  return (
    <div className="yn-scroll" style={{ flex: 1, padding: '16px 24px 30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {statTiles.map((s) => (
          <div key={s.label} style={{ padding: 18, borderRadius: t.radius, background: t.surface, border: `1px solid ${t.border}` }}>
            <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 32, lineHeight: 1, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: t.dim, marginTop: 7, lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: t.dim, fontWeight: 600, margin: '28px 0 14px' }}>Uso por lista</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {statBars.map((b) => (
          <div key={b.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{b.name}</span>
              <span style={{ color: t.dim }}>{b.value}</span>
            </div>
            <div style={{ height: 10, borderRadius: 99, background: t.surface, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: b.color, width: b.pct, transition: 'width .5s' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: t.dim, fontWeight: 600, margin: '28px 0 12px' }}>Actividad reciente</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recent.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 16, background: t.surface, border: `1px solid ${t.border}` }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
              <div style={{ fontSize: 12, color: t.dim, marginTop: 2 }}>{r.when}</div>
            </div>
            <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 16, color: t.accent, flex: 'none' }}>{r.n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
