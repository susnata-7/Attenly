import React from 'react';
import { View, Text } from 'react-native';
import StyleSheet from 'react-native/style-sheet';

import { AppProvider } from './state/appReducer';
import { AppNavigator } from './navigation/AppNavigator';
import { AppContainer } from './components/AppContainer';
import { StorageService } from './services/StorageService';

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  const [storageService] = React.useState(() => new StorageService());

  React.useEffect(() => {
    const prepare = async () => {
      try {
        await storageService.init();
        await storageService.initializeWithDemoData();
        setIsReady(true);
      } catch (e) {
        console.error('App initialization failed:', e);
      }
    };

    prepare();
  }, [storageService]);

  if (!isReady) {
    return <AppContainer>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing Attenly...</Text>
      </View>
    </AppContainer>;
  }

  return (
    <AppProvider>
      <AppContainer>
        <AppNavigator />
      </AppContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});