// components/withFooter.js
import React from 'react';
import AppLayout from './AppLayout';

const routeMap = {
  home: 'Home',        // trang chủ
  mood: 'MOOD',
  plan: 'PLAN',
  messages: 'MESSAGES',
  me: 'PROFILE',
};

const withFooter = (ScreenComp, activeKey) => (props) => (
  <AppLayout
    activeTab={activeKey}
    onChangeTab={(key) => props.navigation.navigate(routeMap[key])}
  >
    <ScreenComp {...props} />
  </AppLayout>
);

export default withFooter;
