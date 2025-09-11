// screens/ViewIntroductionProfile.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useFocusEffect } from '@react-navigation/native';
import { supporterService } from '../../services/supporterService';

const AVATAR_FALLBACK =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAf0Q5orw3lJzIC2j6NFU6Ik2VNcgB.png';

const DAY_NUM_TO_LABEL = { 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 8: 'Chủ nhật' };
const DAY_ORDER = [2, 3, 4, 5, 6, 7, 8];

const SLOT_LABEL = {
  morning: 'Ca sáng (06:00 - 12:00)',
  afternoon: 'Ca chiều (12:00 - 18:00)',
  evening: 'Ca tối (18:00 - 22:00)',
};
const SLOT_SHORT = { morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối' };

const ViewIntroductionProfile = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const res = await supporterService.getMyProfile();
      if (res.success) setProfile(res.data);
      else Alert.alert('Lỗi', res.message || 'Không tải được hồ sơ.');
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không tải được hồ sơ.');
    } finally {
      if (isRefresh) setRefreshing(false);
      setLoading(false);
    }
  };

  // Lần đầu mount
  useEffect(() => { fetchProfile(false); }, []);

  // Tự refetch mỗi khi màn hình được focus (đi từ Edit quay lại)
  useFocusEffect(
    useCallback(() => {
      // tránh giật khung: dùng refresh nhẹ
      fetchProfile(true);
    }, [])
  );

  // Cho phép kéo xuống để làm mới
  const onRefresh = () => { setRefreshing(true); fetchProfile(true); };

  // Gom lịch theo ngày -> [{dayNumber, slots: ['morning','evening']}]
  const scheduleByDay = useMemo(() => {
    const map = {};
    (profile?.schedule || []).forEach((s) => {
      const d = s.dayOfWeek; // 2..8
      if (!map[d]) map[d] = new Set();
      map[d].add(s.timeSlots); // 'morning'|'afternoon'|'evening'
    });
    return DAY_ORDER.map((d) => ({ dayNumber: d, slots: Array.from(map[d] || []) }));
  }, [profile]);

  // Ca của "ngày hiện tại"
  const todaySlots = useMemo(() => {
    const jsDay = new Date().getDay(); // 0..6
    const dayNumber = jsDay === 0 ? 8 : jsDay + 1;
    const found = scheduleByDay.find((d) => d.dayNumber === dayNumber);
    return new Set(found?.slots || []);
  }, [scheduleByDay]);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Icon key={i} name={i < rating ? 'star' : 'star-outline'} size={14} color="#FFD700" />
    ));

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải hồ sơ...</Text>
      </SafeAreaView>
    );
  }

  const fullName = profile?.user?.fullName || 'Supporter';
  const avatar = profile?.user?.avatar || AVATAR_FALLBACK;
  const years = profile?.experience?.totalYears ?? 0;
  const description =
    profile?.experience?.description || 'Chưa có mô tả. Hãy cập nhật để khách hàng hiểu rõ hơn về bạn.';
  const serviceAreaKm = profile?.serviceArea ?? 0;

  const reviews = Array.isArray(profile?.reviews) ? profile.reviews : [];
  const ratingAvg =
    typeof profile?.ratings?.average === 'number'
      ? profile.ratings.average
      : (reviews.reduce((s, r) => s + (r.rating || 0), 0) / (reviews.length || 1)) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: avatar }} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileRole}>Supporter • {years || 0} năm kinh nghiệm</Text>
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>Đã xác minh</Text>
              </View>
            </View>
          </View>

          {/* Stats (demo) */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.stats?.completedJobs ?? 0}</Text>
              <Text style={styles.statLabel}>Công việc hoàn thành</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{(profile?.stats?.successRate ?? 0)}%</Text>
              <Text style={styles.statLabel}>Tỷ lệ thành công</Text>
            </View>
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả công việc</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.tagContainer}>
            <View style={styles.tag}><Text style={styles.tagText}>Chăm sóc người già</Text></View>
          </View>
        </View>

        {/* Work Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch làm việc</Text>
          <Text style={styles.subTitle}>Lịch tuần</Text>

          {scheduleByDay.map(({ dayNumber, slots }) => (
            <View key={dayNumber} style={styles.scheduleItem}>
              <Text style={styles.dayText}>{DAY_NUM_TO_LABEL[dayNumber]}</Text>
              <View style={styles.timeContainer}>
                {slots.length ? (
                  <>
                    <View style={styles.availableDot} />
                    <Text style={styles.timeText}>{slots.map((s) => SLOT_SHORT[s]).join(', ')}</Text>
                  </>
                ) : (
                  <Text style={styles.unavailableText}>Nghỉ</Text>
                )}
              </View>
            </View>
          ))}

          <Text style={styles.nextAvailable}>Bán kính phục vụ: {serviceAreaKm} km</Text>

          {/* 3 ô ca của ngày hiện tại */}
          <View style={styles.shiftContainer}>
            {['morning', 'afternoon', 'evening'].map((slotKey) => {
              const hasToday = todaySlots.has(slotKey);
              return (
                <View key={slotKey} style={styles.shiftButton}>
                  <Text style={styles.shiftText}>{SLOT_LABEL[slotKey]}</Text>
                  <Text style={[styles.shiftStatus, { color: hasToday ? '#FF5722' : '#4CAF50' }]}>
                    {hasToday ? 'Đã có lịch' : 'Có thể nhận'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Services and Pricing — demo tĩnh */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phạm vi & Dịch vụ</Text>
          <Text style={styles.subTitle}>Khu vực hoạt động: {serviceAreaKm} km</Text>

          <Text style={styles.serviceTitle}>Dịch vụ & Giá cả (tham khảo)</Text>
          {[
            { name: 'Chăm sóc hàng ngày', price: '100,000đ/giờ', icon: 'heart' },
            { name: 'Đi khám bệnh', price: '150,000đ/giờ', icon: 'medical' },
            { name: 'Mua sắm, dọn dẹp', price: '80,000đ/giờ', icon: 'bag' },
            { name: 'Tâm sự, trò chuyện', price: '70,000đ/giờ', icon: 'chatbubbles' },
          ].map((service, idx) => (
            <View key={idx} style={styles.serviceItem}>
              <View style={styles.serviceIcon}>
                <Icon name={service.icon} size={20} color="#4A90E2" />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>{service.price}</Text>
              </View>
            </View>
          ))}

          <View style={styles.noteContainer}>
            <Icon name="information-circle-outline" size={16} color="#666666" />
            <Text style={styles.noteText}>
              Lưu ý: Giá có thể thay đổi theo yêu cầu công việc. Vui lòng liên hệ để được tư vấn chi tiết.
            </Text>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>

          {reviews.length === 0 ? (
            <Text style={{ color: '#666' }}>Chưa có đánh giá nào.</Text>
          ) : (
            <>
              <View style={styles.ratingOverview}>
                <View style={styles.ratingLeft}>
                  <Text style={styles.ratingScore}>{ratingAvg.toFixed(1)}</Text>
                  <View style={styles.starsContainer}>{renderStars(Math.round(ratingAvg))}</View>
                  <Text style={styles.ratingCount}>{reviews.length} đánh giá</Text>
                </View>

                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <View key={star} style={styles.ratingBar}>
                        <Text style={styles.starNumber}>{star}</Text>
                        <View style={styles.barContainer}>
                          <View style={[styles.bar, { width: `${pct}%` }]} />
                        </View>
                        <Text style={styles.barCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <Text style={styles.reviewsTitle}>Đánh giá gần đây</Text>
              {reviews.slice(0, 5).map((review, index) => (
                <View key={index} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.avatarText}>
                        {(review.name || 'U')[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewerName}>{review.name || 'Ẩn danh'}</Text>
                      <View style={styles.reviewStars}>{renderStars(review.rating || 0)}</View>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment || ''}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation?.navigate?.('EditIntroduction', {
                initialProfile: profile,
                // Callback: Edit gọi lại để cập nhật ngay lập tức UI hiện tại
                onUpdated: (updatedProfile) => {
                  if (updatedProfile) setProfile(updatedProfile);
                },
              })
            }
          >
            <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => Alert.alert('Thông báo', 'Tính năng đặt dịch vụ đang phát triển.')}
          >
            <Text style={styles.bookButtonText}>Cài đặt & Lịch sử</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#2F66FF', height: 60,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff', flex: 1, textAlign: 'center', marginRight: 10 },
  placeholder: { width: 40 },
  content: { flex: 1 },

  profileSection: { backgroundColor: '#ffffff', padding: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '600', color: '#000000', marginBottom: 4 },
  profileRole: { fontSize: 14, color: '#666666', marginBottom: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center' },
  verifiedText: { fontSize: 12, color: '#4CAF50', marginLeft: 4 },

  statsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#4A90E2' },
  statLabel: { fontSize: 12, color: '#666666', textAlign: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: '#E0E0E0', marginHorizontal: 16 },

  section: { backgroundColor: '#ffffff', padding: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 12 },
  subTitle: { fontSize: 14, color: '#666666', marginBottom: 12 },
  description: { fontSize: 14, color: '#333333', lineHeight: 20, marginBottom: 12 },

  tagContainer: { flexDirection: 'row' },
  tag: { backgroundColor: '#FF6B35', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 12, color: '#ffffff', fontWeight: '500' },

  scheduleItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8,
  },
  dayText: { fontSize: 14, color: '#000000', fontWeight: '500' },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  availableDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 8 },
  timeText: { fontSize: 14, color: '#000000' },
  unavailableText: { fontSize: 14, color: '#999999' },
  nextAvailable: { fontSize: 12, color: '#666666', marginTop: 8, marginBottom: 16 },

  // Shift cards
  shiftContainer: { gap: 8 },
  shiftButton: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, backgroundColor: '#ffffff' },
  shiftText: { fontSize: 14, color: '#000000', fontWeight: '500' },
  shiftStatus: { fontSize: 12, marginTop: 4 },

  serviceTitle: { fontSize: 14, fontWeight: '600', color: '#000000', marginTop: 16, marginBottom: 12 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  serviceIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F7FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, color: '#000000', fontWeight: '500' },
  servicePrice: { fontSize: 14, color: '#4A90E2', fontWeight: '600' },
  noteContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginTop: 16 },
  noteText: { fontSize: 12, color: '#666666', marginLeft: 8, flex: 1, lineHeight: 16 },

  ratingOverview: { flexDirection: 'row', marginBottom: 16 },
  ratingLeft: { alignItems: 'center', marginRight: 24 },
  ratingScore: { fontSize: 32, fontWeight: '700', color: '#000000' },
  starsContainer: { flexDirection: 'row', marginVertical: 4 },
  ratingCount: { fontSize: 12, color: '#666666' },

  ratingBars: { flex: 1 },
  ratingBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  starNumber: { fontSize: 12, color: '#666666', width: 12 },
  barContainer: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, marginHorizontal: 8 },
  bar: { height: 8, backgroundColor: '#FFD700', borderRadius: 4, width: '0%' },
  barCount: { fontSize: 12, color: '#666666', width: 24, textAlign: 'right' },

  reviewsTitle: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: 8 },
  reviewItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF6B35',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 14, color: '#ffffff', fontWeight: '600' },
  reviewInfo: { flex: 1 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: 2 },
  reviewStars: { flexDirection: 'row' },
  reviewComment: { fontSize: 14, color: '#333333', lineHeight: 18 },

  actionButtons: { padding: 16, gap: 12 },
  editButton: { backgroundColor: '#2F66FF', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  editButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  bookButton: { backgroundColor: '#FF8040', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  bookButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});

export default ViewIntroductionProfile;
