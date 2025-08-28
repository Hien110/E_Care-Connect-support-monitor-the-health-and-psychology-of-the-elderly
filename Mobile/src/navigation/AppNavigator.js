import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/Site/HomeScreen';
import RegistersScreen from '../screens/RegistersScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Registers"
        screenOptions={{ headerShown: true }}
      >
        <Stack.Screen
          name="Registers"
          component={RegistersScreen}
          options={{ title: 'Đăng Ký Cho Người Già' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Trang Chủ' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;