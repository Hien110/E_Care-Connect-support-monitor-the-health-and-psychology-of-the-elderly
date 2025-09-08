import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import userService from '../../services/userService';

const PRIMARY = '#0046FF';
const PRIMARY_LIGHT = '#2F66FF';
const BG = '#F2F3F5';
const WHITE = '#FFFFFF';
const TEXT = '#111827';
const SUB = '#8A8F98';
const LIGHT = '#EAF2FF';

const AVATAR_FALLBACK =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAf0Q5orw3lJzIC2j6NFU6Ik2VNcgB.png';

const HEADER_H = 172;
const AVATAR = 90;

const PersonalInfoScreen = ({ navigation }) => {
  const nav = navigation;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchUser = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const res = await userService.getUserInfo?.();
      if (res?.success) setUser(res.data || null);
      else { setUser(null); setError(res?.message || 'Không tải được thông tin người dùng.'); }
    } catch {
      setUser(null);
      setError('Có lỗi khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  }, [fetchUser]);

  const onLogout = useCallback(async () => {
    try {
      await userService.logout?.();
      await AsyncStorage.multiRemove(["ecare_token", "ecare_user"]);
    } finally {
      nav.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }, [nav]);

  const goBack = () => navigation?.goBack?.();

  const MenuItem = ({ bg, icon, iconLib = 'ion', color, title, value, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: bg }]}>
          {iconLib === 'ion'
            ? <Icon name={icon} size={20} color={color} />
            : <MaterialIcons name={icon} size={20} color={color} />
          }
        </View>
        <View>
          <Text style={styles.menuTitle}>{title}</Text>
          {!!value && <Text style={styles.menuSub}>{value}</Text>}
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color="#C7C9CE" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: WHITE }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Hero + Header + Avatar */}
      <View style={styles.heroWrapper}>
        <View style={styles.headerBlue}>
          {/* lớp bubble */}
          <View pointerEvents="none" style={styles.bubbleLayer}>
            <View style={[styles.bubble, styles.bubbleA]} />
            <View style={[styles.bubble, styles.bubbleB]} />
            <View style={[styles.bubble, styles.bubbleC]} />
            <View style={[styles.bubble, styles.bubbleD]} />
          </View>

          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={goBack}>
              <Icon name="arrow-back" size={22} color={WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{user?.fullName || ''}</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Add the ellipse overlapping the background */}
        <View style={styles.ellipseOverlay} />

        {/* avatar đè mép xanh–trắng */}
        <View style={styles.avatarWrap}>
          {loading ? (
            <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : (
            <Image
              source={{ uri: (user?.avatar && String(user.avatar)) || AVATAR_FALLBACK }}
              style={styles.avatar}
            />
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 16 }}
      >
        {/* khoảng đệm thay thế cho stats để bố cục vẫn thoáng */}
        <View style={styles.topSpacer} />

        {/* Error (nếu có) */}
        {!!error && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle-outline" size={18} color="#E11D48" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchUser} style={styles.retryBtn}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu list */}
        <View style={styles.cardList}>
          <MenuItem
            bg={LIGHT}
            iconLib="mat"
            icon="person"
            color={PRIMARY}
            title="Thông tin cá nhân"
            onPress={() => nav.navigate('Profile')}
          />
          <MenuItem
            bg="#EAF7F0"
            icon="heart"
            color="#4CAF50"
            title="Thông tin sức khỏe"
            onPress={() => {}}
          />
          <MenuItem
            bg="#FFF3E0"
            iconLib="mat"
            icon="lock"
            color="#FF9800"
            title="Thay đổi mật khẩu"
            onPress={() => {}}
          />
          <MenuItem
            bg="#FFEBEE"
            iconLib="mat"
            icon="logout"
            color="#F44336"
            title="Đăng xuất"
            onPress={onLogout}
          />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* =========== Styles =========== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  headerBlue: {
    height: 80,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'flex-start',
    paddingTop: 8,
    overflow: 'hidden',
  },

  // bubbleLayer: {
  //   ...StyleSheet.absoluteFillObject,
  //   zIndex: 0,
  // },
  // bubble: {
  //   position: 'absolute',
  //   backgroundColor: PRIMARY_LIGHT,
  //   opacity: 0.25,
  //   borderRadius: 9999,
  // },
  // bubbleA: { width: 260, height: 260, top: -140, left: -40 },
  // bubbleB: { width: 220, height: 220, top: -100, right: -60, backgroundColor: '#6E94FF', opacity: 0.22 },
  // bubbleC: { width: 280, height: 280, top: -40, left: 120, opacity: 0.18 },
  // bubbleD: { width: 200, height: 200, top: 40, right: 40, opacity: 0.15 },

  headerRow: {
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: WHITE, fontSize: 22, fontWeight: '700', marginRight: 10, zIndex: 10 },

  avatarWrap: {
    position: 'absolute',
    top: HEADER_H - AVATAR / 2 - 40,
    alignSelf: 'center',
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: WHITE,
    backgroundColor: '#f5f5f5',
    zIndex: 10,
  },
  avatar: { width: '100%', height: '100%', borderRadius: AVATAR / 2 },
ellipseOverlay: {
  position: 'absolute',
  top: 25,  // Adjust to overlap with the blue background
  left: 0,
  width: '100%',  // Full width
  height: 100,  // Ellipse height
  borderColor: PRIMARY,  // Border color
  borderRadius: 50,  // Create a circular border (half of the height/width)
  zIndex: -10,  // Ensure it's behind other elements
  backgroundColor: PRIMARY_LIGHT,  // Match the background color to create the ellipse effect
},


  topSpacer: {
    height: 20,
  },

  cardList: { paddingHorizontal: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    justifyContent: 'space-between',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuTitle: { fontSize: 16, color: TEXT, fontWeight: '500' },
  menuSub: { fontSize: 12, color: SUB, marginTop: 2 },

  errorBox: {
    marginTop: 10,
    backgroundColor: '#FFF1F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: { flex: 1, color: '#9F1239', fontSize: 13 },
  retryBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  retryText: { color: PRIMARY, fontWeight: '700', fontSize: 13 },
});

export default PersonalInfoScreen;
