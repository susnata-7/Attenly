import { AttendanceRecord, Subject, Internal, Semester } from '../types/models';
import { StorageService } from './StorageService';
import { nanoid } from 'nanoid';

const STATUSES = ['Present', 'Absent', 'Cancelled'] as const;

type Status = typeof STATUSES[number];

export function calculateStats(
  records: AttendanceRecord[],
  goal: number = 75,
  semesterStartDate?: string,
  semesterEndDate?: string
): {
  total: number;
  present: number;
  absent: number;
  cancelled: number;
  attendancePercentage: number;
  safeToMiss: number;
  requiredForGoal: number;
  onTrack: boolean;
  status: 'SAFE' | 'WARN' | 'CRIT';
} {
  const filteredRecords = semesterStartDate && semesterEndDate
    ? records.filter(r => {
        const recordDate = new Date(r.date);
        const start = new Date(semesterStartDate);
        const end = new Date(semesterEndDate);
        return recordDate >= start && recordDate <= end;
      })
    : records;

  const total = filteredRecords.length;
  const cancelled = filteredRecords.filter(r => r.status === 'Cancelled').length;
  const present = filteredRecords.filter(r => r.status === 'Present').length;
  const absent = filteredRecords.filter(r => r.status === 'Absent').length;

  const denominator = total - cancelled;
  const attendancePercentage = denominator > 0 ? (present / denominator) * 100 : 0;

  const classesHeld = total - cancelled;
  const requiredForGoal = Math.max(0, Math.ceil((goal / 100) * classesHeld) - present);
  const safeToMiss = Math.max(0, present - Math.ceil((goal / 100) * classesHeld));

  const onTrack = requiredForGoal === 0 && safeToMiss >= 0;

  let status: 'SAFE' | 'WARN' | 'CRIT' = 'SAFE';
  if (attendancePercentage < goal) {
    status = 'CRIT';
  } else if (Math.abs(attendancePercentage - goal) <= 5) {
    status = 'WARN';
  }

  return {
    total,
    present,
    absent,
    cancelled,
    attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
    safeToMiss,
    requiredForGoal,
    onTrack,
    status,
  };
}

export function getInternalWiseStats(
  records: AttendanceRecord[],
  internals: Internal[],
  goal: number = 75,
  semesterStartDate?: string,
  semesterEndDate?: string
) {
  return internals.map(internal => {
    const internalRecords = records.filter(r => r.internalId === internal.id);

    const filteredRecords = semesterStartDate && semesterEndDate
      ? internalRecords.filter(r => {
          const recordDate = new Date(r.date);
          const start = new Date(semesterStartDate);
          const end = new Date(semesterEndDate);
          return recordDate >= start && recordDate <= end;
        })
      : internalRecords;

    const { total, present, cancelled, attendancePercentage } = calculateStats(filteredRecords, goal, semesterStartDate, semesterEndDate);

    let status = 'NOT_STARTED';
    if (filteredRecords.length > 0) {
      status = attendancePercentage >= goal ? 'COMPLETED' : 'IN_PROGRESS';
    }

    return {
      ...internal,
      total,
      present,
      cancelled,
      attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
      status,
    };
  });
}

export function getStatusColor(
  percentage: number,
  goal: number = 75,
  context: 'dashboard' | 'history' | 'statistics' = 'dashboard'
): {
  bg: string;
  text: string;
  border: string;
} {
  if (context === 'history') {
    if (percentage >= goal) return { bg: '#1b5e20', text: '#a5d6a7', border: '#2e7d32' };
    return { bg: '#b71c1c', text: '#ffcdd2', border: '#d32f2f' };
  }

  if (percentage < goal * 0.8) return { bg: '#ffb4ab', text: '#b71c1c', border: '#d32f2f' };
  if (percentage < goal) return { bg: '#ffb4ab', text: '#b71c1c', border: '#d32f2f' };
  return { bg: '#4caf50', text: '#1b5e20', border: '#2e7d32' };
}

export function getAttendanceStatus(
  attended: number,
  total: number,
  goal: number
): 'SAFE' | 'WARN' | 'CRIT' {
  if (total === 0) return 'SAFE';

  const percentage = (attended / total) * 100;

  if (percentage < goal) return 'CRIT';
  if (Math.abs(percentage - goal) <= 5) return 'WARN';
  return 'SAFE';
}

export function formatDate(date: string): string {
  const d = new Date(date);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${days[d.getDay()]}`;
}

export function getDaysUntil(targetDate: string): number {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}