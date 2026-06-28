import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import { Dashboard } from './screens/Dashboard';
import { History } from './screens/History';
import { Statistics } from './screens/Statistics';
import { Settings } from './screens/settings/Settings';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarStyle: { backgroundColor: '#0a0a0a', borderTopWidth: 1, borderTopColor: '#333333' },
          tabBarActiveTintColor: '#ffb000',
          tabBarInactiveTintColor: '#c8c6c5',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="History" component={History} />
        <Tab.Screen name="Statistics" component={Statistics} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};