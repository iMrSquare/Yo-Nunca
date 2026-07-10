import type { Theme } from '../../theme';
import type { QuestionList, Stats } from '../../types';
import ListsTab from './ListsTab';
import EditList from './EditList';
import StatsTab from './StatsTab';
import AboutTab from './AboutTab';

export type AdminTab = 'lists' | 'stats' | 'about';

interface Props {
  t: Theme;
  lists: QuestionList[];
  stats: Stats;
  adminTab: AdminTab;
  editingId: string | null;
  onBack: () => void;
  onTab: (tab: AdminTab) => void;
  onEditList: (id: string) => void;
  onNewList: () => void;
  onRename: (name: string) => void;
  onAddQuestion: (text: string) => void;
  onUpdateQuestion: (i: number, text: string) => void;
  onDeleteQuestion: (i: number) => void;
  onSetPassword: (pwd: string | undefined) => void;
  onDeleteList: () => void;
  editingLocked: boolean;
}

export default function Admin({
  t, lists, stats, adminTab, editingId, onBack, onTab, onEditList, onNewList,
  onRename, onAddQuestion, onUpdateQuestion, onDeleteQuestion, onSetPassword, onDeleteList, editingLocked,
}: Props) {
  const editing = lists.find((l) => l.id === editingId) || null;
  const showTabs = !editing;
  const mkTab = (active: boolean): React.CSSProperties => ({
    padding: '10px 14px', borderRadius: 99, fontWeight: 600, fontSize: 13.5, fontFamily: t.fontBody,
    background: active ? t.heroGrad : t.surface,
    color: active ? t.accentText : t.dim,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '22px 24px 6px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{ width: 42, height: 42, borderRadius: '50%', background: t.surface, color: t.text, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>‹</button>
        <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 24 }}>{editing ? 'Editar lista' : 'Ajustes'}</div>
      </div>

      {showTabs && (
        <div style={{ padding: '14px 24px 4px', display: 'flex', gap: 8 }}>
          <button onClick={() => onTab('lists')} style={mkTab(adminTab === 'lists')}>Listas</button>
          <button onClick={() => onTab('stats')} style={mkTab(adminTab === 'stats')}>Estadísticas</button>
          <button onClick={() => onTab('about')} style={mkTab(adminTab === 'about')}>Acerca de</button>
        </div>
      )}

      {editing ? (
        <EditList
          t={t}
          list={editing}
          locked={editingLocked}
          onRename={onRename}
          onAddQuestion={onAddQuestion}
          onUpdateQuestion={onUpdateQuestion}
          onDeleteQuestion={onDeleteQuestion}
          onSetPassword={onSetPassword}
          onDeleteList={onDeleteList}
        />
      ) : adminTab === 'lists' ? (
        <ListsTab t={t} lists={lists} onEdit={onEditList} onNew={onNewList} />
      ) : adminTab === 'stats' ? (
        <StatsTab t={t} lists={lists} stats={stats} />
      ) : (
        <AboutTab t={t} />
      )}
    </div>
  );
}
