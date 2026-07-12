import { useEffect, useRef, useState } from 'react';
import type { QuestionList, Stats } from './types';
import { THEME } from './theme';
import { fetchLists, fetchStats, saveLists, fetchChallenges, saveChallenges, checkAdminPassword, deleteGameRemote } from './storage';
import { SEED_LIST_IDS } from './seed';
import Admin, { type AdminTab } from './screens/Admin/Admin';

const t = THEME;
const SESSION_KEY = 'yn_admin_ok';
const PALETTE = ['#5b8def', '#2bb673', '#ff5d8f', '#f5a623', '#9b5cff', '#ff7a45', '#ff2e6e', '#16b89a', '#e0ad63'];

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    if (checking) return;
    setChecking(true);
    const ok = await checkAdminPassword(value);
    setChecking(false);
    if (ok) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onUnlock();
    } else {
      setError(true);
      setValue('');
      setTimeout(() => setError(false), 1800);
    }
  };

  return (
    <div style={{ height: '100%', background: t.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: t.fontBody, color: t.text }}>
      <div style={{ width: '100%', maxWidth: 340, padding: '0 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ fontFamily: t.fontHead, fontWeight: 700, fontSize: 32, lineHeight: 1, ...t.titleStyle }}>Ajustes</div>
        <div style={{ fontSize: 14, color: t.dim, textAlign: 'center' }}>Introduce la contraseña para continuar</div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="Contraseña"
            autoFocus
            style={{
              width: '100%', padding: '16px 18px', borderRadius: t.radius,
              background: t.surface, border: `1.5px solid ${error ? '#ff5a6a' : t.border}`,
              color: t.text, fontSize: 16, outline: 'none',
              transition: 'border-color .2s',
            }}
          />
          {error && (
            <div style={{ fontSize: 13, color: '#ff5a6a', textAlign: 'center' }}>Contraseña incorrecta</div>
          )}
          <button
            onClick={submit}
            disabled={checking}
            style={{ width: '100%', padding: 16, borderRadius: t.radius, background: t.heroGrad, color: t.accentText, fontFamily: t.fontHead, fontWeight: 700, fontSize: 16, boxShadow: t.btnShadow, opacity: checking ? 0.7 : 1 }}
          >
            {checking ? 'Comprobando…' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRoot() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [adminTab, setAdminTab] = useState<AdminTab>('lists');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lists, setLists] = useState<QuestionList[] | null>(null);
  const [challenges, setChallenges] = useState<string[] | null>(null);
  const [stats, setStats] = useState<Stats>({ games: 0, questions: 0, challenges: 0, byCat: {}, recent: [] });
  const dirty = useRef(false);
  const dirtyChallenges = useRef(false);

  useEffect(() => {
    fetchLists().then((ls) => setLists((cur) => cur ?? ls));
    fetchChallenges().then((cs) => setChallenges((cur) => cur ?? cs));
    fetchStats().then(setStats);
  }, []);

  // Guarda en el servidor con un pequeño debounce, solo tras cambios del usuario
  useEffect(() => {
    if (!lists || !dirty.current) return;
    const id = setTimeout(() => { saveLists(lists); }, 500);
    return () => clearTimeout(id);
  }, [lists]);

  useEffect(() => {
    if (!challenges || !dirtyChallenges.current) return;
    const id = setTimeout(() => { saveChallenges(challenges); }, 500);
    return () => clearTimeout(id);
  }, [challenges]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const mutateLists = (fn: (ls: QuestionList[]) => QuestionList[]) => {
    dirty.current = true;
    setLists((ls) => (ls ? fn(ls) : ls));
  };

  const updateList = (id: string, fn: (l: QuestionList) => QuestionList) =>
    mutateLists((ls) => ls.map((l) => (l.id === id ? fn(l) : l)));

  const newList = () => {
    const id = 'c' + Date.now();
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    mutateLists((ls) => [...ls, { id, name: 'Mi lista', color, questions: [] }]);
    setEditingId(id);
  };

  const importList = (data: { name?: string; color?: string; questions: string[] }) => {
    const id = 'c' + Date.now();
    const color = data.color && /^#[0-9a-f]{3,8}$/i.test(data.color) ? data.color : PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const name = data.name?.trim() || 'Lista importada';
    mutateLists((ls) => [...ls, { id, name, color, questions: data.questions }]);
    setEditingId(id);
  };

  const mutateChallenges = (fn: (cs: string[]) => string[]) => {
    dirtyChallenges.current = true;
    setChallenges((cs) => (cs ? fn(cs) : cs));
  };

  const addChallenge = (text: string) => mutateChallenges((cs) => [...cs, text]);
  const updateChallenge = (i: number, text: string) => mutateChallenges((cs) => cs.map((c, j) => (j === i ? text : c)));
  const deleteChallenge = (i: number) => mutateChallenges((cs) => cs.filter((_, j) => j !== i));
  const importChallenges = (texts: string[]) => mutateChallenges(() => texts);

  const deleteList = () => {
    const id = editingId;
    if (!id || SEED_LIST_IDS.has(id)) return;
    mutateLists((ls) => ls.filter((l) => l.id !== id));
    setEditingId(null);
    setAdminTab('lists');
  };

  const deleteGame = (id: number) => {
    setStats((s) => ({ ...s, games: Math.max(0, s.games - 1), recent: s.recent.filter((r) => r.id !== id) }));
    deleteGameRemote(id).then(() => fetchStats().then(setStats));
  };

  const adminBack = () => {
    if (editingId) setEditingId(null);
    else window.location.href = '/';
  };

  if (!lists || !challenges) {
    return (
      <div style={{ height: '100%', background: t.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: t.fontBody, color: t.dim }}>
        Cargando…
      </div>
    );
  }

  return (
    <div style={{ height: '100%', background: t.bg, display: 'flex', justifyContent: 'center', alignItems: 'stretch', fontFamily: t.fontBody, color: t.text }}>
      <div style={{ width: '100%', maxWidth: 460, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <Admin
          t={t}
          lists={lists}
          challenges={challenges}
          stats={stats}
          adminTab={adminTab}
          editingId={editingId}
          onBack={adminBack}
          onTab={setAdminTab}
          onEditList={(id) => setEditingId(id)}
          onNewList={newList}
          onImportList={importList}
          onRename={(name) => editingId && updateList(editingId, (l) => ({ ...l, name }))}
          onAddQuestion={(text) => editingId && updateList(editingId, (l) => ({ ...l, questions: [...l.questions, text] }))}
          onUpdateQuestion={(i, val) => editingId && updateList(editingId, (l) => ({ ...l, questions: l.questions.map((q, j) => (j === i ? val : q)) }))}
          onDeleteQuestion={(i) => editingId && updateList(editingId, (l) => ({ ...l, questions: l.questions.filter((_, j) => j !== i) }))}
          onSetPassword={(pwd) => editingId && !SEED_LIST_IDS.has(editingId) && updateList(editingId, (l) => ({ ...l, password: pwd }))}
          onDeleteList={deleteList}
          editingLocked={!!editingId && SEED_LIST_IDS.has(editingId)}
          onAddChallenge={addChallenge}
          onUpdateChallenge={updateChallenge}
          onDeleteChallenge={deleteChallenge}
          onImportChallenges={importChallenges}
          onDeleteGame={deleteGame}
        />
      </div>
    </div>
  );
}
