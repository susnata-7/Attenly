import { AttendanceRecord, Subject, Internal, Semester } from '../types/models';
import { DatabaseService } from './DatabaseService';

export class StorageService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async init(): Promise<void> {
    await this.dbService.init();
  }

  async initializeWithDemoData(): Promise<void> {
    const now = new Date().toISOString();

    await this.dbService.withTransaction(async (tx) => {
      const semester: Semester = {
        id: 'semester_1',
        name: 'Semester 1',
        code: 'SEM_1',
        startDate: '2024-01-15',
        endDate: '2024-05-15',
        isActive: true,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      };

      await tx.executeAsync(
        'INSERT INTO semesters (id, name, code, start_date, end_date, is_active, is_archived, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          semester.id,
          semester.name,
          semester.code,
          semester.startDate,
          semester.endDate,
          semester.isActive ? 1 : 0,
          semester.isArchived ? 1 : 0,
          semester.createdAt,
          semester.updatedAt,
        ]
      );

      const subjects: Subject[] = [
        {
          id: 'subject_1',
          semesterId: 'semester_1',
          code: 'CS101',
          name: 'Introduction to Computer Science',
          attendanceGoal: 75,
          internal1StartDate: '2024-02-01',
          internal1EndDate: '2024-02-29',
          internal2StartDate: '2024-04-01',
          internal2EndDate: '2024-04-30',
          endSemesterStartDate: '2024-04-15',
          endSemesterEndDate: '2024-05-15',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'subject_2',
          semesterId: 'semester_1',
          code: 'MATH201',
          name: 'Mathematics II',
          attendanceGoal: 75,
          internal1StartDate: '2024-02-15',
          internal1EndDate: '2024-03-15',
          internal2StartDate: '2024-04-15',
          internal2EndDate: '2024-05-15',
          endSemesterStartDate: '2024-05-01',
          endSemesterEndDate: '2024-05-15',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'subject_3',
          semesterId: 'semester_1',
          code: 'ENG101',
          name: 'English Composition',
          attendanceGoal: 75,
          internal1StartDate: '2024-01-15',
          internal1EndDate: '2024-03-15',
          internal2StartDate: '2024-03-15',
          internal2EndDate: '2024-04-15',
          endSemesterStartDate: null,
          endSemesterEndDate: null,
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const subject of subjects) {
        await tx.executeAsync(
          'INSERT INTO subjects (id, semester_id, code, name, attendance_goal, internal1_start_date, internal1_end_date, internal2_start_date, internal2_end_date, end_semester_start_date, end_semester_end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            subject.id,
            subject.semesterId,
            subject.code,
            subject.name,
            subject.attendanceGoal,
            subject.internal1StartDate,
            subject.internal1EndDate,
            subject.internal2StartDate,
            subject.internal2EndDate,
            subject.endSemesterStartDate,
            subject.endSemesterEndDate,
            subject.createdAt,
            subject.updatedAt,
          ]
        );
      }

      const internals: Internal[] = [
        {
          id: 'internal_1',
          subjectId: 'subject_1',
          type: 'INTERNAL_01',
          name: 'INTERNAL 01',
          startDate: '2024-02-01',
          endDate: '2024-02-29',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'internal_2',
          subjectId: 'subject_1',
          type: 'INTERNAL_02',
          name: 'INTERNAL 02',
          startDate: '2024-04-01',
          endDate: '2024-04-30',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'internal_3',
          subjectId: 'subject_1',
          type: 'END_SEM_PROJ',
          name: 'END SEM PROJ',
          startDate: '2024-04-15',
          endDate: '2024-05-15',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'internal_4',
          subjectId: 'subject_2',
          type: 'INTERNAL_01',
          name: 'INTERNAL 01',
          startDate: '2024-02-15',
          endDate: '2024-03-15',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'internal_5',
          subjectId: 'subject_2',
          type: 'INTERNAL_02',
          name: 'INTERNAL 02',
          startDate: '2024-04-15',
          endDate: '2024-05-15',
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const internal of internals) {
        await tx.executeAsync(
          'INSERT INTO internals (id, subject_id, type, name, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            internal.id,
            internal.subjectId,
            internal.type,
            internal.name,
            internal.startDate,
            internal.endDate,
            internal.createdAt,
            internal.updatedAt,
          ]
        );
      }

      const attendanceRecords: AttendanceRecord[] = [
        {
          id: 'record_1',
          subjectId: 'subject_1',
          semesterId: 'semester_1',
          date: '2024-01-15',
          status: 'Present',
          internalId: 'internal_1',
          note: 'First class',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_2',
          subjectId: 'subject_1',
          semesterId: 'semester_1',
          date: '2024-01-17',
          status: 'Present',
          internalId: 'internal_1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_3',
          subjectId: 'subject_1',
          semesterId: 'semester_1',
          date: '2024-01-19',
          status: 'Absent',
          internalId: 'internal_1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_4',
          subjectId: 'subject_1',
          semesterId: 'semester_1',
          date: '2024-01-22',
          status: 'Present',
          internalId: 'internal_1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_5',
          subjectId: 'subject_2',
          semesterId: 'semester_1',
          date: '2024-01-16',
          status: 'Present',
          internalId: 'internal_4',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_6',
          subjectId: 'subject_2',
          semesterId: 'semester_1',
          date: '2024-01-18',
          status: 'Present',
          internalId: 'internal_4',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_7',
          subjectId: 'subject_2',
          semesterId: 'semester_1',
          date: '2024-01-23',
          status: 'Cancelled',
          internalId: 'internal_4',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_8',
          subjectId: 'subject_3',
          semesterId: 'semester_1',
          date: '2024-01-15',
          status: 'Present',
          internalId: 'internal_1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_9',
          subjectId: 'subject_3',
          semesterId: 'semester_1',
          date: '2024-01-20',
          status: 'Present',
          internalId: 'internal_1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'record_10',
          subjectId: 'subject_1',
          semesterId: 'semester_1',
          date: '2024-01-24',
          status: 'Present',
          internalId: 'internal_1',
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const record of attendanceRecords) {
        await tx.executeAsync(
          'INSERT INTO attendance_records (id, subject_id, semester_id, date, status, internal_id, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            record.id,
            record.subjectId,
            record.semesterId,
            record.date,
            record.status,
            record.internalId,
            record.note,
            record.createdAt,
            record.updatedAt,
          ]
        );
      }
    });
  }

  async getActiveSemesterId(): Promise<string | null> {
    const semesters = await this.dbService.getAllSemesters();
    const activeSemester = semesters.find(s => s.isActive);
    return activeSemester?.id || null;
  }

  async setActiveSemesterId(id: string): Promise<void> {
    await this.dbService.withTransaction(async (tx) => {
      await tx.executeAsync('UPDATE semesters SET is_active = 0');
      await tx.executeAsync('UPDATE semesters SET is_active = 1 WHERE id = ?', [id]);
    });
  }

  async getActiveSemester(): Promise<Semester | null> {
    const semesters = await this.dbService.getAllSemesters();
    return semesters.find(s => s.isActive) || null;
  }

  async getSubjectsForSemester(semesterId: string): Promise<Subject[]> {
    return await this.dbService.getSubjectsBySemesterId(semesterId);
  }

  async getInternalsForSubject(subjectId: string): Promise<Internal[]> {
    return await this.dbService.getInternalsBySubjectId(subjectId);
  }

  async getAttendanceForSubject(subjectId: string): Promise<AttendanceRecord[]> {
    return await this.dbService.getAttendanceRecordsBySubject(subjectId);
  }

  async getAttendanceForSemester(semesterId: string): Promise<AttendanceRecord[]> {
    return await this.dbService.getAttendanceRecordsBySemester(semesterId);
  }

  async findAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    const allRecords = await this.dbService.getAllAttendanceRecords();
    return allRecords.find(record => record.id === id) || null;
  }

  async generateInternalIdForAttendance(date: string, subjectId: string, semesterId: string): Promise<string | null> {
    const internals = await this.dbService.getInternalsBySubjectId(subjectId);

    for (const internal of internals) {
      const startDate = new Date(internal.startDate);
      const endDate = new Date(internal.endDate);
      const checkDate = new Date(date);

      if (checkDate >= startDate && checkDate <= endDate) {
        return internal.id;
      }
    }

    return null;
  }

  async addAttendanceRecord(
    subjectId: string,
    semesterId: string,
    date: string,
    status: 'Present' | 'Absent' | 'Cancelled',
    note?: string
  ): Promise<AttendanceRecord> {
    const id = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const internalId = await this.generateInternalIdForAttendance(date, subjectId, semesterId);

    const record: AttendanceRecord = {
      id,
      subjectId,
      semesterId,
      date,
      status,
      internalId,
      note,
      createdAt: now,
      updatedAt: now,
    };

    await this.dbService.createAttendanceRecord(record);
    return record;
  }

  async updateAttendanceRecord(
    id: string,
    updates: Partial<AttendanceRecord>
  ): Promise<void> {
    await this.dbService.updateAttendanceRecord(id, updates);
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    await this.dbService.deleteAttendanceRecord(id);
  }

  async getAttendanceStatsForSubject(
    subjectId: string,
    semesterId: string
  ): Promise<{ total: number; present: number; absent: number; cancelled: number }> {
    const records = await this.dbService.getAttendanceRecordsBySubject(subjectId);

    const filteredRecords = records.filter(r => r.semesterId === semesterId);
    const total = filteredRecords.length;
    const cancelled = filteredRecords.filter(r => r.status === 'Cancelled').length;
    const present = filteredRecords.filter(r => r.status === 'Present').length;
    const absent = filteredRecords.filter(r => r.status === 'Absent').length;

    return { total, present, absent, cancelled };
  }
}