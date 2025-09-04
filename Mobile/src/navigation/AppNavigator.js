import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import ElderScreen from '../screens/Site/ElderScreen.jsx';
import RegistersScreen from '../screens/Auth/RegistersScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import VerifySMSScreen from '../screens/Auth/VerifySMSScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen.jsx';
import SuccessScreen from '../screens/Site/SuccessScreen';
import PersonalInfoScreen from '../screens/Profile/PersonalInfoScreen.jsx';
import FamilyMemberScreen from '../screens/Site/FamilyScreen.jsx';
import SupporterScreen from '../screens/Site/SupporterScreen.jsx';
import DefaultScreen from '../screens/Error/DefaultScreen.jsx';
// HOC footer
import withFooter from '../components/withFooter';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Registers"
          component={RegistersScreen}
          options={{ headerShown: false }}
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

        <Stack.Screen
          name="SuccessScreen"
          component={SuccessScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="FamilyMember"
          component={withFooter(FamilyMemberScreen, 'home')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Supporter"
          component={withFooter(SupporterScreen, 'home')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DefaultScreen"
          component={DefaultScreen}
          options={{ headerShown: false }}
        />

        {/* 👉 Chỉ ChangePassword có footer */}
        <Stack.Screen
          name="ChangePassword"
          component={withFooter(ChangePasswordScreen, 'me')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Elder"
          component={withFooter(ElderScreen, 'home')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PersonalInfo"
          component={PersonalInfoScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
