import { useRef, useState } from 'react';
import type { Theme } from '../../theme';

interface Props {
  t: Theme;
  challenges: string[];
  onAdd: (text: string) => void;
  onUpdate: (i: number, text: string) => void;
  onDelete: (i: number) => void;
  onImport: (texts: string[]) => void;
}

// Acepta tanto un array de strings a secas como {challenges: [...]} (lo que
// exporta la propia app), para poder importar listas de retos hechas a mano.
function parseImport(raw: string): string[] | null {
  const data = JSON.parse(raw);
  const texts = Array.isArray(data) ? data : data?.challenges;
  if (!Array.isArray(texts) || !texts.length || !texts.every((c) => typeof c === 'string' && c.trim())) return null;
  return texts;
}

export default function ChallengesTab({ t, challenges, onAdd, onUpdate, onDelete, onImport }: Props) {
  const [newC, setNewC] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  const submitNew = () => {
    const v = newC.trim();
    if (!v) return;
    onAdd(v);
    setNewC('');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = parseImport(await file.text());
      if (!parsed) throw new Error('shape');
      setError(false);
      onImport(parsed);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };

  const exportChallenges = () => {
    const blob = new Blob([JSON.stringify(challenges, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retos.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="yn-scroll" style={{ flex: 1, padding: '16px 24px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 0 14px' }}>
        <span style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: t.dim, fontWeight: 600 }}>Retos</span>
        <span style={{ fontSize: 13, color: t.dim }}>{challenges.length} retos</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {challenges.map((text, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px 6px 14px', borderRadius: 16, background: t.surface, border: `1px solid ${t.border}` }}>
            <input
              value={text}
              onChange={(e) => onUpdate(i, e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: '8px 4px', background: 'none', border: 'none', color: t.text, fontSize: 15 }}
            />
            <button onClick={() => onDelete(i)} style={{ width: 32, height: 32, borderRadius: '50%', background: t.surface2, color: t.dim, fontSize: 16, flex: 'none' }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={newC}
          onChange={(e) => setNewC(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitNew(); }}
          placeholder="Añadir reto…"
          style={{ flex: 1, minWidth: 0, padding: '13px 16px', borderRadius: 16, background: t.surface, border: `1px solid ${t.border}`, color: t.text, fontSize: 15 }}
        />
        <button onClick={submitNew} style={{ padding: '0 20px', borderRadius: 16, background: t.heroGrad, color: t.accentText, fontWeight: 700, fontSize: 22, flex: 'none' }}>+</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button onClick={exportChallenges} style={{ flex: 1, padding: 16, borderRadius: t.radius, border: `1.5px dashed ${t.border}`, background: 'none', color: t.dim, fontWeight: 700, fontSize: 15, fontFamily: t.fontHead }}>
          ↓ Exportar JSON
        </button>
        <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: 16, borderRadius: t.radius, border: `1.5px dashed ${t.border}`, background: 'none', color: t.accent, fontWeight: 700, fontSize: 15, fontFamily: t.fontHead }}>
          ↑ Importar JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} style={{ display: 'none' }} />
      </div>
      {error && (
        <div style={{ fontSize: 13, color: '#ff5a6a', textAlign: 'center', marginTop: 10 }}>
          El archivo no tiene un formato válido (se espera una lista de retos)
        </div>
      )}
    </div>
  );
}
