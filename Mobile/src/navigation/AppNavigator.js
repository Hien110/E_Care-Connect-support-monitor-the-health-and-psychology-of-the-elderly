import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/Site/HomeScreen';
import RegistersScreen from '../screens/Auth/RegistersScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import VerifySMSScreen from '../screens/Auth/VerifySMSScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
// import other screens as needed

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registers">
        <Stack.Screen
          name="LOGIN"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Registers"
          component={RegistersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifySMS"
          component={VerifySMSScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;