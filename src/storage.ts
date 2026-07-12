import type { QuestionList, Stats } from './types';
import { SEED_LISTS, SEED_CHALLENGES } from './seed';

interface StatsResponse {
  games: number;
  questions: number;
  challenges: number;
  byCat: Record<string, number>;
  recent: { id: number; label: string; n: number; challenges: number; challengesEnabled: boolean; startedAt: number }[];
}

function formatWhen(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (days <= 0) return `Hoy, ${time}`;
  if (days === 1) return `Ayer, ${time}`;
  if (days < 7) return `Hace ${days} días, ${time}`;
  return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}, ${time}`;
}

export async function fetchLists(): Promise<QuestionList[]> {
  try {
    const res = await fetch('/api/lists');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch {
    // sin conexión con el servidor — se juega con las listas de fábrica
  }
  return SEED_LISTS;
}

export async function saveLists(lists: QuestionList[]): Promise<boolean> {
  try {
    const res = await fetch('/api/lists', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lists),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchChallenges(): Promise<string[]> {
  try {
    const res = await fetch('/api/challenges');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch {
    // sin conexión con el servidor — se juega con los retos de fábrica
  }
  return SEED_CHALLENGES;
}

export async function saveChallenges(challenges: string[]): Promise<boolean> {
  try {
    const res = await fetch('/api/challenges', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(challenges),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchStats(): Promise<Stats> {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data: StatsResponse = await res.json();
      return {
        games: data.games ?? 0,
        questions: data.questions ?? 0,
        challenges: data.challenges ?? 0,
        byCat: data.byCat ?? {},
        recent: (data.recent ?? []).map((r) => ({
          id: r.id, label: r.label, n: r.n, challenges: r.challenges,
          challengesEnabled: r.challengesEnabled, when: formatWhen(r.startedAt),
        })),
      };
    }
  } catch {
    // sin conexión — estadísticas vacías
  }
  return { games: 0, questions: 0, challenges: 0, byCat: {}, recent: [] };
}

export async function startGameRemote(label: string, challengesEnabled: boolean): Promise<number | null> {
  try {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, challengesEnabled }),
    });
    if (res.ok) return (await res.json()).id ?? null;
  } catch {
    // sin conexión — la partida no se registra
  }
  return null;
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) return (await res.json()).ok === true;
  } catch {
    // sin conexión con el servidor
  }
  return false;
}

export function recordQuestionRemote(game: Promise<number | null>, catId: string): void {
  void game.then((id) => {
    if (id == null) return;
    return fetch(`/api/games/${id}/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catId }),
      keepalive: true,
    });
  }).catch(() => { /* sin conexión — se pierde el evento */ });
}

export function recordChallengeRemote(game: Promise<number | null>): void {
  void game.then((id) => {
    if (id == null) return;
    return fetch(`/api/games/${id}/challenge`, { method: 'POST', keepalive: true });
  }).catch(() => { /* sin conexión — se pierde el evento */ });
}

export async function deleteGameRemote(id: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}
