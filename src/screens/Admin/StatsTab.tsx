import { useState } from 'react';
import type { Theme } from '../../theme';
import type { QuestionList, Stats } from '../../types';

interface Props {
  t: Theme;
  lists: QuestionList[];
  stats: Stats;
  onDeleteGame: (id: number) => void;
}

export default function StatsTab({ t, lists, stats, onDeleteGame }: Props) {
  const [usageOpen, setUsageOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  let topName = '—';
  let topVal = -1;
  lists.forEach((l) => {
    const v = stats.byCat[l.id] || 0;
    if (v > topVal) { topVal = v; topName = l.name.split(' ')[0]; }
  });

  const statTiles = [
    { label: 'Partidas jugadas', value: stats.games || 0, color: t.accent, icon: null },
    { label: 'Preguntas mostradas', value: stats.questions || 0, color: t.accent2, icon: '🃏' },
    { label: 'Retos completados', value: stats.challenges || 0, color: t.accent, icon: '🔥' },
    { label: 'Lista favorita', value: topName, color: t.accent2, icon: null },
  ];

  const maxBar = Math.max(1, ...lists.map((l) => stats.byCat[l.id] || 0));
  const statBars = lists.map((l) => {
    const v = stats.byCat[l.id] || 0;
    return { name: l.name, color: l.color, value: v, pct: `${(v / maxBar) * 100}%` };
  });

  const recent = stats.recent || [];
  const confirmEntry = recent.find((r) => r.id === confirmId) || null;

  // El label de la partida guarda solo la primera palabra del nombre de cada
  // lista (ver App.tsx: buildQueue/startGame), así que hay que volver a
  // cruzarlo con `lists` para recuperar el nombre completo y el color.
  const findList = (shortName: string) => lists.find((l) => l.name.split(' ')[0] === shortName);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div className="yn-scroll" style={{ flex: 1, padding: '16px 24px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {statTiles.map((s) => (
            <div key={s.label} style={{ padding: 18, borderRadius: t.radius, background: t.surface, border: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                {s.icon && <span style={{ fontSize: 20 }}>{s.icon}</span>}
                <span style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 32, lineHeight: 1, color: s.color }}>{s.value}</span>
              </div>
              <div style={{ fontSize: 12.5, color: t.dim, marginTop: 7, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setUsageOpen((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', margin: '28px 0 0', padding: '0 0 14px', background: 'none' }}
        >
          <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: t.dim, fontWeight: 600 }}>Uso por lista</span>
          <span style={{ color: t.dim, fontSize: 12, transform: usageOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
        </button>

        {usageOpen && (
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
        )}

        <div style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: t.dim, fontWeight: 600, margin: '28px 0 12px' }}>Actividad reciente</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recent.length === 0 && (
            <div style={{ fontSize: 13, color: t.dim, textAlign: 'center', padding: '20px 0' }}>Todavía no hay partidas registradas</div>
          )}
          {recent.map((r) => {
            const shortNames = r.label.split(' · ').filter(Boolean);
            const matched = shortNames.map((name) => ({ name, list: findList(name) }));
            return (
              <div
                key={r.id}
                style={{
                  padding: '15px 16px 16px', borderRadius: t.radius, background: t.surface,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 7, flex: 1, minWidth: 0 }}>
                    <span style={{ padding: '5px 10px', borderRadius: 99, background: t.surface2, fontSize: 11.5, fontWeight: 600, color: t.dim }}>
                      {r.when}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: t.surface2, fontSize: 11.5, fontWeight: 600 }}>
                      🃏 <b style={{ color: t.text }}>{r.n}</b>
                    </span>
                    {r.challengesEnabled && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: `${t.accent}1f`, border: `1px solid ${t.accent}40`, fontSize: 11.5, fontWeight: 600 }}>
                        🔥 <b style={{ color: t.text }}>{r.challenges}</b>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setConfirmId(r.id)}
                    aria-label="Eliminar partida"
                    style={{ width: 26, height: 26, borderRadius: '50%', background: t.surface2, color: t.dim, fontSize: 13, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 13 }}>
                  {matched.length ? matched.map(({ name, list }, i) => (
                    <span key={`${name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px 5px 8px', borderRadius: 99, background: t.surface2, fontSize: 12, fontWeight: 600 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: list?.color || t.dim, flex: 'none' }} />
                      {list?.name || name}
                    </span>
                  )) : (
                    <span style={{ fontSize: 13, color: t.dim }}>Partida</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmación de borrado de partida */}
      {confirmEntry && (
        <div
          onClick={() => setConfirmId(null)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(6px)', zIndex: 10 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 340, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 28, padding: '28px 24px', boxShadow: t.cardShadow }}
          >
            <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 20, marginBottom: 6 }}>¿Eliminar esta partida?</div>
            <div style={{ fontSize: 14, color: t.dim, marginBottom: 20, lineHeight: 1.5 }}>
              Se borrará del historial de actividad reciente. Esta acción no se puede deshacer.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmId(null)} style={{ flex: 1, padding: 14, borderRadius: t.radius, background: t.surface, color: t.dim, fontWeight: 600, fontSize: 15 }}>
                Cancelar
              </button>
              <button
                onClick={() => { onDeleteGame(confirmEntry.id); setConfirmId(null); }}
                style={{ flex: 1, padding: 14, borderRadius: t.radius, background: 'none', border: '1px solid #ff5a6a', color: '#ff5a6a', fontWeight: 700, fontSize: 15 }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
