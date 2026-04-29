export interface UserSettings {
  id: string;
  user_id: string;
  name: string;
  threshold: number;
  internals_per_sem: number;
  active_period: string;
  onboarded: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  initial_attended: number;
  initial_total: number;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  subject_id: string;
  date: string;
  status: 'present' | 'absent' | 'cancelled';
  reason?: string;
  period_type: string;
  period_label: string;
  created_at: string;
}

export interface ArchivedPeriod {
  id: string;
  user_id: string;
  period_label: string;
  snapshot: Record<string, { name: string; attended: number; total: number; percentage: number }>;
  reset_at: string;
}

export const PERIOD_LABELS: Record<string, string> = {
  internal_1: 'Internal 1',
  internal_2: 'Internal 2',
  internal_3: 'Internal 3',
  internal_4: 'Internal 4',
  internal_5: 'Internal 5',
  internal_6: 'Internal 6',
  semester: 'Semester',
};

export function getNextPeriod(current: string, maxInternals: number): string | null {
  const match = current.match(/^internal_(\d+)$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  if (num < maxInternals) return `internal_${num + 1}`;
  return 'semester';
}
