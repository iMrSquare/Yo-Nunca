import { useEffect, useRef, useState } from 'react';
import type { Card, QuestionList } from './types';
import { THEME } from './theme';
import { fetchLists, fetchChallenges, startGameRemote, recordQuestionRemote, recordChallengeRemote } from './storage';
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

const CHALLENGE_BASE_CHANCE = 0.05;
const CHALLENGE_CHANCE_STEP = 0.05;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [queue, setQueue] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState<'in' | 'out' | null>(null);
  const [lists, setLists] = useState<QuestionList[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [challengesEnabled, setChallengesEnabled] = useState(true);
  const [challengeChance, setChallengeChance] = useState(CHALLENGE_BASE_CHANCE);
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  const [challengeRule, setChallengeRule] = useState<{ idx: number; text: string } | null>(null);
  const gameRef = useRef<Promise<number | null>>(Promise.resolve(null));
  const usedChallengesRef = useRef<Set<string>>(new Set());

  useEffect(() => { fetchLists().then(setLists); }, []);
  useEffect(() => { fetchChallenges().then(setChallenges); }, []);

  const toggleCat = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const startGame = () => {
    const q = buildQueue(lists, selected);
    if (!q.length) return;
    const names = lists.filter((l) => selected[l.id]).map((l) => l.name.split(' ')[0]);
    gameRef.current = startGameRemote(names.join(' · '), challengesEnabled);
    usedChallengesRef.current = new Set();
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

      setChallengeRule((prev) => (prev && prev.idx === next ? prev : null));
      if (challengesEnabled && challenges.length && next < queue.length) {
        const available = challenges.filter((c) => !usedChallengesRef.current.has(c));
        if (available.length && Math.random() < challengeChance) {
          const text = available[Math.floor(Math.random() * available.length)];
          usedChallengesRef.current.add(text);
          setActiveChallenge(text);
          setChallengeRule({ idx: next, text });
          setChallengeChance(CHALLENGE_BASE_CHANCE);
          recordChallengeRemote(gameRef.current);
        } else {
          setChallengeChance((c) => Math.min(c + CHALLENGE_CHANCE_STEP, 1));
        }
      }
    }, 270);
  };

  const dismissChallenge = () => setActiveChallenge(null);

  return (
    <div style={{ height: '100%', background: t.bg, display: 'flex', justifyContent: 'center', alignItems: 'stretch', fontFamily: t.fontBody, color: t.text }}>
      <div style={{ width: '100%', maxWidth: 460, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
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
            challengesEnabled={challengesEnabled}
            onToggleChallenges={() => setChallengesEnabled((v) => !v)}
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
            onSetup={() => setScreen('setup')}
            activeChallenge={activeChallenge}
            onDismissChallenge={dismissChallenge}
            challengeRule={challengeRule?.idx === idx ? challengeRule.text : null}
          />
        )}
      </div>
    </div>
  );
}
