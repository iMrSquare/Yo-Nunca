import { useState } from 'react';
import type { Theme } from '../theme';
import type { QuestionList } from '../types';

interface Props {
  t: Theme;
  lists: QuestionList[];
  selected: Record<string, boolean>;
  onToggle: (id: string) => void;
  onBack: () => void;
  onStart: () => void;
  challengesEnabled: boolean;
  onToggleChallenges: () => void;
}

function LockIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" style={{ flex: 'none' }}>
      <rect x="1" y="5.5" width="9" height="7" rx="1.5" fill={color} />
      <path d="M3 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Setup({ t, lists, selected, onToggle, onBack, onStart, challengesEnabled, onToggleChallenges }: Props) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ id: string; name: string; color: string } | null>(null);
  const [modalPwd, setModalPwd] = useState('');
  const [modalError, setModalError] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const selectedCount = lists.filter((l) => selected[l.id]).length;
  const totalQuestions = lists.reduce((n, l) => n + (selected[l.id] ? l.questions.length : 0), 0);
  const canStart = selectedCount > 0 && totalQuestions > 0;

  const handleToggle = (list: QuestionList) => {
    const isLocked = !!list.password;
    const isUnlocked = unlockedIds.has(list.id);
    const isOn = !!selected[list.id];
    if (isLocked && !isUnlocked && !isOn) {
      setModal({ id: list.id, name: list.name, color: list.color });
      setModalPwd('');
      setModalError(false);
    } else {
      onToggle(list.id);
    }
  };

  const submitModal = () => {
    if (!modal) return;
    const list = lists.find((l) => l.id === modal.id);
    if (modalPwd === list?.password) {
      setUnlockedIds((prev) => new Set([...prev, modal.id]));
      onToggle(modal.id);
      setModal(null);
    } else {
      setModalError(true);
      setModalPwd('');
      setTimeout(() => setModalError(false), 1800);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '22px 24px 8px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{ width: 42, height: 42, borderRadius: '50%', background: t.surface, color: t.text, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>‹</button>
        <div>
          <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 24, lineHeight: 1 }}>Elige tus listas</div>
          <div style={{ fontSize: 13, color: t.dim, marginTop: 3 }}>Se barajan juntas, sin repetir</div>
        </div>
      </div>

      <div className="yn-scroll" style={{ flex: 1, padding: '14px 24px 140px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {lists.map((cat) => {
            const on = !!selected[cat.id];
            const isLocked = !!cat.password && !unlockedIds.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleToggle(cat)}
                style={{
                  display: 'flex', flexDirection: 'column', padding: '12px 12px', borderRadius: t.radius, textAlign: 'left', transition: 'all .15s',
                  background: on ? t.surface2 : t.surface,
                  border: `1.5px solid ${on ? cat.color : t.border}`,
                  boxShadow: on ? `0 8px 24px ${cat.color}33` : 'none',
                  color: t.text,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: cat.color, flex: 'none' }} />
                  {isLocked && !on
                    ? <LockIcon color={t.dim} />
                    : <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: t.accentText, background: cat.color, opacity: on ? 1 : 0, transition: 'opacity .15s' }}>✓</span>
                  }
                </div>
                <div style={{ fontFamily: t.fontHead, fontWeight: 600, fontSize: 14, lineHeight: 1.15, textAlign: 'left', marginTop: 9 }}>{cat.name}</div>
                <div style={{ fontSize: 11, color: t.dim, textAlign: 'left', marginTop: 3 }}>{cat.questions.length} preguntas</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '14px 16px', borderRadius: t.radius, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: t.fontHead, fontWeight: 600, fontSize: 14 }}>Retos</span>
            <button
              onClick={() => setInfoOpen(true)}
              style={{ width: 18, height: 18, borderRadius: '50%', background: t.surface2, color: t.dim, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
              aria-label="Qué son los retos"
            >
              i
            </button>
          </div>
          <button
            onClick={onToggleChallenges}
            aria-pressed={challengesEnabled}
            style={{
              width: 46, height: 27, borderRadius: 99, padding: 3, flex: 'none', transition: 'background .2s',
              background: challengesEnabled ? t.heroGrad : t.surface2,
              display: 'flex', justifyContent: challengesEnabled ? 'flex-end' : 'flex-start',
            }}
          >
            <span style={{ width: 21, height: 21, borderRadius: '50%', background: '#fff', display: 'block' }} />
          </button>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 24px', paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))', background: t.footerBg, borderTop: `1px solid ${t.border}`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: t.dim }}>{selectedCount} listas seleccionadas</span>
          <span style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 18, color: t.accent }}>{totalQuestions} preguntas</span>
        </div>
        <button
          onClick={onStart}
          disabled={!canStart}
          className={canStart ? 'yn-btn-glow' : undefined}
          style={{
            width: '100%', padding: 19, borderRadius: t.radius, fontFamily: t.fontHead, fontWeight: 700, fontSize: 18, transition: 'all .2s',
            background: canStart ? undefined : t.surface,
            color: canStart ? t.accentText : t.dim,
            boxShadow: canStart ? t.btnShadow : 'none',
            opacity: canStart ? 1 : 0.6,
          }}
        >
          Barajar y empezar
        </button>
      </div>

      {/* Modal contraseña */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(6px)', zIndex: 10 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 340, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 28, padding: '28px 24px', boxShadow: t.cardShadow }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: modal.color, flex: 'none' }} />
              <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 20 }}>{modal.name}</div>
            </div>
            <div style={{ fontSize: 14, color: t.dim, marginBottom: 20 }}>Esta lista está protegida. Introduce la contraseña para añadirla.</div>
            <input
              type="password"
              value={modalPwd}
              onChange={(e) => setModalPwd(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitModal(); }}
              placeholder="Contraseña…"
              autoFocus
              style={{
                width: '100%', padding: '14px 16px', borderRadius: t.radius,
                background: t.surface, border: `1.5px solid ${modalError ? '#ff5a6a' : t.border}`,
                color: t.text, fontSize: 16, transition: 'border-color .2s',
              }}
            />
            {modalError && (
              <div style={{ fontSize: 13, color: '#ff5a6a', marginTop: 8 }}>Contraseña incorrecta</div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: 14, borderRadius: t.radius, background: t.surface, color: t.dim, fontWeight: 600, fontSize: 15 }}>
                Cancelar
              </button>
              <button onClick={submitModal} style={{ flex: 1, padding: 14, borderRadius: t.radius, background: t.heroGrad, color: t.accentText, fontWeight: 700, fontSize: 15, boxShadow: t.btnShadow }}>
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal explicativo de retos */}
      {infoOpen && (
        <div
          onClick={() => setInfoOpen(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(6px)', zIndex: 10 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 340, background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 28, padding: '28px 24px', boxShadow: t.cardShadow }}
          >
            <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 20, marginBottom: 6 }}>¿Qué son los retos?</div>
            <div style={{ fontSize: 14, color: t.dim, marginBottom: 20, lineHeight: 1.5 }}>
              De vez en cuando saltará una ventana con una regla especial (como beber el doble) para la siguiente pregunta.
            </div>
            <button onClick={() => setInfoOpen(false)} style={{ width: '100%', padding: 14, borderRadius: t.radius, background: t.heroGrad, color: t.accentText, fontWeight: 700, fontSize: 15, boxShadow: t.btnShadow }}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
