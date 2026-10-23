import { useRef, useState } from 'react';
import type { Theme } from '../../theme';
import type { QuestionList } from '../../types';

interface ImportedList {
  name?: string;
  color?: string;
  questions: string[];
}

interface Props {
  t: Theme;
  lists: QuestionList[];
  onEdit: (id: string) => void;
  onNew: () => void;
  onImport: (data: ImportedList) => void;
}

// Acepta tanto {name, color, questions} (lo que exporta la propia app) como
// un array de strings a secas, para poder importar listas hechas a mano.
function parseImport(raw: string): ImportedList | null {
  const data = JSON.parse(raw);
  const questions = Array.isArray(data) ? data : data?.questions;
  if (!Array.isArray(questions) || !questions.every((q) => typeof q === 'string') || !questions.length) return null;
  if (Array.isArray(data)) return { questions };
  return { name: typeof data.name === 'string' ? data.name : undefined, color: typeof data.color === 'string' ? data.color : undefined, questions };
}

export default function ListsTab({ t, lists, onEdit, onNew, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

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

  return (
    <div className="yn-scroll" style={{ flex: 1, padding: '16px 24px 30px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <button onClick={onNew} style={{ flex: 1, padding: 16, borderRadius: t.radius, border: `1.5px dashed ${t.border}`, background: 'none', color: t.accent, fontWeight: 700, fontSize: 15, fontFamily: t.fontHead }}>
            +  Nueva lista
          </button>
          <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: 16, borderRadius: t.radius, border: `1.5px dashed ${t.border}`, background: 'none', color: t.dim, fontWeight: 700, fontSize: 15, fontFamily: t.fontHead }}>
            ↑ Importar JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} style={{ display: 'none' }} />
        </div>
        {error && (
          <div style={{ fontSize: 13, color: '#ff5a6a', textAlign: 'center' }}>
            El archivo no tiene un formato válido (se espera una lista de preguntas)
          </div>
        )}
        {lists.map((row) => (
          <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: t.radius, background: t.surface, border: `1px solid ${t.border}` }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: row.color, flex: 'none' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: t.fontHead, fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</div>
              <div style={{ fontSize: 12, color: t.dim, marginTop: 2 }}>{row.questions.length} preguntas</div>
            </div>
            <button onClick={() => onEdit(row.id)} style={{ padding: '9px 16px', borderRadius: 99, background: t.surface2, color: t.text, fontWeight: 600, fontSize: 13, flex: 'none' }}>
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
