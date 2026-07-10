import { useEffect, useRef, useState } from 'react';
import type { Card, QuestionList } from './types';
import { THEME } from './theme';
import { fetchLists, startGameRemote, recordQuestionRemote } from './storage';
import Home from './screens/Home';
import Setup from './screens/Setup';
import Game from './screens/Game';

type Screen = 'home' | 'setup' | 'game';

const APP_NAME = 'YO NUNCA';

function buildQueue(lists: QuestionList[], selected: Record<string, boolean>): Card[] {
  const out: Card[] = [];
  lists.forEach((l) => {
    if (selected[l.id]) {
      l.questions.forEach((q) => out.push({ text: q, cat: l.name, color: l.color, catId: l.id }));
    }
  });
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const t = THEME;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selected, setSelected] = useState<Record<string, boolean>>({ amigos: true, romantico: true, fiesta: true });
  const [queue, setQueue] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState<'in' | 'out' | null>(null);
  const [lists, setLists] = useState<QuestionList[]>([]);
  const gameRef = useRef<Promise<number | null>>(Promise.resolve(null));

  useEffect(() => { fetchLists().then(setLists); }, []);

  const toggleCat = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const startGame = () => {
    const q = buildQueue(lists, selected);
    if (!q.length) return;
    const names = lists.filter((l) => selected[l.id]).map((l) => l.name.split(' ')[0]);
    gameRef.current = startGameRemote(names.join(' · '));
    setQueue(q);
    setIdx(0);
    setAnim(null);
    setScreen('game');
  };

  const bump = (card: Card | undefined) => {
    if (!card) return;
    recordQuestionRemote(gameRef.current, card.catId);
  };

  const advance = () => {
    if (anim || idx >= queue.length) return;
    bump(queue[idx]);
    setAnim('out');
    setTimeout(() => {
      const next = idx + 1;
      setIdx(next);
      setAnim(next < queue.length ? 'in' : null);
      if (next < queue.length) {
        requestAnimationFrame(() => requestAnimationFrame(() => setAnim(null)));
      }
    }, 270);
  };

  const restart = () => {
    setQueue(buildQueue(lists, selected));
    setIdx(0);
    setAnim(null);
  };

  return (
    <div style={{ height: '100%', background: t.bg, display: 'flex', justifyContent: 'center', alignItems: 'stretch', fontFamily: t.fontBody, color: t.text }}>
      <div style={{ width: '100%', maxWidth: 460, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {screen === 'home' && (
          <Home t={t} appName={APP_NAME} onPlay={() => setScreen('setup')} />
        )}
        {screen === 'setup' && (
          <Setup
            t={t}
            lists={lists}
            selected={selected}
            onToggle={toggleCat}
            onBack={() => setScreen('home')}
            onStart={startGame}
          />
        )}
        {screen === 'game' && (
          <Game
            t={t}
            queue={queue}
            idx={idx}
            anim={anim}
            onHome={() => setScreen('home')}
            onAdvance={advance}
            onRestart={restart}
            onSetup={() => setScreen('setup')}
          />
        )}
      </div>
    </div>
  );
}
