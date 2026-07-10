import { useState } from 'react';
import type { Theme } from '../../theme';
import type { QuestionList } from '../../types';

// Marcas diacríticas combinantes (acentos sueltos tras normalize('NFD')): U+0300–U+036F.
const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');

interface Props {
  t: Theme;
  list: QuestionList;
  locked: boolean;
  onRename: (name: string) => void;
  onAddQuestion: (text: string) => void;
  onUpdateQuestion: (i: number, text: string) => void;
  onDeleteQuestion: (i: number) => void;
  onSetPassword: (pwd: string | undefined) => void;
  onDeleteList: () => void;
}

export default function EditList({ t, list, locked, onRename, onAddQuestion, onUpdateQuestion, onDeleteQuestion, onSetPassword, onDeleteList }: Props) {
  const [newQ, setNewQ] = useState('');
  const [pwdForm, setPwdForm] = useState(false);
  const [pwdInput, setPwdInput] = useState('');

  const submitNewQ = () => {
    const v = newQ.trim();
    if (!v) return;
    onAddQuestion(v);
    setNewQ('');
  };

  const savePassword = () => {
    const v = pwdInput.trim();
    if (!v) return;
    onSetPassword(v);
    setPwdForm(false);
    setPwdInput('');
  };

  const removePassword = () => {
    onSetPassword(undefined);
    setPwdForm(false);
    setPwdInput('');
  };

  const hasPassword = !!list.password;

  const exportList = () => {
    // Sin password ni id: es contenido para compartir/respaldar, no una
    // copia exacta de la fila de la base de datos.
    const blob = new Blob([JSON.stringify({ name: list.name, color: list.color, questions: list.questions }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = list.name.trim().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    a.download = `${slug || 'lista'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="yn-scroll" style={{ flex: 1, padding: '16px 24px 30px' }}>
      <label style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: t.dim, fontWeight: 600 }}>Nombre de la lista</label>
      <input
        value={list.name}
        onChange={(e) => onRename(e.target.value)}
        style={{ width: '100%', marginTop: 8, padding: '14px 16px', borderRadius: t.radius, background: t.surface, border: `1px solid ${t.border}`, color: t.text, fontSize: 17, fontWeight: 600, fontFamily: t.fontHead }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '26px 0 10px' }}>
        <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: t.dim, fontWeight: 600 }}>Preguntas</span>
        <span style={{ fontSize: 13, color: t.dim }}>{list.questions.length} preguntas</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.questions.map((text, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px 6px 14px', borderRadius: 16, background: t.surface, border: `1px solid ${t.border}` }}>
            <span style={{ color: t.dim, fontSize: 13, flex: 'none' }}>Yo nunca he…</span>
            <input
              value={text}
              onChange={(e) => onUpdateQuestion(i, e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: '8px 4px', background: 'none', border: 'none', color: t.text, fontSize: 15 }}
            />
            <button onClick={() => onDeleteQuestion(i)} style={{ width: 32, height: 32, borderRadius: '50%', background: t.surface2, color: t.dim, fontSize: 16, flex: 'none' }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitNewQ(); }}
          placeholder="Añadir pregunta…"
          style={{ flex: 1, minWidth: 0, padding: '13px 16px', borderRadius: 16, background: t.surface, border: `1px solid ${t.border}`, color: t.text, fontSize: 15 }}
        />
        <button onClick={submitNewQ} style={{ padding: '0 20px', borderRadius: 16, background: t.heroGrad, color: t.accentText, fontWeight: 700, fontSize: 22, flex: 'none' }}>+</button>
      </div>

      {/* Exportar a JSON: no disponible en listas iniciales */}
      {!locked && (
        <button onClick={exportList} style={{ marginTop: 20, width: '100%', padding: 14, borderRadius: t.radius, background: t.surface, border: `1px solid ${t.border}`, color: t.text, fontWeight: 600, fontSize: 14 }}>
          ↓ Exportar lista (.json)
        </button>
      )}

      {/* Contraseña de acceso: no disponible en listas iniciales */}
      {!locked && (
        <div style={{ marginTop: 28, padding: '18px', borderRadius: t.radius, background: t.surface, border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: t.dim, fontWeight: 600, marginBottom: 12 }}>Contraseña de acceso</div>

          {!pwdForm ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 14, color: hasPassword ? t.text : t.dim }}>
                {hasPassword ? '••••••••' : 'Sin contraseña'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {hasPassword && (
                  <button onClick={removePassword} style={{ padding: '7px 14px', borderRadius: 99, background: 'none', border: `1px solid ${t.border}`, color: '#ff5a6a', fontWeight: 600, fontSize: 13 }}>
                    Eliminar
                  </button>
                )}
                <button onClick={() => { setPwdForm(true); setPwdInput(''); }} style={{ padding: '7px 14px', borderRadius: 99, background: t.surface2, color: t.text, fontWeight: 600, fontSize: 13 }}>
                  {hasPassword ? 'Cambiar' : 'Añadir'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="password"
                value={pwdInput}
                onChange={(e) => setPwdInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') savePassword(); }}
                placeholder="Nueva contraseña…"
                autoFocus
                style={{ width: '100%', padding: '12px 14px', borderRadius: 14, background: t.surface2, border: `1px solid ${t.border}`, color: t.text, fontSize: 15 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPwdForm(false)} style={{ flex: 1, padding: '10px', borderRadius: 14, background: 'none', border: `1px solid ${t.border}`, color: t.dim, fontWeight: 600, fontSize: 14 }}>
                  Cancelar
                </button>
                <button onClick={savePassword} style={{ flex: 1, padding: '10px', borderRadius: 14, background: t.heroGrad, color: t.accentText, fontWeight: 700, fontSize: 14 }}>
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {locked ? (
        <div style={{ marginTop: 14, width: '100%', padding: 14, borderRadius: t.radius, background: t.surface, textAlign: 'center', color: t.dim, fontSize: 13 }}>
          Esta es una lista inicial y no se puede eliminar
        </div>
      ) : (
        <button onClick={onDeleteList} style={{ marginTop: 14, width: '100%', padding: 14, borderRadius: t.radius, background: 'none', border: `1px solid ${t.border}`, color: '#ff5a6a', fontWeight: 600, fontSize: 14 }}>
          Eliminar esta lista
        </button>
      )}
    </div>
  );
}
