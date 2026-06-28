import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useApp } from '../state/appReducer';
import { StorageService } from '../services/StorageService';
import { Subject, AttendanceRecord, Semester, Internal } from '../types/models';
import { calculateStats } from '../utils/calculations';
import { theme } from '../theme';
import { typography } from '../theme';

export const Dashboard = () => {
  const { state, dispatch } = useApp();
  const [storageService] = useState(() => new StorageService());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Cancelled'>('Present');
  const [attendanceNote, setAttendanceNote] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [state.activeSemesterId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await storageService.init();

      const semester = await storageService.getActiveSemester();
      setActiveSemester(semester);

      if (semester) {
        const semesterSubjects = await storageService.getSubjectsForSemester(semester.id);
        const semesterAttendanceRecords = await storageService.getAttendanceRecordsBySemester(semester.id);

        setSubjects(semesterSubjects);
        setAttendanceRecords(semesterAttendanceRecords);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getOverallAttendanceStats = () => {
    if (!activeSemester || attendanceRecords.length === 0) return { percentage: 0, total: 0, cancelled: 0 };
    const stats = calculateStats(attendanceRecords, activeSemester.attendanceGoal || 75, activeSemester.startDate, activeSemester.endDate);
    return { percentage: stats.attendancePercentage, total: stats.total, cancelled: stats.cancelled };
  };

  const getSubjectStats = (subjectId: string) => {
    const subjectRecords = attendanceRecords.filter(r => r.subjectId === subjectId);
    const stats = calculateStats(subjectRecords, 75);
    return stats;
  };

  const getAttendanceStatusColor = (percentage: number, goal: number = 75): string => {
    if (percentage < goal * 0.8) return theme.error;
    if (percentage < goal) return theme.danger;
    return theme.success;
  };

  const handleSubjectPress = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowAttendanceModal(true);
  };

  const handleAttendanceSave = async () => {
    if (!selectedSubject || !activeSemester) return;

    const today = getTodayDate();
    const existingRecord = attendanceRecords.find(r => r.subjectId === selectedSubject.id && r.date === today);

    const recordData = {
      subjectId: selectedSubject.id,
      semesterId: activeSemester.id,
      date: today,
      status: attendanceStatus,
      note: attendanceNote || null,
    };

    try {
      if (existingRecord) {
        await storageService.updateAttendanceRecord(existingRecord.id, recordData);
        Alert.alert('Success', 'Attendance record updated successfully');
      } else {
        await storageService.addAttendanceRecord(recordData.subjectId, recordData.semesterId, recordData.date, recordData.status, recordData.note);
        Alert.alert('Success', 'Attendance record saved successfully');
      }

      setShowAttendanceModal(false);
      setSelectedSubject(null);
      setAttendanceStatus('Present');
      setAttendanceNote('');
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to save attendance:', error);
      Alert.alert('Error', 'Failed to save attendance');
    }
  };

  const renderSubjectCard = ({ item: subject }: { item: Subject }) => {
    const stats = getSubjectStats(subject.id);
    const statusColor = getAttendanceStatusColor(stats.attendancePercentage, subject.attendanceGoal || 75);

    let statusText = 'ON TRACK: 0';
    if (stats.attendancePercentage < (subject.attendanceGoal || 75)) {
      statusText = `REQUIRED: ${stats.requiredForGoal}`;
    } else if (stats.safeToMiss > 0) {
      statusText = `SAFE TO MISS: ${stats.safeToMiss}`;
    }

    return (
      <TouchableOpacity
        key={subject.id}
        style={[styles.subjectCard, { borderColor: statusColor }]}
        onPress={() => handleSubjectPress(subject)}
      >
        <View style={styles.subjectHeader}>
          <Text style={styles.subjectCode}>{subject.code}</Text>
          <Text style={styles.subjectName}>{subject.name}</Text>
        </View>

        <View style={styles.subjectStats}>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>ATTENDED</Text>
            <Text style={styles.statValue}>{stats.present} / {stats.total}</Text>
          </View>

          <View style={styles.statTile}>
            <Text style={styles.statLabel}>STATUS</Text>
            <Text style={[styles.statStatus, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.attendanceButton}>
          <Text style={styles.attendanceButtonText}>[ P ] PRESENT  [ A ] ABSENT  [ C ] CANCEL</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>[ DASHBOARD ]</Text>
        {activeSemester && (
          <Text style={styles.semesterText}>[ SESSION: {activeSemester.name} ]</Text>
        )}
      </View>

      <View style={styles.overallStatsCard}>
        <View style={styles.overallStatsHeader}>
          <Text style={styles.overallStatsLabel}>SYSTEM STATUS</Text>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>

        <View style={styles.overallStatsContent}>
          <View style={styles.overallStatsLeft}>
            <Text style={styles.overallStatsNumber}>[{getOverallAttendanceStats().percentage}%]</Text>
            <Text style={styles.overallStatsLabel}>TOTAL ATTENDANCE</Text>
          </View>

          <View style={styles.overallStatsRight}>
            {activeSemester && (
              <Text style={styles.semesterText}>{activeSemester.name}</Text>
            )}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${getOverallAttendanceStats().percentage}%` }]} />
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={subjects}
        renderItem={renderSubjectCard}
        keyExtractor={(item) => item.id}
        style={styles.subjectsList}
        contentContainerStyle={styles.subjectsListContent}
      />

      <Modal
        visible={showAttendanceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAttendanceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ATTENDANCE RECORD</Text>
            <Text style={styles.modalSubject}>
              {selectedSubject?.code}: {selectedSubject?.name}
            </Text>
            <Text style={styles.modalDate}>{getTodayDate()}</Text>

            <View style={styles.statusButtonsContainer}>
              <TouchableOpacity
                style={[styles.statusButton, styles.presentButton, attendanceStatus === 'Present' && styles.selectedStatusButton]}
                onPress={() => setAttendanceStatus('Present')}
              >
                <Text style={styles.statusButtonText}>PRESENT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.absentButton, attendanceStatus === 'Absent' && styles.selectedStatusButton]}
                onPress={() => setAttendanceStatus('Absent')}
              >
                <Text style={styles.statusButtonText}>ABSENT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, styles.cancelledButton, attendanceStatus === 'Cancelled' && styles.selectedStatusButton]}
                onPress={() => setAttendanceStatus('Cancelled')}
              >
                <Text style={styles.statusButtonText}>CANCELLED</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Optional note..."
              placeholderTextColor={theme.textDim}
              value={attendanceNote}
              onChangeText={setAttendanceNote}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.cancelButton]}
                onPress={() => setShowAttendanceModal(false)}
              >
                <Text style={styles.modalActionButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.saveButton]}
                onPress={handleAttendanceSave}
              >
                <Text style={styles.modalActionButtonText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerText: {
    fontSize: typography.headlineLg.fontSize,
    fontWeight: typography.headlineLg.fontWeight,
    color: theme.primary,
    textTransform: 'uppercase',
  },
  semesterText: {
    fontSize: typography.labelSm.fontSize,
    color: theme.textDim,
    textTransform: 'uppercase',
  },
  loadingText: {
    fontSize: typography.bodyLg.fontSize,
    color: theme.textDim,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  overallStatsCard: {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  overallStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  overallStatsLabel: {
    fontSize: typography.labelSm.fontSize,
    color: theme.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  onlineBadge: {
    backgroundColor: theme.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.default,
  },
  onlineText: {
    color: theme.textMain,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  overallStatsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallStatsLeft: {
    flex: 1,
  },
  overallStatsRight: {
    alignItems: 'flex-end',
  },
  overallStatsNumber: {
    fontSize: typography.codeDisplay.fontSize,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  progressBarContainer: {
    height: 4,
    width: 100,
    backgroundColor: theme.borderMuted,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.primaryContainer,
  },
  subjectsList: {
    flex: 1,
  },
  subjectsListContent: {
    gap: theme.spacing.md,
  },
  subjectCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.borderRadius.default,
    borderWidth: 2,
    padding: theme.spacing.md,
  },
  subjectHeader: {
    marginBottom: theme.spacing.md,
  },
  subjectCode: {
    fontSize: typography.headlineMd.fontSize,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: theme.spacing.xs / 2,
    textTransform: 'uppercase',
  },
  subjectName: {
    fontSize: typography.bodyMd.fontSize,
    color: theme.onSurface,
  },
  subjectStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statTile: {
    flex: 1,
    backgroundColor: theme.surfaceContainerHigh,
    borderRadius: theme.borderRadius.default,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: theme.textDim,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs / 2,
  },
  statValue: {
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '600',
    color: theme.textMain,
  },
  statStatus: {
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '600',
  },
  attendanceButton: {
    backgroundColor: theme.surfaceContainerLowest,
    borderRadius: theme.borderRadius.default,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  attendanceButtonText: {
    fontSize: 9,
    color: theme.textMain,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: theme.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    width: '90%',
  },
  modalTitle: {
    fontSize: typography.headlineMd.fontSize,
    fontWeight: '600',
    color: theme.primary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  modalSubject: {
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '600',
    color: theme.textMain,
    textAlign: 'center',
    marginBottom: theme.spacing.xs / 2,
  },
  modalDate: {
    fontSize: typography.labelSm.fontSize,
    color: theme.textDim,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statusButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
    borderWidth: 2,
  },
  presentButton: {
    backgroundColor: theme.success + '20',
    borderColor: theme.success,
  },
  absentButton: {
    backgroundColor: theme.error + '20',
    borderColor: theme.error,
  },
  cancelledButton: {
    backgroundColor: theme.textDim + '20',
    borderColor: theme.textDim,
  },
  selectedStatusButton: {
    transform: [{ scale: 0.95 }],
  },
  statusButtonText: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noteInput: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    borderRadius: theme.borderRadius.default,
    padding: theme.spacing.sm,
    color: theme.textMain,
    height: 80,
    marginBottom: theme.spacing.md,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalActionButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: theme.primaryContainer,
  },
  cancelButton: {
    backgroundColor: theme.textDim,
  },
  modalActionButtonText: {
    color: theme.onPrimaryContainer,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});