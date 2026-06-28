import { Database, Transaction } from 'expo-sqlite';
import { Semester, Subject, Internal, AttendanceRecord } from '../types/models';

const DB_NAME = 'attenly.db';
const DB_VERSION = 1;

export class DatabaseService {
  private db: Database | null = null;

  async init(): Promise<void> {
    if (!this.db) {
      this.db = await Database.openDatabaseAsync(DB_NAME);
      await this.initDatabase();
    }
  }

  private async initDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      `CREATE TABLE IF NOT EXISTS semesters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        is_active INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        semester_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        attendance_goal INTEGER,
        internal1_start_date TEXT,
        internal1_end_date TEXT,
        internal2_start_date TEXT,
        internal2_end_date TEXT,
        end_semester_start_date TEXT,
        end_semester_end_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (semester_id) REFERENCES semesters(id)
      )`,

      `CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        semester_id TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Cancelled')),
        internal_id TEXT,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (semester_id) REFERENCES semesters(id),
        FOREIGN KEY (internal_id) REFERENCES internals(id)
      )`,

      `CREATE TABLE IF NOT EXISTS internals (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('INTERNAL_01', 'INTERNAL_02', 'END_SEM_PROJ')),
        name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      )`,

      `CREATE INDEX IF NOT EXISTS idx_attendance_records_subject_date ON attendance_records(subject_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_attendance_records_semester ON attendance_records(semester_id)`,
      `CREATE INDEX IF NOT EXISTS idx_attendance_records_internal_id ON attendance_records(internal_id)`,
    ];

    for (const query of queries) {
      await this.db.runAsync(query);
    }
  }

  async withTransaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.withTransactionAsync(async (tx) => {
      return await callback(tx);
    });
  }

  async getSemesterById(id: string): Promise<Semester | null> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.getAsync<Semester>('SELECT * FROM semesters WHERE id = ?', [id]);
    return result || null;
  }

  async getAllSemesters(): Promise<Semester[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<Semester>('SELECT * FROM semesters ORDER BY name');
  }

  async createSemester(semester: Semester): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
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
  }

  async updateSemester(id: string, updates: Partial<Semester>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'isActive' ? 'is_active' :
                     key === 'isArchived' ? 'is_archived' :
                     key === 'startDate' ? 'start_date' :
                     key === 'endDate' ? 'end_date' :
                     key;
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      values.push(id);
      await this.db.runAsync(
        `UPDATE semesters SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async getAllSubjects(): Promise<Subject[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<Subject>('SELECT * FROM subjects ORDER BY name');
  }

  async getSubjectsBySemesterId(semesterId: string): Promise<Subject[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<Subject>('SELECT * FROM subjects WHERE semester_id = ? ORDER BY name', [semesterId]);
  }

  async createSubject(subject: Subject): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
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

  async updateSubject(id: string, updates: Partial<Subject>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'attendanceGoal' ? 'attendance_goal' :
                     key === 'internal1StartDate' ? 'internal1_start_date' :
                     key === 'internal1EndDate' ? 'internal1_end_date' :
                     key === 'internal2StartDate' ? 'internal2_start_date' :
                     key === 'internal2EndDate' ? 'internal2_end_date' :
                     key === 'endSemesterStartDate' ? 'end_semester_start_date' :
                     key === 'endSemesterEndDate' ? 'end_semester_end_date' :
                     key === 'semesterId' ? 'semester_id' :
                     key === 'createdAt' ? 'created_at' :
                     key === 'updatedAt' ? 'updated_at' :
                     key;
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      values.push(id);
      await this.db.runAsync(
        `UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async deleteSubject(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM subjects WHERE id = ?', [id]);
  }

  async getAllInternals(): Promise<Internal[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<Internal>('SELECT * FROM internals');
  }

  async getInternalsBySubjectId(subjectId: string): Promise<Internal[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<Internal>('SELECT * FROM internals WHERE subject_id = ? ORDER BY type', [subjectId]);
  }

  async createInternal(internal: Internal): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
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

  async getAttendanceBySubjectAndDate(subjectId: string, date: string): Promise<AttendanceRecord | null> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.getAsync<AttendanceRecord>(
      'SELECT * FROM attendance_records WHERE subject_id = ? AND date = ?',
      [subjectId, date]
    );
    return result || null;
  }

  async getAttendanceRecordsBySubject(subjectId: string, limit?: number): Promise<AttendanceRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    let query = 'SELECT * FROM attendance_records WHERE subject_id = ? ORDER BY date DESC';
    const params: any[] = [subjectId];

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    return await this.db.getAllAsync<AttendanceRecord>(query, params);
  }

  async getAttendanceRecordsBySemester(semesterId: string): Promise<AttendanceRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<AttendanceRecord>(
      'SELECT * FROM attendance_records WHERE semester_id = ? ORDER BY date DESC',
      [semesterId]
    );
  }

  async createAttendanceRecord(record: AttendanceRecord): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync(
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

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'internalId' ? 'internal_id' :
                     key === 'subjectId' ? 'subject_id' :
                     key === 'semesterId' ? 'semester_id' :
                     key === 'createdAt' ? 'created_at' :
                     key === 'updatedAt' ? 'updated_at' :
                     key;
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });

    if (fields.length > 0) {
      values.push(id);
      await this.db.runAsync(
        `UPDATE attendance_records SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM attendance_records WHERE id = ?', [id]);
  }

  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<AttendanceRecord>('SELECT * FROM attendance_records ORDER BY date DESC');
  }

  async exportToJson(): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const semesters = await this.getAllSemesters();
    const subjects = await this.getAllSubjects();
    const internals = await this.getAllInternals();
    const attendanceRecords = await this.getAllAttendanceRecords();

    const exportData = {
      semesters,
      subjects,
      internals,
      attendanceRecords,
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importFromJson(jsonData: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.withTransaction(async (tx) => {
      await tx.executeAsync('DELETE FROM attendance_records');
      await tx.executeAsync('DELETE FROM internals');
      await tx.executeAsync('DELETE FROM subjects');
      await tx.executeAsync('DELETE FROM semesters');

      const data = JSON.parse(jsonData);

      if (data.semesters?.length) {
        for (const semester of data.semesters) {
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
        }
      }

      if (data.subjects?.length) {
        for (const subject of data.subjects) {
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
      }

      if (data.internals?.length) {
        for (const internal of data.internals) {
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
      }

      if (data.attendanceRecords?.length) {
        for (const record of data.attendanceRecords) {
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
      }
    });
  }
}