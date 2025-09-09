import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ thêm để đồng bộ cache local
import { pick } from '@react-native-documents/picker';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  PermissionsAndroid,
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
import { launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import userService from '../../services/userService';

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

const AVATAR_STAMP_KEY = 'ecare_avatar_updated_at';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // dùng để bust cache ảnh & gửi về màn trước
  const [avatarStamp, setAvatarStamp] = useState(0);

  const fetchUser = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const res = await userService.getUserInfo();
      if (res?.success) setUser(res.data);
      else {
        setUser(null);
        setError(res?.message || 'Không lấy được dữ liệu người dùng.');
      }
    } catch (e) {
      setError('Có lỗi khi tải thông tin. Vui lòng thử lại.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchUser(); }, [fetchUser]));
  useEffect(() => { fetchUser(); }, [fetchUser]);

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
    } catch { return ''; }
  };

  // QUAY LẠI: gửi kèm dấu mốc để màn trước biết cập nhật
  const goBack = () => {
  navigation.navigate('PersonalInfo', { avatarUpdatedAt: avatarStamp || Date.now() });
};
  const toRNFile = (obj) => ({
    uri: obj?.fileCopyUri || obj?.uri,
    name:
      obj?.name ||
      obj?.fileName ||
      `avatar_${Date.now()}.${(obj?.type || 'image/jpeg').split('/')[1] || 'jpg'}`,
    type: obj?.type || 'image/jpeg',
  });

  const requestStorageIfNeeded = async () => {
    if (Platform.OS !== 'android') return true;
    const r33 = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );
    if (r33 === PermissionsAndroid.RESULTS.GRANTED || r33 === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return true;
    }
    const r32 = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    return r32 === PermissionsAndroid.RESULTS.GRANTED || r32 === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;
  };

  const handlePickFromLibrary = async () => {
    try {
      const ok = await requestStorageIfNeeded();
      if (!ok) {
        Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập ảnh/tệp để chọn từ thư viện.');
        return;
      }
      const result = await pick({
        type: ['image/*'],
        allowMultiSelection: false,
        mode: 'import',
        presentationStyle: 'fullScreen',
      });
      const file0 = Array.isArray(result) ? result[0] : result;
      if (!file0?.uri) {
        Alert.alert('Lỗi', 'Không lấy được ảnh từ thư viện.');
        return;
      }
      await uploadAvatar(toRNFile(file0));
    } catch (e) {
      if (e?.code === 'OPERATION_CANCELED') return;
      Alert.alert('Lỗi', e?.message || 'Không chọn được ảnh.');
    }
  };

  const showPickSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Huỷ', 'Chọn từ thư viện'], cancelButtonIndex: 0 },
        (idx) => { if (idx === 1) handlePickFromLibrary(); }
      );
    } else {
      Alert.alert('Cập nhật ảnh đại diện', 'Chọn nguồn ảnh', [
        { text: 'Thư viện', onPress: handlePickFromLibrary },
        { text: 'Huỷ', style: 'cancel' },
      ]);
    }
  };

  const uploadAvatar = async (file) => {
  try {
    setUploadingAvatar(true);
    const res = await userService.updateAvatar(file);
    if (!res?.success) throw new Error(res?.message || 'Cập nhật avatar thất bại');

    const newUrl = res?.data?.avatar;
    const ts = Date.now();

    // cập nhật local state
    setUser((prev) => prev ? { ...prev, avatar: newUrl } : prev);

    // cập nhật AsyncStorage để các màn khác & HMR đọc được ngay
    const nextUser = { ...(user || {}), avatar: newUrl };
    await AsyncStorage.setItem('ecare_user', JSON.stringify(nextUser));
    await AsyncStorage.setItem(AVATAR_STAMP_KEY, String(ts));

    // quay về gửi kèm param (nếu đang dùng)
    navigation.navigate('PersonalInfo', { avatarUpdatedAt: ts });

    Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
  } catch (e) {
    Alert.alert('Lỗi', e.message || 'Không thể cập nhật ảnh đại diện.');
  } finally {
    setUploadingAvatar(false);
  }
};


  const onEditAvatar = () => showPickSheet();

  const onEditField = (field) => {
    if (!navigation) return;
    if (field === 'phoneNumber') {
      navigation.navigate('ChangePhonenumber', { currentPhoneNumber: user?.phoneNumber || '' });
    } else if (field === 'email') {
      navigation.navigate('ChangeEmail', { currentEmail: user?.email || '' });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={{ marginTop: 12, color: THEME.subtext }}>Đang tải thông tin…</Text>
      </SafeAreaView>
    );
  }

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

  // helper: thêm cache-buster vào url hiển thị tại màn này
  const avatarUri = (() => {
    const raw = user?.avatar || AVATAR_FALLBACK;
    const sep = raw.includes('?') ? '&' : '?';
    return avatarStamp ? `${raw}${sep}v=${avatarStamp}` : raw;
  })();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />

      <Header
        title="Hồ sơ cá nhân"
        onBack={goBack}
        actions={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Chỉnh sửa hồ sơ"
            style={styles.headerIconBtn}
            onPress={() => onEditField('all')}
          />
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.card, styles.center]}>
          <View style={styles.avatarWrapper}>
            {/* ✅ key để remount Image khi uri đổi → tránh cache cứng */}
            <Image key={String(avatarUri)} source={{ uri: avatarUri }} style={styles.profileImage} />
            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={onEditAvatar}
              accessibilityLabel="Đổi ảnh đại diện"
              accessibilityRole="button"
            >
              <Icon name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.fullName || '—'}</Text>
        </View>

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
          <InfoRow icon="call-outline" label="Số điện thoại" value={user?.phoneNumber} actionText="Chỉnh sửa" onPress={() => onEditField('phoneNumber')} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email} actionText="Chỉnh sửa" onPress={() => onEditField('email')} isLast />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Header = ({ title, onBack, actions }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.headerIconBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel="Quay lại">
      <Icon name="arrow-back" size={22} color={THEME.text} />
    </TouchableOpacity>
    <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 40, alignItems: 'flex-end' }}>{actions || null}</View>
  </View>
);

