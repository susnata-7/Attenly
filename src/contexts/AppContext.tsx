import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserSettings,
  getSubjects,
  getAttendanceRecords,
  getArchivedPeriods,
  createUserSettings,
  updateUserSettings,
  createSubject as dbCreateSubject,
  deleteSubject as dbDeleteSubject,
  createAttendanceRecord as dbCreateRecord,
  updateAttendanceRecord as dbUpdateRecord,
  deleteAttendanceRecord as dbDeleteRecord,
  createArchivedPeriod,
  deleteArchivedPeriod as dbDeleteArchivedPeriod,
  deleteAllUserData,
} from '../lib/db';
import type { UserSettings, Subject, AttendanceRecord, ArchivedPeriod } from '../lib/types';
import { PERIOD_LABELS, getNextPeriod } from '../lib/types';

interface AppContextType {
  settings: UserSettings | null;
  subjects: Subject[];
  records: AttendanceRecord[];
  archives: ArchivedPeriod[];
  loading: boolean;
  refreshData: () => Promise<void>;
  saveSettings: (settings: Omit<UserSettings, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  addSubject: (name: string, initialAttended: number, initialTotal: number) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'created_at'>) => Promise<void>;
  editRecord: (id: string, updates: Partial<AttendanceRecord>) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  archiveAndResetInternal: () => Promise<void>;
  archiveAndResetSemester: () => Promise<void>;
  deleteArchive: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [archives, setArchives] = useState<ArchivedPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      const [s, sub, rec, arch] = await Promise.all([
        getUserSettings(user.id),
        getSubjects(user.id),
        getAttendanceRecords(user.id),
        getArchivedPeriods(user.id),
      ]);
      setSettings(s);
      setSubjects(sub);
      setRecords(rec);
      setArchives(arch);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setSettings(null);
      setSubjects([]);
      setRecords([]);
      setArchives([]);
      setLoading(false);
    }
  }, [user, refreshData]);

  const saveSettings = async (newSettings: Omit<UserSettings, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    if (settings) {
      const updated = await updateUserSettings(user.id, newSettings);
      setSettings(updated);
    } else {
      const created = await createUserSettings({ ...newSettings, user_id: user.id });
      setSettings(created);
    }
  };

  const addSubject = async (name: string, initialAttended: number, initialTotal: number) => {
    if (!user) return;
    const created = await dbCreateSubject({
      user_id: user.id,
      name,
      initial_attended: initialAttended,
      initial_total: initialTotal,
    });
    setSubjects((prev) => [...prev, created]);
  };

  const removeSubject = async (id: string) => {
    if (!user) return;
    await dbDeleteSubject(id);
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
  };

  const markAttendance = async (record: Omit<AttendanceRecord, 'id' | 'created_at'>) => {
    if (!user) return;
    const created = await dbCreateRecord(record);
    setRecords((prev) => [created, ...prev]);
  };

  const editRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
    if (!user) return;
    const updated = await dbUpdateRecord(id, updates);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const removeRecord = async (id: string) => {
    if (!user) return;
    await dbDeleteRecord(id);
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
  };

  const archiveAndResetInternal = async () => {
    if (!user || !settings) return;

    const snapshot: ArchivedPeriod['snapshot'] = {};
    for (const subject of subjects) {
      const subjectRecords = records.filter(
        (r) => r.subject_id === subject.id && r.period_type === settings.active_period
      );
      const presentCount = subjectRecords.filter((r) => r.status === 'present').length;
      const absentCount = subjectRecords.filter((r) => r.status === 'absent').length;
      const attended = subject.initial_attended + presentCount;
      const total = subject.initial_total + presentCount + absentCount;
      const percentage = total > 0 ? (attended / total) * 100 : 0;
      snapshot[subject.id] = {
        name: subject.name,
        attended,
        total,
        percentage: Math.round(percentage * 100) / 100,
      };
    }

    const nextPeriod = getNextPeriod(settings.active_period, settings.internals_per_sem);

    await createArchivedPeriod({
      user_id: user.id,
      period_label: PERIOD_LABELS[settings.active_period] || settings.active_period,
      snapshot,
    });

    const updatedSettings = await updateUserSettings(user.id, {
      active_period: nextPeriod || 'internal_1',
    });
    setSettings(updatedSettings);

    await refreshData();
  };

  const archiveAndResetSemester = async () => {
    if (!user || !settings) return;

    const snapshot: ArchivedPeriod['snapshot'] = {};
    for (const subject of subjects) {
      const subjectRecords = records.filter((r) => r.subject_id === subject.id);
      const presentCount = subjectRecords.filter((r) => r.status === 'present').length;
      const absentCount = subjectRecords.filter((r) => r.status === 'absent').length;
      const attended = subject.initial_attended + presentCount;
      const total = subject.initial_total + presentCount + absentCount;
      const percentage = total > 0 ? (attended / total) * 100 : 0;
      snapshot[subject.id] = {
        name: subject.name,
        attended,
        total,
        percentage: Math.round(percentage * 100) / 100,
      };
    }

    await createArchivedPeriod({
      user_id: user.id,
      period_label: 'Semester',
      snapshot,
    });

    await deleteAllUserData(user.id);

    const updatedSettings = await updateUserSettings(user.id, {
      active_period: 'internal_1',
    });
    setSettings(updatedSettings);
    setSubjects([]);
    setRecords([]);

    await refreshData();
  };

  const deleteArchive = async (id: string) => {
    if (!user) return;
    await dbDeleteArchivedPeriod(id);
    const updated = archives.filter((a) => a.id !== id);
    setArchives(updated);
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        subjects,
        records,
        archives,
        loading,
        refreshData,
        saveSettings,
        addSubject,
        removeSubject,
        markAttendance,
        editRecord,
        removeRecord,
        archiveAndResetInternal,
        archiveAndResetSemester,
        deleteArchive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
