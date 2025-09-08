import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import ElderHomeScreen from '../screens/Site/ElderHomeScreen';
import RegistersScreen from '../screens/Auth/RegistersScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import VerifySMSScreen from '../screens/Auth/VerifySMSScreen';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen.jsx';
import SuccessScreen from '../screens/Site/SuccessScreen';
import PersonalInfoScreen from '../screens/Profile/PersonalInfoScreen.jsx';
import FamilyMemberHomeScreen from '../screens/Site/FamilyHomeScreen.jsx';
import SupporterHomeScreen from '../screens/Site/SupporterHomeScreen';
import DefaultScreen from '../screens/Error/DefaultScreen';
import ChangePhonenumberScreen from '../screens/Auth/ChangePhonenumberScreen.jsx';
import OtPChangePhoneScreen from '../screens/Auth/OTPChangePhoneScreen.jsx';
import ChangeEmailScreen from '../screens/Auth/ChangeEmailScreen.jsx';
import OTPChangeEmailScreen from '../screens/Auth/OTPChangeEmailScreen.jsx';
import FindPeopleScreen from '../screens/Connect-family/FindPeopleScreen';
import FamilyConnectionScreen from '../screens/Connect-family/FamilyConnectionScreen';
import FamilyConnectionListScreen from '../screens/Connect-family/FamilyConnectionListScreen';
import FamilyList_FamilyScreen from '../screens/Connect-family/FamilyList_FamilyScreen';
import MessagesListScreen from '../screens/Messages/MessagesListScreen';
import ChatScreen from '../screens/Messages/ChatScreen.jsx';

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
          name="FamilyMemberHome"
          component={withFooter(FamilyMemberHomeScreen, 'home')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SupporterHome"
          component={withFooter(SupporterHomeScreen, 'home')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DefaultScreen"
          component={DefaultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChangePhonenumber"
          component={ChangePhonenumberScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTPChangePhone"
          component={OtPChangePhoneScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ChangeEmail"
          component={ChangeEmailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OTPChangeEmail"
          component={OTPChangeEmailScreen}
          options={{ headerShown: false }}
        />

        {/* 👉 Chỉ ChangePassword có footer */}
        <Stack.Screen
          name="ChangePassword"
          component={withFooter(ChangePasswordScreen, 'me')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ElderHome"
          component={withFooter(ElderHomeScreen, 'home')}
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
        <Stack.Screen
          name="FindPeople"
          component={withFooter(FindPeopleScreen, 'me')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FamilyConnection"
          component={withFooter(FamilyConnectionScreen, 'me')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FamilyConnectionList"
          component={withFooter(FamilyConnectionListScreen, 'me')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FamilyList_Family"
          component={withFooter(FamilyList_FamilyScreen, 'me')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MessagesList"
          component={withFooter(MessagesListScreen, 'me')}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
