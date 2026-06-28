import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../state/appReducer';
import { StorageService } from '../services/StorageService';
import { AttendanceRecord, Subject, Semester, Internal } from '../types/models';
import { formatDate } from '../utils/calculations';
import { theme } from '../theme';
import { typography } from '../theme';
import StyleSheet from 'react-native/style-sheet';

export const History = () => {
  const { state } = useApp();
  const [storageService] = useState(() => new StorageService());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [internals, setInternals] = useState<Internal[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSemester, setFilterSemester] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [filterInternal, setFilterInternal] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);

  useEffect(() => {
    loadHistoryData();
  }, [state.activeSemesterId]);

  const loadHistoryData = async () => {
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

        setSubjects(semesterSubjects);
        setInternals(semesterInternals);
        setAttendanceRecords(semesterAttendanceRecords);
      }
    } catch (error) {
      console.error('Failed to load history data:', error);
      Alert.alert('Error', 'Failed to load history data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): { bg: string, text: string, border: string } => {
    switch (status) {
      case 'Present':
        return { bg: '#1b5e20', text: '#a5d6a7', border: '#2e7d32' };
      case 'Absent':
        return { bg: '#b71c1c', text: '#ffcdd2', border: '#d32f2f' };
      case 'Cancelled':
        return { bg: '#333333', text: '#ffffff', border: '#555555' };
      default:
        return { bg: theme.surface, text: theme.textMain, border: theme.borderMuted };
    }
  };

  const getFilteredRecords = () => {
    let filtered = attendanceRecords;

    if (filterSemester) {
      filtered = filtered.filter(r => r.semesterId === filterSemester);
    }

    if (filterSubject) {
      filtered = filtered.filter(r => r.subjectId === filterSubject);
    }

    if (filterInternal) {
      filtered = filtered.filter(r => r.internalId === filterInternal);
    }

    if (filterMonth) {
      const monthYear = filterMonth;
      filtered = filtered.filter(r => {
        const recordMonth = r.date.substring(0, 7);
        return recordMonth === monthYear;
      });
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  };

  const getSubjectById = (id: string): Subject | undefined => {
    return subjects.find(s => s.id === id);
  };

  const getInternalById = (id: string): Internal | undefined => {
    return internals.find(i => i.id === id);
  };

  const handleRecordPress = (record: AttendanceRecord) => {
    Alert.alert(
      'Edit/Remove Record',
      `Date: ${record.date}\nStatus: ${record.status}\nNote: ${record.note || 'None'}`,\n      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () => handleEditRecord(record),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteRecord(record),
        },
      ]
    );
  };

  const handleEditRecord = async (record: AttendanceRecord) => {
    Alert.prompt(
      'Edit Note',
      'Enter note for this record (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (note) => {
            try {
              await storageService.updateAttendanceRecord(record.id, { note: note || null });\n              await loadHistoryData();\n              Alert.alert('Success', 'Record updated successfully');\n            } catch (error) {\n              console.error('Failed to update record:', error);\n              Alert.alert('Error', 'Failed to update record');\n            }\n          },\n        },\n      ],\n      'plain text',\n      record.note || '',\n    );\n  };

  const handleDeleteRecord = async (record: AttendanceRecord) => {\n    Alert.alert(\n      'Delete Record',\n      `Are you sure you want to delete the attendance record for ${record.date}?`,,\n      [\n        { text: 'Cancel', style: 'cancel' },\n        {\n          text: 'DELETE',\n          style: 'destructive',\n          onPress: async () => {\n            try {\n              await storageService.deleteAttendanceRecord(record.id);\n              await loadHistoryData();\n              Alert.alert('Success', 'Record deleted successfully');\n            } catch (error) {\n              console.error('Failed to delete record:', error);\n              Alert.alert('Error', 'Failed to delete record');\n            }\n          },\n        },\n      ]\n    );\n  };

  const renderFilterBar = () => {\n    const uniqueMonths = Array.from(\n      new Set(\n        attendanceRecords.map(r => r.date.substring(0, 7)).sort().reverse()\n      )\n    );\n
    const uniqueSemesters = Array.from(\n      new Set(\n        attendanceRecords.map(r => r.semesterId).filter(Boolean)\n      )\n    );\n
    const uniqueSubjects = subjects.map(s => s.id);\n
    const uniqueInternals = internals.map(i => i.id);\n
    return (\n      <View style={styles.filterBar}>\n        <Text style={styles.filterTitle}>[ FILTER ]</Text>\n        <View style={styles.filterChips}>\n          {uniqueSemesters.map((id) => (\n            <TouchableOpacity\n              key={\'semester-\' + id}\n              style={[\n                styles.filterChip,\n                filterSemester === id && styles.activeFilterChip,\n              ]}\n              onPress={() => setFilterSemester(filterSemester === id ? null : id)}\n            >\n              <Text style={[\n                styles.filterChipText,\n                filterSemester === id && styles.activeFilterChipText,\n              ]}>\n                SEM\\{id.slice(-1)}\,\}\n              </Text>\n            </TouchableOpacity>\n          ))}\n          {uniqueSubjects.map((id) => (\n            <TouchableOpacity\n              key={\'subject-\' + id}\n              style={[\n                styles.filterChip,\n                filterSubject === id && styles.activeFilterChip,\n              ]}\n              onPress={() => setFilterSubject(filterSubject === id ? null : id)}\n            >\n              <Text style={[\n                styles.filterChipText,\n                filterSubject === id && styles.activeFilterChipText,\n              ]}>\n                SUB\\{id.slice(-1)}\,\}\n              </Text>\n            </TouchableOpacity>\n          ))}\n          {uniqueInternals.map((id) => (\n            <TouchableOpacity\n              key={\'internal-\' + id}\n              style={[\n                styles.filterChip,\n                filterInternal === id && styles.activeFilterChip,\n              ]}\n              onPress={() => setFilterInternal(filterInternal === id ? null : id)}\n            >\n              <Text style={[\n                styles.filterChipText,\n                filterInternal === id && styles.activeFilterChipText,\n              ]}>\n                INT\\{id.slice(-1)}\,\}\n              </Text>\n            </TouchableOpacity>\n          ))}\n          {uniqueMonths.map((month) => (\n            <TouchableOpacity\n              key={\'month-\' + month}\n              style={[\n                styles.filterChip,\n                filterMonth === month && styles.activeFilterChip,\n              ]}\n              onPress={() => setFilterMonth(filterMonth === month ? null : month)}\n            >\n              <Text style={[\n                styles.filterChipText,\n                filterMonth === month && styles.activeFilterChipText,\n              ]}>\n                {month}\,\}\n              </Text>\n            </TouchableOpacity>\n          ))}\n          {(filterSemester || filterSubject || filterInternal || filterMonth) && (\n            <TouchableOpacity\n              style={styles.clearFiltersButton}\n              onPress={() => {\n                setFilterSemester(null);\n                setFilterSubject(null);\n                setFilterInternal(null);\n                setFilterMonth(null);\n              }}\n            >\n              <Text style={styles.clearFiltersText}>CLEAR ALL</Text>\n            </TouchableOpacity>\n          )}\n        </View>\n      </View>\n    );\n  };

  const renderHistoryItem = ({ item }: { item: AttendanceRecord }) => {\n    const subject = getSubjectById(item.subjectId);\n    const internal = getInternalById(item.internalId);\n    const statusColors = getStatusColor(item.status);\n
    return (\n      <TouchableOpacity\n        style={styles.historyItem}\n        onPress={() => handleRecordPress(item)}\n      >\n        <View style={styles.historyItemHeader}>\n          <Text style={styles.historyDate}>{formatDate(item.date)}</Text>\n          <View style={[styles.statusPill, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>\n            <Text style={[styles.statusText, { color: statusColors.text }]}>\n              [ {item.status} ]\n            </Text>\n          </View>\n        </View>\n
        <View style={styles.historyItemBody}>\n          <Text style={styles.subjectText}>\n            {subject?.code || item.subjectId}: {subject?.name || 'Unknown Subject'}\n          </Text>\n          {internal && (\n            <Text style={styles.internalText}>Internal: {internal.name}</Text>\n          )}\n          {item.note && (\n            <Text style={styles.noteText}># {item.note}</Text>\n          )}\n        </View>\n      </TouchableOpacity>\n    );\n  };

  if (isLoading) {\n    return (\n      <View style={styles.container}>\n        <Text style={styles.loadingText}>Loading history...</Text>\n      </View>\n    );\n  }\n
  return (\n    <View style={styles.container}>\n      <Text style={styles.header}>[ HISTORY ]</Text>\n      {renderFilterBar()}\n      <FlatList\n        data={getFilteredRecords()}\n        renderItem={renderHistoryItem}\n        keyExtractor={(item) => item.id}\n        style={styles.list}\n        contentContainerStyle={styles.listContent}\n        ListEmptyComponent={\n          <View style={styles.emptyContainer}>\n            <Text style={styles.emptyText}>NO RECORDS FOUND</Text>\n          </View>\n        }\n      />\n    </View>\n  );\n};

const styles = StyleSheet.create({
  container: {\n    flex: 1,\n    backgroundColor: theme.background,\n    padding: theme.spacing.md,\n  },\n  header: {\n    fontSize: typography.headlineMd.fontSize,\n    fontWeight: typography.headlineMd.fontWeight,\n    color: theme.primary,\n    textTransform: 'uppercase',\n    marginBottom: theme.spacing.md,\n    letterSpacing: typography.headlineMd.letterSpacing,\n  },\n  loadingText: {\n    fontSize: typography.bodyLg.fontSize,\n    color: theme.textDim,\n    textAlign: 'center',\n    marginTop: theme.spacing.xl,\n  },\n  filterBar: {\n    backgroundColor: theme.surfaceContainerLow,\n    borderRadius: theme.borderRadius.default,\n    borderWidth: 1,\n    borderColor: theme.borderMuted,\n    padding: theme.spacing.sm,\n    marginBottom: theme.spacing.md,\n  },\n  filterTitle: {\n    fontSize: typography.labelSm.fontSize,\n    fontWeight: '600',\n    color: theme.textDim,\n    textTransform: 'uppercase',\n    marginBottom: theme.spacing.sm,\n  },\n  filterChips: {\n    flexDirection: 'row',\n    flexWrap: 'wrap',\n    gap: theme.spacing.xs,\n  },\n  filterChip: {\n    backgroundColor: theme.background,\n    borderWidth: 1,\n    borderColor: theme.borderMuted,\n    borderRadius: theme.borderRadius.default,\n    paddingHorizontal: theme.spacing.sm,\n    paddingVertical: theme.spacing.xs / 2,\n  },\n  activeFilterChip: {\n    backgroundColor: theme.primaryContainer,\n    borderColor: theme.primaryContainer,\n  },\n  filterChipText: {\n    fontSize: 9,\n    color: theme.textMain,\n    textTransform: 'uppercase',\n  },\n  activeFilterChipText: {\n    color: theme.onPrimaryContainer,\n    fontWeight: '600',\n  },\n  clearFiltersButton: {\n    backgroundColor: theme.danger + '20',\n    borderWidth: 1,\n    borderColor: theme.danger,\n    borderRadius: theme.borderRadius.default,\n    paddingHorizontal: theme.spacing.sm,\n    paddingVertical: theme.spacing.xs / 2,\n    alignSelf: 'flex-start',\n  },\n  clearFiltersText: {\n    fontSize: 9,\n    color: theme.danger,\n    fontWeight: '600',\n    textTransform: 'uppercase',\n  },\n  list: {\n    flex: 1,\n  },\n  listContent: {\n    gap: theme.spacing.sm,\n  },\n  historyItem: {\n    backgroundColor: theme.surface,\n    borderRadius: theme.borderRadius.default,\n    borderWidth: 1,\n    borderColor: theme.borderMuted,\n    padding: theme.spacing.md,\n  },\n  historyItemHeader: {\n    flexDirection: 'row',\n    justifyContent: 'space-between',\n    alignItems: 'center',\n    marginBottom: theme.spacing.sm,\n  },\n  historyDate: {\n    fontSize: typography.codeDisplay.fontSize,\n    fontWeight: '700',\n    color: theme.primary,\n  },\n  statusPill: {\n    paddingHorizontal: theme.spacing.sm,\n    paddingVertical: theme.spacing.xs / 2,\n    borderRadius: theme.borderRadius.default,\n    borderWidth: 1,\n  },\n  statusText: {\n    fontSize: 9,\n    fontWeight: '600',\n    textTransform: 'uppercase',\n  },\n  historyItemBody: {\n    gap: theme.spacing.xs / 2,\n  },\n  subjectText: {\n    fontSize: typography.bodyMd.fontSize,\n    color: theme.textMain,\n    fontWeight: '600',\n  },\n  internalText: {\n    fontSize: typography.labelSm.fontSize,\n    color: theme.textDim,\n    textTransform: 'uppercase',\n  },\n  noteText: {\n    fontSize: typography.bodyMd.fontSize,\n    color: theme.textDim,\n    fontStyle: 'italic',\n  },\n  emptyContainer: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n    padding: theme.spacing.xl,\n  },\n  emptyText: {\n    fontSize: typography.bodyLg.fontSize,\n    color: theme.textDim,\n    textTransform: 'uppercase',\n  },\n});