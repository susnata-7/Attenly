import { supabase } from './supabase';
import type { UserSettings, Subject, AttendanceRecord, ArchivedPeriod } from './types';

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createUserSettings(settings: Omit<UserSettings, 'id' | 'created_at'>): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .insert(settings)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSubjects(userId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createSubject(subject: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .insert(subject)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getAttendanceRecords(userId: string, periodType?: string): Promise<AttendanceRecord[]> {
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (periodType) {
    query = query.eq('period_type', periodType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getSubjectRecords(subjectId: string, periodType?: string): Promise<AttendanceRecord[]> {
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('subject_id', subjectId)
    .order('date', { ascending: false });

  if (periodType) {
    query = query.eq('period_type', periodType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'created_at'>): Promise<AttendanceRecord> {
  const { data, error } = await supabase
    .from('attendance_records')
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
  const { data, error } = await supabase
    .from('attendance_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAttendanceRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getArchivedPeriods(userId: string): Promise<ArchivedPeriod[]> {
  const { data, error } = await supabase
    .from('archived_periods')
    .select('*')
    .eq('user_id', userId)
    .order('reset_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createArchivedPeriod(archive: Omit<ArchivedPeriod, 'id' | 'reset_at'>): Promise<ArchivedPeriod> {
  const { data, error } = await supabase
    .from('archived_periods')
    .insert(archive)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteArchivedPeriod(id: string): Promise<void> {
  const { error } = await supabase
    .from('archived_periods')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAllUserData(userId: string): Promise<void> {
  const { error: attError } = await supabase
    .from('attendance_records')
    .delete()
    .eq('user_id', userId);
  if (attError) throw attError;

  const { error: subError } = await supabase
    .from('subjects')
    .delete()
    .eq('user_id', userId);
  if (subError) throw subError;
}
