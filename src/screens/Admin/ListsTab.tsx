import type { Theme } from '../../theme';
import type { QuestionList } from '../../types';

interface Props {
  t: Theme;
  lists: QuestionList[];
  onEdit: (id: string) => void;
  onNew: () => void;
}

export default function ListsTab({ t, lists, onEdit, onNew }: Props) {
  return (
    <div className="yn-scroll" style={{ flex: 1, padding: '16px 24px 30px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        <button onClick={onNew} style={{ marginTop: 8, padding: 16, borderRadius: t.radius, border: `1.5px dashed ${t.border}`, background: 'none', color: t.accent, fontWeight: 700, fontSize: 15, fontFamily: t.fontHead }}>
          +  Nueva lista
        </button>
      </div>
    </div>
  );
}
