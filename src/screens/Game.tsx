import { useRef, useState } from 'react';
import type { Theme } from '../theme';
import type { Card } from '../types';

interface Props {
  t: Theme;
  queue: Card[];
  idx: number;
  anim: 'in' | 'out' | null;
  onHome: () => void;
  onAdvance: () => void;
  onRestart: () => void;
  onSetup: () => void;
}

const SWIPE_THRESHOLD = 70;

export default function Game({ t, queue, idx, anim, onHome, onAdvance, onRestart, onSetup }: Props) {
  const total = queue.length;
  const playing = idx < total;
  const finished = total > 0 && idx >= total;
  const cur = queue[idx];
  const pos = Math.min(idx + 1, total);
  const progressPct = total ? `${(pos / total) * 100}%` : '0%';

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (anim) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !startRef.current) return;
    setDragX(e.clientX - startRef.current.x);
  };
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    startRef.current = null;
    // Un desplazamiento pequeño se trata como toque: también avanza.
    if (Math.abs(dragX) > SWIPE_THRESHOLD || Math.abs(dragX) < 10) onAdvance();
    setDragX(0);
  };

  let transform = 'none';
  let opacity = 1;
  let transition = 'transform .34s cubic-bezier(.2,.8,.2,1), opacity .34s';
  if (dragging) {
    transform = `translateX(${dragX}px) rotate(${dragX / 18}deg)`;
    opacity = 1 - Math.min(Math.abs(dragX) / 500, 0.4);
    transition = 'none';
  } else if (anim === 'out') {
    transform = 'translateX(-115%) rotate(-9deg)';
    opacity = 0;
    transition = 'transform .27s ease-in, opacity .27s';
  } else if (anim === 'in') {
    transform = 'translateX(115%) rotate(9deg)';
    opacity = 0;
    transition = 'none';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 24px 10px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onHome} style={{ width: 40, height: 40, borderRadius: '50%', background: t.surface, color: t.text, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>✕</button>
        <div style={{ flex: 1, height: 8, borderRadius: 99, background: t.surface, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: t.heroGrad, width: progressPct, transition: 'width .35s cubic-bezier(.2,.8,.2,1)' }} />
        </div>
        <div style={{ fontFamily: t.fontHead, fontWeight: 600, fontSize: 14, color: t.dim, flex: 'none', minWidth: 48, textAlign: 'right' }}>{pos}/{total}</div>
      </div>

      {playing && cur && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'pointer', userSelect: 'none', touchAction: 'pan-y' }}
        >
          <div style={{ width: '100%', transform, opacity, transition }}>
            <div style={{ position: 'relative', background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 30, padding: '40px 30px 34px', boxShadow: t.cardShadow, overflow: 'hidden' }}>
              <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 26, color: t.accent, letterSpacing: '.02em' }}>Yo nunca he…</div>
              <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 36, lineHeight: 1.12, marginTop: 8, letterSpacing: '-.01em', textWrap: 'pretty' as never }}>{cur.text}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 99, background: t.surface, fontSize: 12, fontWeight: 600, letterSpacing: '.04em', marginTop: 26 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: cur.color }} />{cur.cat}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 26, fontSize: 14, color: t.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>Toca o desliza para la siguiente</span><span style={{ fontSize: 18 }}>→</span>
            </div>
          </div>
        </div>
      )}

      {finished && (
        <div className="yn-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ fontSize: 90, fontWeight: 700, fontFamily: t.fontHead, lineHeight: 1, ...t.titleStyle }}>¡Fin!</div>
          <div style={{ fontSize: 17, color: t.dim, marginTop: 16, lineHeight: 1.5 }}>
            Habéis pasado por <b style={{ color: t.text }}>{total}</b> preguntas.<br />¿Otra ronda?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 34, width: '100%', maxWidth: 300 }}>
            <button onClick={onRestart} style={{ width: '100%', padding: 18, borderRadius: t.radius, background: t.heroGrad, color: t.accentText, fontFamily: t.fontHead, fontWeight: 700, fontSize: 17, boxShadow: t.btnShadow }}>
              Repetir con las mismas listas
            </button>
            <button onClick={onSetup} style={{ width: '100%', padding: 15, borderRadius: t.radius, background: t.surface, color: t.text, fontWeight: 600, fontSize: 15 }}>
              Cambiar listas
            </button>
            <button onClick={onHome} style={{ width: '100%', padding: 13, background: 'none', color: t.dim, fontWeight: 600, fontSize: 14 }}>
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
