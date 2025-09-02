import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import HomeScreen from '../screens/Site/HomeScreen.jsx';
import RegistersScreen from '../screens/RegistersScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import VerifySMSScreen from '../screens/Auth/VerifySMSScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegistersScreen from '../screens/RegistersScreen';
// import other screens as needed
import LoginScreen from '../screens/Auth/LoginScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';

// HOC footer
import withFooter from '../components/withFooter';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ChangePassword">
        <Stack.Screen
          name="LOGIN"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Registers"
          component={RegistersScreen}
          options={{ title: 'Đăng Ký Cho Người Già' }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifySMS"
          component={VerifySMSScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        
        {/* 👉 Chỉ ChangePassword có footer */}
        <Stack.Screen
          name="ChangePassword"
          component={withFooter(ChangePasswordScreen, 'me')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ headerShown: false }}
                />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
