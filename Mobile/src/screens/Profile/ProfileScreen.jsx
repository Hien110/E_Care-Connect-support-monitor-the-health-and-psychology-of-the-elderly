import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import userService from '../../services/userService';
import { useFocusEffect } from '@react-navigation/native';
const THEME = {
  primary: '#0046FF',
  primarySoft: '#E8EFFF',
  text: '#111827',
  subtext: '#6B7280',
  bg: '#F7F8FA',
  white: '#FFFFFF',
  border: '#E5E7EB',
  success: '#16A34A',
  danger: '#EF4444',
};

const AVATAR_FALLBACK =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAf0Q5orw3lJzIC2j6NFU6Ik2VNcgB.png';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchUser = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const res = await userService.getUserInfo();
      console.log('[ProfileScreen] getUserInfo:', res);
      if (res?.success) {
        setUser(res.data);
      } else {
        setUser(null);
        setError(res?.message || 'Không lấy được dữ liệu người dùng.');
      }
    } catch (e) {
      console.log(e);
      setError('Có lỗi khi tải thông tin. Vui lòng thử lại.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser])
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  }, [fetchUser]);

  const formatDate = (d) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const goBack = () => navigation?.goBack?.();

  const onEditAvatar = () => {
    // TODO: Mở ActionSheet chọn ảnh từ thư viện / camera
    console.log('Edit avatar pressed');
  };

  const onEditField = (field) => {
  if (!navigation) return;

  if (field === 'phoneNumber') {
    navigation.navigate('ChangePhonenumber', {
      currentPhoneNumber: user?.phoneNumber || '',
    });
  } else if (field === 'email') {
    // sau này nếu bạn làm màn đổi email
    navigation.navigate('ChangeEmail', { currentEmail: user?.email || '' });
  } else {
    console.log('Edit field:', field);
  }
};

  const onSubmitChanges = () => {
    // TODO: Submit thay đổi / hoặc điều hướng sang form
    console.log('Submit changes');
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={{ marginTop: 12, color: THEME.subtext }}>Đang tải thông tin…</Text>
      </SafeAreaView>
    );
  }

  // Empty / Error state
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />
        <Header title="Hồ sơ cá nhân" onBack={goBack} />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={[styles.card, { alignItems: 'center' }]}>
            <Icon name="alert-circle-outline" size={28} color={THEME.danger} />
            <Text style={[styles.emptyTitle]}>Không tìm thấy thông tin người dùng</Text>
            {!!error && <Text style={styles.emptyText}>{error}</Text>}
            <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={fetchUser}>
              <Text style={styles.buttonText}>Thử tải lại</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />

      {/* Header */}
      <Header title="Hồ sơ cá nhân" onBack={goBack} actions={
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Chỉnh sửa hồ sơ"
          style={styles.headerIconBtn}
          onPress={() => onEditField('all')}
        >

        </TouchableOpacity>
      } />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Card */}
        <View style={[styles.card, styles.center]}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  user.avatar ||
                  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAf0Q5orw3lJzIC2j6NFU6Ik2VNcgB.png',
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>


          <Text style={styles.name}>{user?.fullName || '—'}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <SectionHeader title="Thông tin cá nhân" />
          <InfoRow icon="calendar-outline" label="Ngày sinh" value={formatDate(user?.dateOfBirth)} />
          <InfoRow icon="male-female-outline" label="Giới tính" value={user?.gender} />
          <InfoRow icon="home-outline" label="Quê quán" value={user?.hometown} />
          <InfoRow icon="flag-outline" label="Quốc tịch" value={user?.nationality || 'Việt Nam'} />
          <InfoRow icon="document-text-outline" label="Số định danh" value={user?.identityCard} />
        </View>

        <View style={styles.card}>
          <SectionHeader title="Liên hệ" />
          <InfoRow
            icon="call-outline"
            label="Số điện thoại"
            value={user?.phoneNumber}
            actionText="Chỉnh sửa"
            onPress={() => onEditField('phoneNumber')}
          />
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={user?.email}
            actionText="Chỉnh sửa"
            onPress={() => onEditField('email')}
            isLast
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};


const Header = ({ title, onBack, actions }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
      >
        <Icon name="arrow-back" size={22} color={THEME.text} />
      </TouchableOpacity>
      <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40, alignItems: 'flex-end' }}>{actions || null}</View>
    </View>
  );
};

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const InfoRow = ({ icon, label, value, actionText, onPress, isLast = false }) => (
  <View style={[styles.infoRow, isLast ? {} : styles.rowDivider]}>
    <View style={styles.infoLeft}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={18} color={THEME.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || '—'}</Text>
      </View>
    </View>
    {actionText && (
      <TouchableOpacity style={styles.inlineEditBtn} onPress={onPress}>
        <Text style={styles.inlineEditText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

/** ---------- Styles ---------- **/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.border,
  },
  headerIconBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: THEME.text,
  },

  /* Cards */
  card: {
    backgroundColor: THEME.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      android: { elevation: 1.5 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    }),
  },
  center: { alignItems: 'center' },

  /* Avatar + Name */
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff', // viền trắng để nổi bật
    elevation: 3, // đổ bóng nhẹ trên Android
  },


  name: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '700',
    color: THEME.text,
    textAlign: 'center',
  },
  badgeRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: THEME.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  /* Sections */
  sectionHeader: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.border,
  },
  infoLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: THEME.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: THEME.subtext,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    color: THEME.text,
    fontWeight: '500',
  },
  inlineEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.primary,
    backgroundColor: '#F5F8FF',
  },
  inlineEditText: {
    color: THEME.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  /* Buttons */
  button: {
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    }),
  },
  buttonText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
  ghostButton: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: '600',
  },

  /* Empty */
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: THEME.subtext,
    textAlign: 'center',
  },
});

export default ProfileScreen;
