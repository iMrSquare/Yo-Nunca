export type Screen = 'home' | 'setup' | 'game' | 'admin';

export interface QuestionList {
  id: string;
  name: string;
  color: string;
  questions: string[];
  password?: string;
}

export interface RecentEntry {
  label: string;
  n: number;
  when: string;
}

export interface Stats {
  games: number;
  questions: number;
  byCat: Record<string, number>;
  recent: RecentEntry[];
}

export interface Card {
  text: string;
  cat: string;
  color: string;
  catId: string;
}
