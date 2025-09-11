// src/navigation/config.js

export const roleTabs = {
  elderly: [
    { key: 'mood',     label: 'Cảm xúc',  icon: 'heart' },
    { key: 'plan',     label: 'Lịch',     icon: 'calendar' },
    { key: 'homeElder',     label: 'Trang chủ', icon: 'home', center: true },
    { key: 'messages', label: 'Tin nhắn', icon: 'chatbubble' },
    { key: 'me',       label: 'Cá nhân',  icon: 'person' },
  ],
  family: [
    { key: 'plan',      label: 'Lịch',      icon: 'calendar' },
    { key: 'alerts',    label: 'Cảnh báo',  icon: 'warning' },
    { key: 'homeFamily',      label: 'Trang chủ', icon: 'home', center: true },
    { key: 'messages',  label: 'Tin nhắn',  icon: 'chatbubble' },
    { key: 'me',       label: 'Cá nhân',   icon: 'person' },
  ],
  supporter: [
    { key: 'tasks',    label: 'Công việc', icon: 'briefcase' },
    { key: 'plan',     label: 'Lịch hẹn',      icon: 'calendar' },
    { key: 'homeSupporter',     label: 'Trang chủ', icon: 'home', center: true },
    { key: 'messages', label: 'Tin nhắn',  icon: 'chatbubble' },
    { key: 'me',       label: 'Cá nhân',   icon: 'person' },
  ],
  doctor: [
    { key: 'patients', label: 'Bệnh nhân', icon: 'people' },
    { key: 'plan',     label: 'Lịch',      icon: 'calendar' },
    { key: 'homeDoctor',     label: 'Trang chủ', icon: 'home', center: true },
    { key: 'insights', label: 'Báo cáo',   icon: 'analytics' },
    { key: 'messages', label: 'Tin nhắn',  icon: 'chatbubble' },
  ],
};

// Thêm bất kỳ routes nào cần thiết cho điều hướng giữa các màn hình trong ứng dụng
export const routeMap = {
  homeElder: 'ElderlyHome',
  homeFamily: 'FamilyHome',
  homeSupporter: 'SupporterHome',
  mood: 'MOOD',
  plan: 'PLAN',
  messages: 'MESSAGES',
  me: 'PersonalInfo',
  dashboard: 'FamilyDashboard',
  alerts: 'ALERTS',
  tasks: 'SupporterIntro',
  patients: 'DOCTOR_PATIENTS',
  insights: 'DOCTOR_INSIGHTS',
};
