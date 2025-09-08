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

// 🔁 NEW: dùng package mới
import { pick } from '@react-native-documents/picker'; // types có thể không cần; dùng 'image/*' an toàn

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const res = await userService.getUserInfo();
      console.log('[ProfileScreen] getUserInfo:', res);
      if (res?.success) setUser(res.data);
      else {
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

  const goBack = () => navigation.navigate('PersonalInfo');

  // ---- Chuẩn hoá file đưa vào FormData ----
  const toRNFile = (obj) => ({
    uri: obj?.fileCopyUri || obj?.uri,
    name:
      obj?.name ||
      obj?.fileName ||
      `avatar_${Date.now()}.${(obj?.type || 'image/jpeg').split('/')[1] || 'jpg'}`,
    type: obj?.type || 'image/jpeg',
  });

  // ---- Quyền ----
  const requestCameraPermissionIfNeeded = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  // Android ≤ 12 đôi khi vẫn cần quyền đọc; Android 13+ thường không cần (Photo Picker),
  // nhưng để chắc chắn vẫn xin khi device/ROM fallback.
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

  // ---- Pickers ----
  // ✅ MỞ KHO LƯU TRỮ/FILES (ổn trên cả emulator & device)
  const handlePickFromLibrary = async () => {
    try {
      const ok = await requestStorageIfNeeded();
      if (!ok) {
        Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập ảnh/tệp để chọn từ thư viện.');
        return;
      }

      // API của @react-native-documents/picker
      const result = await pick({
        type: ['image/*'],          // lọc chỉ ảnh; dùng chuỗi MIME cho tương thích rộng
        allowMultiSelection: false,
        mode: 'import',             // copy file về sandbox (có uri ổn định)
        presentationStyle: 'fullScreen',
      });

      // API trả về mảng file
      const file0 = Array.isArray(result) ? result[0] : result;
      if (!file0?.uri) {
        Alert.alert('Lỗi', 'Không lấy được ảnh từ thư viện.');
        return;
      }

      const file = toRNFile(file0);
      await uploadAvatar(file);
    } catch (e) {
      // Người dùng bấm Cancel sẽ ném code 'OPERATION_CANCELED'
      if (e?.code === 'OPERATION_CANCELED') return;
      console.log('[@rndocuments/picker] error:', e);
      Alert.alert('Lỗi', e?.message || 'Không chọn được ảnh.');
    }
  };

  const handleTakePhoto = async () => {
    const allowed = await requestCameraPermissionIfNeeded();
    if (!allowed) {
      Alert.alert('Quyền bị từ chối', 'Không thể mở camera.');
      return;
    }
    const res = await launchCamera({ mediaType: 'photo', quality: 0.9, saveToPhotos: true });
    console.log('[launchCamera] res:', res);

    if (res.didCancel) return;
    if (res.errorMessage || res.errorCode) {
      Alert.alert('Lỗi', res.errorMessage || res.errorCode);
      return;
    }
    const asset = res.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('Lỗi', 'Không lấy được ảnh.');
      return;
    }
    await uploadAvatar(toRNFile(asset));
  };

  const showPickSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Huỷ', 'Chụp ảnh', 'Chọn từ thư viện'], cancelButtonIndex: 0 },
        (idx) => { if (idx === 1) handleTakePhoto(); if (idx === 2) handlePickFromLibrary(); }
      );
    } else {
      Alert.alert('Cập nhật ảnh đại diện', 'Chọn nguồn ảnh', [
        { text: 'Chụp ảnh', onPress: handleTakePhoto },
        { text: 'Thư viện', onPress: handlePickFromLibrary },
        { text: 'Huỷ', style: 'cancel' },
      ]);
    }
  };

  // ---- Upload ----
  const uploadAvatar = async (file) => {
  try {
    setUploadingAvatar(true);

    console.log('[uploadAvatar] file chuẩn bị gửi:', file);

    const res = await userService.updateAvatar(file);

    console.log('[uploadAvatar] response từ server:', res);

    if (!res?.success) {
      throw new Error(res?.message || 'Cập nhật avatar thất bại');
    }

    const newUrl = res?.data?.avatar;
    if (newUrl) {
      setUser((prev) => (prev ? { ...prev, avatar: newUrl } : prev));
    } else {
      await fetchUser();
    }

    Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
  } catch (err) {
    // 👉 log chi tiết lỗi ở client
    console.log('[uploadAvatar] error full:', err);

    // Nếu lỗi từ axios (userService.updateAvatar)
    if (err.response) {
      console.log('[uploadAvatar] axios error response:', {
        status: err.response.status,
        data: err.response.data,
        headers: err.response.headers,
      });
    }

    Alert.alert('Lỗi', err.message || 'Không thể cập nhật ảnh đại diện.');
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

  // ------ UI ------
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
            <Image source={{ uri: user.avatar || AVATAR_FALLBACK }} style={styles.profileImage} />
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
      <View className="iconWrap"><Icon name={icon} size={18} color={THEME.primary} /></View>
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
    position: 'relative', 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 3, // Thêm viền xám nhạt
    borderColor: '#D3D3D3', // Màu xám nhạt
    overflow: 'hidden', // Đảm bảo hình ảnh không bị tràn ra ngoài viền
    padding: 5,
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#f5f5f5' },
  editAvatarButton: {
    position: 'absolute', 
    bottom: 6,  // Điều chỉnh vị trí dưới viền
    right: 9, // Điều chỉnh vị trí phải viền
    backgroundColor: '#007AFF', 
    borderRadius: 16, 
    padding: 6,
    borderWidth: 2, 
    borderColor: '#fff', 
    elevation: 5, // Tăng độ nổi
    zIndex: 20, // Đảm bảo ở trên cùng
  },
  avatarOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', borderRadius: 50 },
  name: { marginTop: 12, fontSize: 20, fontWeight: '700', color: THEME.text, textAlign: 'center' },
  sectionHeader: { marginBottom: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: THEME.text },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'space-between' },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: THEME.border },
  infoLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: THEME.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fieldLabel: { fontSize: 12, color: THEME.subtext, marginBottom: 2, marginLeft: 6 },
  fieldValue: { fontSize: 15, color: THEME.text, fontWeight: '500', marginLeft: 6 },
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
