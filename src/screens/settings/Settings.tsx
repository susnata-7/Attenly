import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useApp } from '../state/appReducer';
import { StorageService } from '../services/StorageService';
import { theme } from '../theme';
import { typography } from '../theme';

export const Settings = () => {
  const { state, dispatch } = useApp();
  const [storageService] = useState(() => new StorageService());
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      await storageService.init();
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceGoalChange = async (newGoal: number) => {
    try {
      await storageService.updateSemesterSettings(state.activeSemesterId, { attendanceGoal: newGoal });
      Alert.alert('Success', 'Attendance goal updated successfully');
    } catch (error) {
      console.error('Failed to update attendance goal:', error);
      Alert.alert('Error', 'Failed to update attendance goal');
    }
  };

  const handleThemeToggle = (value: boolean) => {
    const newTheme = value ? 'light' : 'dark';
    dispatch({ type: 'UPDATE_THEME', payload: newTheme });
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      await storageService.init();
      const jsonData = await storageService.exportToJson();
      setExportData(jsonData);
      setShowExportModal(true);
    } catch (error) {
      console.error('Failed to export data:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    if (!importText.trim()) {
      Alert.alert('Error', 'Please paste JSON data to import');
      return;
    }

    try {
      setIsLoading(true);
      await storageService.init();
      await storageService.importFromJson(importText);
      Alert.alert(
        'Import Successful',
        'Your data has been imported successfully. Please restart the app for changes to take effect.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowImportModal(false);
              setImportText('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to import data:', error);
      Alert.alert('Error', 'Failed to import data. Please check the JSON format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>[ SETTINGS ]</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ATTENDANCE GOAL</Text>
        <View style={styles.goalContainer}>
          <TouchableOpacity
            style={[styles.goalButton, styles.goalButtonLeft]}
            onPress={() => handleAttendanceGoalChange(75)}
          >
            <Text style={styles.goalButtonText}>75%</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.goalButton, styles.goalButtonMiddle]}
            onPress={() => handleAttendanceGoalChange(80)}
          >
            <Text style={styles.goalButtonText}>80%</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.goalButton, styles.goalButtonRight]}
            onPress={() => handleAttendanceGoalChange(85)}
          >
            <Text style={styles.goalButtonText}>85%</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DISPLAY</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>DARK MODE</Text>
          <Switch
            value={state.theme === 'dark'}
            onValueChange={handleThemeToggle}
            trackColor={{ false: theme.textDim, true: theme.primaryContainer }}
            thumbColor={state.theme === 'dark' ? theme.onPrimaryContainer : theme.background}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>EXPORT DATA (.JSON)</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleExportData} disabled={isLoading}>
            <Text style={styles.actionButtonText}>EXPORT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>IMPORT DATA (.JSON)</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowImportModal(true)} disabled={isLoading}>
            <Text style={styles.actionButtonText}>IMPORT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>EXPORTED DATA</Text>
            <TextInput
              style={styles.modalTextArea}
              value={exportData}
              editable={false}
              multiline={true}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.modalButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>IMPORT DATA</Text>
            <Text style={styles.modalDescription}>
              Paste your exported JSON data here. This will replace all existing data.
            </Text>
            <TextInput
              style={styles.modalTextArea}
              value={importText}
              onChangeText={setImportText}
              placeholder="JSON data..."
              placeholderTextColor={theme.textDim}
              multiline={true}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleImportData}
                disabled={!importText.trim()}
              >
                <Text style={styles.modalButtonText}>IMPORT</Text>
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
    fontSize: typography.headlineMd.fontSize,
    fontWeight: typography.headlineMd.fontWeight,
    color: theme.primary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.lg,
    letterSpacing: typography.headlineMd.letterSpacing,
  },
  section: {
    backgroundColor: theme.surface,
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: typography.labelSm.fontSize,
    fontWeight: '600',
    color: theme.textDim,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  goalButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.borderMuted,
  },
  goalButtonLeft: {
    backgroundColor: theme.background,
  },
  goalButtonMiddle: {
    backgroundColor: theme.surfaceContainerLow,
    borderColor: theme.primaryContainer,
  },
  goalButtonRight: {
    backgroundColor: theme.background,
  },
  goalButtonText: {
    color: theme.textMain,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderMuted,
  },
  settingLabel: {
    fontSize: typography.bodyMd.fontSize,
    color: theme.textMain,
    textTransform: 'uppercase',
  },
  actionButton: {
    backgroundColor: theme.primaryContainer,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.default,
  },
  actionButtonText: {
    color: theme.onPrimaryContainer,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 10,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.headlineMd.fontSize,
    fontWeight: '600',
    color: theme.primary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: typography.bodyMd.fontSize,
    color: theme.textDim,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalTextArea: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderMuted,
    borderRadius: theme.borderRadius.default,
    padding: theme.spacing.sm,
    height: 200,
    marginBottom: theme.spacing.md,
    fontSize: typography.bodyMd.fontSize,
    color: theme.textMain,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.default,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: theme.primaryContainer,
  },
  modalButtonSecondary: {
    backgroundColor: theme.textDim,
  },
  modalButtonText: {
    color: theme.onPrimaryContainer,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});