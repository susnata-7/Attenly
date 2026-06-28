import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useApp } from '../state/appReducer';
import { StorageService } from '../services/StorageService';
import { Semester } from '../types/models';
import { theme } from '../theme';
import { typography } from '../theme';

export const SemesterManagement = () => {
  const { state, dispatch } = useApp();
  const [storageService] = useState(() => new StorageService());
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      setIsLoading(true);
      await storageService.init();
      const allSemesters = await storageService.getAllSemesters();
      setSemesters(allSemesters);
    } catch (error) {
      console.error('Failed to load semesters:', error);
      Alert.alert('Error', 'Failed to load semesters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSemester = async () => {
    if (!formData.name || !formData.code) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newSemester: Semester = {
      id: `semester_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      code: formData.code.toUpperCase(),
      isActive: semesters.length === 0,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await storageService.createSemester(newSemester);
      setSemesters([...semesters, newSemester]);
      setFormData({ name: '', code: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add semester:', error);
      Alert.alert('Error', 'Failed to add semester');
    }
  };

  const handleArchiveSemester = async (semester: Semester) => {
    Alert.alert(
      'Archive Semester',
      `Are you sure you want to archive "${semester.name}"? This will deactivate it for calculations but keep it in history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.updateSemester(semester.id, { isArchived: true, isActive: false });
              setSemesters(semesters.map(s =>
                s.id === semester.id
                  ? { ...s, isArchived: true, isActive: false, updatedAt: new Date().toISOString() }
                  : s
              ));
            } catch (error) {
              console.error('Failed to archive semester:', error);
              Alert.alert('Error', 'Failed to archive semester');
            }
          },
        },
      ]
    );
  };

  const handleSetActiveSemester = async (semester: Semester) => {
    try {
      await storageService.setActiveSemesterId(semester.id);
      setSemesters(semesters.map(s =>
        s.id === semester.id
          ? { ...s, isActive: true, updatedAt: new Date().toISOString() }
          : { ...s, isActive: false, updatedAt: new Date().toISOString() }
      ));
    } catch (error) {
      console.error('Failed to set active semester:', error);
      Alert.alert('Error', 'Failed to set active semester');
    }
  };

  const renderSemesterItem = ({ item }: { item: Semester }) => {
    const isActive = item.isActive;
    const isArchived = item.isArchived;

    return (
      <View style={[styles.semesterCard, isActive && styles.activeSemesterCard]}>
        <View style={styles.semesterInfo}>
          <Text style={[styles.semesterName, isActive && styles.activeSemesterName]}>
            {item.name}
          </Text>
          <Text style={styles.semesterCode}>{item.code}</Text>
          <View style={styles.statusBadges}>
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
            {isArchived && (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedBadgeText}>ARCHIVED</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.semesterActions}>
          {!isActive && !isArchived && (
            <TouchableOpacity
              style={[styles.actionButton, styles.setActiveButton]}
              onPress={() => handleSetActiveSemester(item)}
            >
              <Text style={styles.actionButtonText}>SET ACTIVE</Text>
            </TouchableOpacity>
          )}
          {!isArchived && (
            <TouchableOpacity
              style={[styles.actionButton, styles.archiveButton]}
              onPress={() => handleArchiveSemester(item)}
            >
              <Text style={styles.actionButtonText}>ARCHIVE</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading semesters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>[ SEMESTER MANAGEMENT ]</Text>

      {showAddForm ? (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>[ NEW SEMESTER ]</Text>
          <TextInput
            style={styles.input}
            placeholder="Semester Name"
            placeholderTextColor={theme.textDim}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Semester Code (e.g., SEM_1)"
            placeholderTextColor={theme.textDim}
            value={formData.code}
            onChangeText={(text) => setFormData({ ...formData, code: text })}
            autoCapitalize="characters"
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.formButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={handleAddSemester}
            >
              <Text style={styles.formButtonText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>+ ADD SEMESTER</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={semesters}
        renderItem={renderSemesterItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
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
  addButton: {
    backgroundColor: theme.primaryContainer,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  addButtonText: {
    color: theme.onPrimaryContainer,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: theme.spacing.sm,
  },
  semesterCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeSemesterCard: {
    borderColor: theme.primaryContainer,
    backgroundColor: theme.surfaceContainerLow,
  },
  semesterInfo: {
    flex: 1,
  },
  semesterName: {
    fontSize: typography.headlineMd.fontSize,
    fontWeight: '600',
    color: theme.onSurface,
    marginBottom: theme.spacing.xs / 2,
  },
  activeSemesterName: {
    color: theme.primary,
  },
  semesterCode: {
    fontSize: typography.labelSm.fontSize,
    color: theme.textDim,
    textTransform: 'uppercase',
  },
  statusBadges: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  activeBadge: {
    backgroundColor: theme.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.default,
  },
  activeBadgeText: {
    color: theme.textMain,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  archivedBadge: {
    backgroundColor: theme.textDim,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.default,
  },
  archivedBadgeText: {
    color: theme.background,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  semesterActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.default,
  },
  setActiveButton: {
    backgroundColor: theme.success,
  },
  archiveButton: {
    backgroundColor: theme.danger,
  },
  actionButtonText: {
    color: theme.textMain,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addForm: {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: typography.bodyLg.fontSize,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    borderRadius: theme.borderRadius.default,
    padding: theme.spacing.sm,
    color: theme.textMain,
    marginBottom: theme.spacing.md,
    fontSize: typography.bodyMd.fontSize,
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  formButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.textDim,
  },
  saveButton: {
    backgroundColor: theme.primaryContainer,
  },
  formButtonText: {
    color: theme.onPrimaryContainer,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
EOF