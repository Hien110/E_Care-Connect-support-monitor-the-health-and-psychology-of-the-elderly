// components/AppLayout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FooterNav from './FooterNav';

const TABS = [
  { key: 'mood',     label: 'Cảm xúc',  icon: 'heart' },
  { key: 'plan',     label: 'Lịch',     icon: 'calendar' },

  // HOME là nút giữa (FAB)
  { key: 'home',     label: 'Trang chủ',icon: 'home' },

  { key: 'messages', label: 'Tin nhắn', icon: 'chatbubble' },
  { key: 'me',       label: 'Cá nhân',  icon: 'person' },
];

const AppLayout = ({ children, activeTab, onChangeTab }) => {
  return (
    <View style={styles.root}>
      <View style={styles.content}>{children}</View>
      <FooterNav
        items={TABS}
        activeKey={activeTab}
        onTabPress={onChangeTab}
        centerKey="home" // quan trọng: chỉ định nút giữa
      />
    </View>
  );
};

export default AppLayout;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
});
