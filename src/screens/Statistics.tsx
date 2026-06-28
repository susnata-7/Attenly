import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useApp } from '../state/appReducer';
import { StorageService } from '../services/StorageService';
import { Subject, Internal, AttendanceRecord, Semester } from '../types/models';
import { calculateStats, getInternalWiseStats, getStatusColor, formatDate } from '../utils/calculations';
import { theme } from '../theme';
import { typography } from '../theme';

export const Statistics = () => {
  const { state } = useApp();
  const [storageService] = useState(() => new StorageService());
  const [isLoading, setIsLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [internals, setInternals] = useState<Internal[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [subjectStats, setSubjectStats] = useState<any>([]);
  const [internalStats, setInternalStats] = useState<any>([]);

  useEffect(() => {
    loadStatistics();
  }, [state.activeSemesterId]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      await storageService.init();

      const semester = await storageService.getActiveSemester();
      setActiveSemester(semester);

      if (semester) {
        const semesterSubjects = await storageService.getSubjectsForSemester(semester.id);
        const semesterInternals: Internal[] = [];
        const semesterAttendanceRecords: AttendanceRecord[] = await storageService.getAttendanceRecordsBySemester(semester.id);

        for (const subject of semesterSubjects) {
          const subjectInternals = await storageService.getInternalsForSubject(subject.id);
          semesterInternals.push(...subjectInternals);
        }

        setSubjects(seasonSubjects);
        setInternals(semesterInternals);
        setAttendanceRecords(semesterAttendanceRecords);

        const overall = calculateStats(semesterAttendanceRecords, semester.attendanceGoal || 75, semester.startDate, semester.endDate);
        setOverallStats(overall);

        const subjectBreakdown = semesterSubjects.map(subject => {
          const subjectRecords = semesterAttendanceRecords.filter(r => r.subjectId === subject.id);
          const stats = calculateStats(subjectRecords, subject.attendanceGoal || 75, semester.startDate, semester.endDate);
          return {
            ...subject,
            ...stats,
          };
        });
        setSubjectStats(subjectBreakdown);

        const internalBreakdown = getInternalWiseStats(semesterAttendanceRecords, semesterInternals, semester.attendanceGoal || 75, semester.startDate, semester.endDate);
        setInternalStats(internalBreakdown);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SAFE': return 'safe';
      case 'WARN': return 'warn';
      case 'CRIT': return 'crit';
      default: return 'safe';
    }
  };

  const renderOverallSection = () => (
    <View style={styles.overallCard}>
      <Text style={styles.sectionHeader}>[ OVERALL STANDING ]</Text>
      <View style={styles.overallContent}>
        <View style={styles.overallLeft}>
          <Text style={styles.overallPercentage}>{overallStats?.attendancePercentage || 0}%</Text>
          <Text style={styles.overallLabel}>CUMULATIVE ATTENDANCE</Text>
        </View>
        <View style={styles.overallRight}>
          <View style={styles.overallStatusContainer}>
            <Text style={styles.overallStatus}>STATUS: OPTIMAL</Text>
          </View>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${overallStats?.attendancePercentage || 0}%` }]} />
      </View>
    </View>
  );

  const renderSubjectBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>[ SUBJECT BREAKDOWN ]</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.subjectCol]}>SUBJECT_ID</Text>
          <Text style={[styles.tableHeaderText, styles.attndCol]}>ATTND</Text>
          <Text style={[styles.tableHeaderText, styles.goalCol]}>GOAL</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>STATUS</Text>
        </View>

        {subjectStats.map((subject: any) => (
          <TouchableOpacity
            key={subject.id}
            style={styles.tableRow}
            onPress={() => Alert.alert('Navigate to subject detail')}
          >
            <Text style={[styles.tableCell, styles.subjectCell]}>{subject.code}</Text>
            <Text style={[styles.tableCell, styles.attndCell]}>{subject.present}/{subject.total}</Text>
            <Text style={[styles.tableCell, styles.goalCell]}>{subject.attendanceGoal}%</Text>
            <View style={styles.statusCell}>
              <Text style={[styles.statusText, subject.status === 'SAFE' && styles.statusSafe,
                subject.status === 'WARN' && styles.statusWarn,
                subject.status === 'CRIT' && styles.statusCrit]}>
                {subject.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderInternalBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>[ INTERNAL ASSESSMENT BREAKDOWN ]</Text>
      <View style={styles.internalGrid}>
        {internalStats.map((internal: any) => (
          <View key={internal.id} style={styles.internalCard}>
            <View style={styles.internalHeader}>
              <Text style={styles.internalName}>{internal.name}</Text>
              <Text style={styles.internalDates}>{internal.startDate} - {internal.endDate}</Text>
            </View>

            {internal.status === 'NOT_STARTED' ? (
              <View style={styles.notStartedContainer}>
                <Text style={styles.notStartedText}>PERIOD NOT COMMENCED</Text>
                <View style={styles.emptyProgressBar} />
              </View>
            ) : (
              <>
                <View style={styles.internalProgressContainer}>
                  <Text style={styles.internalPercentage}>{internal.attendancePercentage}%</Text>
                  <View style={styles.internalProgressBarContainer}>
                    <View style={[styles.internalProgressBar, { width: `${internal.attendancePercentage}%` }]} />
                  </View>
                </View>

                <View style={styles.internalStatsRow}>
                  <View style={styles.internalStat}>
                    <Text style={styles.internalStatLabel}>CLASSES_TOTAL</Text>
                    <Text style={styles.internalStatValue}>{internal.total}</Text>
                  </View>
                  <View style={styles.internalStatDivider} />
                  <View style={styles.internalStat}>
                    <Text style={styles.internalStatLabel}>PRESENT</Text>
                    <Text style={[styles.internalStatValue, styles.internalStatPresent]}>{internal.present}</Text>
                  </View>
                  <View style={styles.internalStatDivider} />
                  <View style={styles.internalStat}>
                    <Text style={styles.internalStatLabel}>ABSENT</Text>
                    <Text style={[styles.internalStatValue, styles.internalStatAbsent]}>{internal.absent}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      );
    }

    if (!activeSemester) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.noDataText}>No active semester</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={[{ type: 'overall' }, { type: 'subjects' }, { type: 'internals' }]}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'overall': return renderOverallSection();
            case 'subjects': return renderSubjectBreakdown();
            case 'internals': return renderInternalBreakdown();
            default: return null;
          }
        }}
        keyExtractor={(item) => item.type}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>[ STATISTICS ]</Text>
      {renderContent()}
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
    fontSize: typography.headlineMd.fontSize,
    fontWeight: typography.headlineMd.fontWeight,
    color: theme.primary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.lg,
    letterSpacing: typography.headlineMd.letterSpacing,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    fontSize: typography.bodyLg.fontSize,
    color: theme.textDim,
  },
  noDataText: {
    fontSize: typography.bodyMd.fontSize,
    color: theme.textDim,
    textTransform: 'uppercase',
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: theme.spacing.md,
  },
  overallCard: {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    fontSize: typography.headlineMd.fontSize,
    fontWeight: typography.headlineMd.fontWeight,
    color: theme.primary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
    letterSpacing: typography.headlineMd.letterSpacing,
  },
  overallContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  overallLeft: {
    flex: 1,
  },
  overallRight: {
    alignItems: 'flex-end',
  },
  overallPercentage: {
    fontSize: 64,
    fontWeight: '700',
    color: theme.primaryContainer,
    marginBottom: theme.spacing.xs,
  },
  overallLabel: {
    fontSize: typography.labelSm.fontSize,
    color: theme.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  overallStatusContainer: {
    backgroundColor: theme.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.default,
  },
  overallStatus: {
    color: theme.textMain,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.borderMuted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.primaryContainer,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: theme.spacing.md,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: theme.borderMuted,
    borderRadius: theme.borderRadius.default,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceContainerHigh,
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
  },
  tableHeaderText: {
    fontSize: typography.labelSm.fontSize,
    fontWeight: '600',
    color: theme.textMain,
    textTransform: 'uppercase',
  },
  subjectCol: {
    flex: 3,
  },
  attndCol: {
    flex: 1,
    textAlign: 'center',
  },
  goalCol: {
    flex: 1,
    textAlign: 'center',
  },
  statusCol: {
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: typography.bodyMd.fontSize,
    color: theme.textMain,
  },
  subjectCell: {
    fontWeight: '600',
  },
  attndCell: {
    textAlign: 'center',
  },
  goalCell: {
    textAlign: 'center',
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.default,
  },
  statusSafe: {
    backgroundColor: theme.success,
    color: theme.textMain,
  },
  statusWarn: {
    backgroundColor: theme.primaryContainer,
    color: theme.onPrimaryContainer,
  },
  statusCrit: {
    backgroundColor: theme.error,
    color: theme.textMain,
  },
  internalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  internalCard: {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: theme.spacing.md,
    flex: 1,
    minWidth: '30%',
  },
  internalHeader: {
    marginBottom: theme.spacing.md,
  },
  internalName: {
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '600',
    color: theme.primary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs / 2,
  },
  internalDates: {
    fontSize: typography.labelSm.fontSize,
    color: theme.textDim,
    textTransform: 'uppercase',
  },
  notStartedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  notStartedText: {
    fontSize: typography.bodyMd.fontSize,
    fontStyle: 'italic',
    color: theme.textDim,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  emptyProgressBar: {
    height: 4,
    width: '100%',
    backgroundColor: theme.borderMuted,
    borderRadius: 2,
  },
  internalProgressContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  internalPercentage: {
    fontSize: typography.codeDisplay.fontSize,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: theme.spacing.xs,
  },
  internalProgressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: theme.borderMuted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  internalProgressBar: {
    height: '100%',
    backgroundColor: theme.primaryContainer,
  },
  internalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  internalStat: {
    alignItems: 'center',
  },
  internalStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.borderMuted,
  },
  internalStatLabel: {
    fontSize: 9,
    color: theme.textDim,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs / 2,
  },
  internalStatValue: {
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '600',
    color: theme.textMain,
  },
  internalStatPresent: {
    color: theme.success,
  },
  internalStatAbsent: {
    color: theme.error,
  },
});