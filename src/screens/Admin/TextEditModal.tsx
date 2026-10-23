import { useState } from 'react';
import type { Theme } from '../../theme';

interface Props {
  t: Theme;
  title: string;
  prefix?: string;
  initial: string;
  placeholder: string;
  onSave: (text: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

// Editor a pantalla casi completa para preguntas y retos: en móvil un input de
// una línea dentro de la fila se quedaba corto para leer y escribir textos largos.
// Va anclado arriba (no centrado) para que el teclado de iOS no tape el texto.
export default function TextEditModal({ t, title, prefix, initial, placeholder, onSave, onDelete, onClose }: Props) {
  const [value, setValue] = useState(initial);
  const trimmed = value.trim();

  const save = () => {
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12vh 16px 16px', backdropFilter: 'blur(6px)', zIndex: 10 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: '#140b24', border: `1px solid ${t.border}`, borderRadius: 28, padding: '22px 20px 20px', boxShadow: t.cardShadow }}
      >
        <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 20, marginBottom: 14 }}>{title}</div>
        {prefix && <div style={{ fontSize: 14, color: t.dim, marginBottom: 8 }}>{prefix}</div>}
        {/* fontSize 16: por debajo, Safari iOS hace zoom al enfocar el campo */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } }}
          enterKeyHint="done"
          placeholder={placeholder}
          rows={4}
          autoFocus
          // Cursor al final: al editar casi siempre se retoca o amplía el final
          onFocus={(e) => { const n = e.target.value.length; e.target.setSelectionRange(n, n); }}
          style={{ width: '100%', padding: '14px 16px', borderRadius: 18, background: t.surface, border: `1px solid ${t.border}`, color: t.text, fontSize: 16, lineHeight: 1.45, fontFamily: t.fontBody, resize: 'none' }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: t.radius, background: t.surface, color: t.dim, fontWeight: 600, fontSize: 15 }}>
            Cancelar
          </button>
          <button onClick={save} disabled={!trimmed} style={{ flex: 1, padding: 14, borderRadius: t.radius, background: t.heroGrad, color: t.accentText, fontWeight: 700, fontSize: 15, opacity: trimmed ? 1 : 0.5 }}>
            Guardar
          </button>
        </div>
        {onDelete && (
          <button onClick={() => { onDelete(); onClose(); }} style={{ marginTop: 10, width: '100%', padding: 12, borderRadius: t.radius, background: 'none', border: '1px solid rgba(255,90,106,.4)', color: '#ff5a6a', fontWeight: 600, fontSize: 14 }}>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