const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text></View>
);

const InfoRow = ({ icon, label, value, actionText, onPress, isLast = false }) => (
  <View style={[styles.infoRow, isLast ? {} : styles.rowDivider]}>
    <View style={styles.infoLeft}>
      <View style={styles.iconWrap}><Icon name={icon} size={18} color={THEME.primary} /></View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: THEME.white, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: THEME.border,
  },
  headerIconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: THEME.text },
  card: {
    backgroundColor: THEME.white, padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: THEME.border,
    ...Platform.select({ android: { elevation: 1.5 }, ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 } }),
  },
  center: { alignItems: 'center' },
  avatarWrapper: {
    position: 'relative', width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: '#D3D3D3', overflow: 'hidden', padding: 5,
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#f5f5f5' },
  editAvatarButton: {
    position: 'absolute', bottom: 6, right: 9, backgroundColor: '#007AFF',
    borderRadius: 16, padding: 6, borderWidth: 2, borderColor: '#fff', elevation: 5, zIndex: 20,
  },
  avatarOverlay: {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(0,0,0,0.35)',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 50,      
  zIndex: 15,            
},
  name: { marginTop: 12, fontSize: 20, fontWeight: '700', color: THEME.text, textAlign: 'center' },
  sectionHeader: { marginBottom: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: THEME.text },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'space-between' },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: THEME.border },
  infoLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: THEME.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fieldLabel: { fontSize: 12, color: THEME.subtext, marginBottom: 2 },
  fieldValue: { fontSize: 15, color: THEME.text, fontWeight: '500' },
  inlineEditBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: THEME.primary, backgroundColor: '#F5F8FF' },
  inlineEditText: { color: THEME.primary, fontSize: 13, fontWeight: '600' },
  button: {
    backgroundColor: THEME.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    ...Platform.select({ android: { elevation: 1 }, ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 } }),
  },
  buttonText: { color: THEME.white, fontSize: 16, fontWeight: '700' },
  emptyTitle: { marginTop: 8, fontSize: 16, fontWeight: '700', color: THEME.text, textAlign: 'center' },
  emptyText: { marginTop: 6, fontSize: 13, color: THEME.subtext, textAlign: 'center' },
});

export default ProfileScreen;
