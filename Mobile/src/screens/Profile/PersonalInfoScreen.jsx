import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import userService from '../../services/userService';
import FooterNav from '../../components/FooterNav'; 

const PRIMARY = '#0046FF';
const BG = '#F2F3F5';
const WHITE = '#FFFFFF';
const TEXT = '#111827';
const SUB = '#8A8F98';
const LIGHT = '#EAF2FF';
const RED = '#EF4444';
const ORANGE = '#FB923C';
const YELLOW = '#F59E0B';

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
      if (res?.success) {
        setUser(res.data || null);
      } else {
        setUser(null);
        setError(res?.message || 'Không tải được thông tin người dùng.');
      }
    } catch (e) {
      setUser(null);
      setError('Có lỗi khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  }, [fetchUser]);

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

  const heartRate = user?.heartRate ?? '—';
  const calories  = user?.calories  ?? '—';
  const weight    = user?.weight    ?? '—';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* Hero + Header + Avatar */}
      <View style={styles.heroWrapper}>
        <View style={styles.headerBlue}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={goBack}>
              <Icon name="arrow-back" size={22} color={WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{user?.fullName || ''}</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <View style={styles.heroBottom} />

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
      >
        {/* Stats row */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Icon name="heart" size={24} color={RED} />
            <Text style={styles.statLabel}>Nhịp tim</Text>
            <Text style={styles.statValue}>{heartRate}</Text>
          </View>

          <View style={styles.vDivider} />

          <View style={styles.statItem}>
            <Icon name="flame" size={24} color={ORANGE} />
            <Text style={styles.statLabel}>Calo</Text>
            <Text style={styles.statValue}>{calories}</Text>
          </View>

          <View style={styles.vDivider} />

          <View style={styles.statItem}>
            <MaterialIcons name="monitor-weight" size={24} color={YELLOW} />
            <Text style={styles.statLabel}>Cân nặng</Text>
            <Text style={styles.statValue}>{weight}</Text>
          </View>
        </View>

        {/* Error state (nếu có) */}
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
            onPress={() => nav.navigate("Profile")}
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
            onPress={() => {}}
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

  heroWrapper: { position: 'relative', backgroundColor: BG },
  headerBlue: { height: HEADER_H, backgroundColor: PRIMARY, justifyContent: 'flex-start', paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 8 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: WHITE, fontSize: 22, fontWeight: '700', marginRight: 40 },

  heroBottom: { backgroundColor: WHITE, height: 44, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -18 },

  avatarWrap: {
    position: 'absolute',
    top: HEADER_H - AVATAR / 2 - 8,
    alignSelf: 'center',
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: WHITE,
    backgroundColor: '#f5f5f5',
  },
  avatar: { width: '100%', height: '100%', borderRadius: AVATAR / 2 },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: SUB, marginTop: 6, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: PRIMARY },
  vDivider: { width: 1, height: 40, backgroundColor: '#E6E7EA' },

  cardList: { backgroundColor: WHITE, marginTop: 10, paddingHorizontal: 16 },
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

  /* Error */
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

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  navText: { fontSize: 12, color: '#C7C9CE', marginTop: 4 },
});

export default PersonalInfoScreen;
