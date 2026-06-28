export interface Semester {
  id: string;
  name: string;
  code: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  semesterId: string;
  code: string;
  name: string;
  attendanceGoal?: number;
  internal1StartDate?: string;
  internal1EndDate?: string;
  internal2StartDate?: string;
  internal2EndDate?: string;
  endSemesterStartDate?: string;
  endSemesterEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Internal {
  id: string;
  subjectId: string;
  type: 'INTERNAL_01' | 'INTERNAL_02' | 'END_SEM_PROJ';
  name: string;
  startDate: string;
  endDate: string;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  semesterId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Cancelled';
  internalId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}