// screens/EditIntroductionProfileScreen.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supporterService } from '../../services/supporterService';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const DAY_TO_NUM = { 'Thứ 2': 2, 'Thứ 3': 3, 'Thứ 4': 4, 'Thứ 5': 5, 'Thứ 6': 6, 'Thứ 7': 7, 'Chủ nhật': 8 };
const NUM_TO_DAY = { 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', 8: 'Chủ nhật' };
const SHIFT_ENUM = [
  { label: 'Ca sáng (06:00 - 12:00)', value: 'morning', short: 'Sáng' },
  { label: 'Ca chiều (12:00 - 18:00)', value: 'afternoon', short: 'Chiều' },
  { label: 'Ca tối (18:00 - 22:00)', value: 'evening', short: 'Tối' },
];
const AVATAR_FALLBACK =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAf0Q5orw3lJzIC2j6NFU6Ik2VNcgB.png';

const EditIntroductionProfileScreen = ({ navigation, route }) => {
  // form state
  const [years, setYears] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  // lịch
  const [selectedShifts, setSelectedShifts] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {})
  );

  // modal chọn ca
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [tempSelections, setTempSelections] = useState([]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // popup thành công
  const [showSuccess, setShowSuccess] = useState(false);
  const [profileInfo, setProfileInfo] = useState({ name: '', avatar: '' });

  // ===== Fetch profile để fill form =====
  const hydrateFromProfile = (data) => {
    const expYears = `${Math.max(0, Number(data?.experience?.totalYears ?? 0))}`;
    setYears(expYears);
    setJobDescription(data?.experience?.description ?? '');
    const area = `${Math.max(0, Number(data?.serviceArea ?? 10))}`;
    setServiceArea(area);

    const next = DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {});
    (data?.schedule || []).forEach((s) => {
      const dayLabel = NUM_TO_DAY[s.dayOfWeek];
      if (dayLabel) {
        if (!next[dayLabel]) next[dayLabel] = [];
        next[dayLabel].push(s.timeSlots);
      }
    });
    Object.keys(next).forEach((k) => (next[k] = Array.from(new Set(next[k]))));
    setSelectedShifts(next);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await supporterService.getMyProfile();
      if (res?.success) {
        setProfile(res.data);
        hydrateFromProfile(res.data);
      } else {
        Alert.alert('Lỗi', res?.message || 'Không tải được hồ sơ.');
      }
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không tải được hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ===== Modal chọn ca =====
  const openShiftModal = (day) => {
    setCurrentDay(day);
    setTempSelections([...(selectedShifts[day] || [])]);
    setShowDropdown(true);
  };
  const toggleTempShift = (value) => {
    setTempSelections((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  const saveDayShifts = () => {
    setSelectedShifts((prev) => ({ ...prev, [currentDay]: [...tempSelections] }));
    setShowDropdown(false);
  };

  // ===== Build payload =====
  const buildSchedulePayload = () => {
    const out = [];
    for (const day of DAYS) {
      const slots = selectedShifts[day] || [];
      slots.forEach((slot) => {
        out.push({ dayOfWeek: DAY_TO_NUM[day], timeSlots: slot });
      });
    }
    return out;
  };

  // ===== Validate helpers =====
  const countSelectedSlots = () =>
    DAYS.reduce((sum, d) => sum + (selectedShifts[d]?.length || 0), 0);

  const ensureValid = () => {
    if (
      years.trim() === '' &&
      serviceArea.trim() === '' &&
      jobDescription.trim() === '' &&
      countSelectedSlots() === 0
    ) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập ít nhất một thông tin và/hoặc chọn ca làm việc.');
      return false;
    }

    if (years.trim() === '') {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số năm kinh nghiệm.');
      return false;
    }
    const y = Number(years);
    if (!Number.isFinite(y) || y < 0 || y > 60) {
      Alert.alert('Không hợp lệ', 'Số năm kinh nghiệm phải từ 0 đến 60.');
      return false;
    }

    if (jobDescription.trim() === '') {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mô tả công việc.');
      return false;
    }

    if (serviceArea.trim() === '') {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập bán kính phục vụ.');
      return false;
    }
    const areaNum = Number(serviceArea);
    if (!Number.isFinite(areaNum) || areaNum < 0 || areaNum > 50) {
      Alert.alert('Không hợp lệ', 'Bán kính phục vụ tối đa 50 km.');
      return false;
    }

    if (countSelectedSlots() === 0) {
      Alert.alert('Thiếu lịch làm việc', 'Vui lòng chọn ít nhất một ca làm việc trong tuần.');
      return false;
    }
    return true;
  };

  // ===== Save =====
  const onSave = async () => {
    if (!ensureValid()) return;

    const payload = {
      experience: { totalYears: Number(years), description: jobDescription.trim() },
      serviceArea: Math.round(Math.min(Math.max(Number(serviceArea), 0), 50)),
      schedule: buildSchedulePayload(),
    };

    try {
      setSaving(true);
      const res = await supporterService.updateMyProfile(payload);
      setSaving(false);

      if (res?.success) {
        route?.params?.onUpdated?.(res.data);

        const userName = res?.data?.user?.fullName || 'Supporter';
        const userAvatar = res?.data?.user?.avatar || AVATAR_FALLBACK;
        setProfileInfo({ name: userName, avatar: userAvatar });
        setShowSuccess(true);
      } else {
        Alert.alert('Không thành công', res?.message || 'Có lỗi xảy ra.');
      }
    } catch (e) {
      setSaving(false);
      Alert.alert('Lỗi', e?.message || 'Có lỗi xảy ra.');
    }
  };

  const disableSave = useMemo(() => saving || loading, [saving, loading]);

  const renderShiftDropdown = () => (
    <Modal
      visible={showDropdown}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDropdown(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownTitle}>Chọn ca làm việc cho {currentDay}</Text>

          <FlatList
            data={SHIFT_ENUM}
            keyExtractor={(item) => item.value}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const checked = tempSelections.includes(item.value);
              return (
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => toggleTempShift(item.value)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Icon name="checkmark" size={16} color="#fff" />}
                  </View>
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.dropdownActions}>
            <TouchableOpacity style={styles.btnGhost} onPress={() => setShowDropdown(false)}>
              <Text style={styles.btnGhostText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={saveDayShifts}>
              <Text style={styles.btnPrimaryText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSuccessPopup = () => (
    <Modal
      visible={showSuccess}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSuccess(false)}
    >
      <View style={styles.successOverlay}>
        <View style={styles.successCard}>
          <View style={styles.successTickWrap}>
            <View style={styles.successTickCircle}>
              <Icon name="checkmark" size={28} color="#fff" />
            </View>
          </View>

          <Text style={styles.successTitle}>Cập nhật hồ sơ thành công!</Text>
          <Text style={styles.successSub}>Thông tin hồ sơ của bạn đã được cập nhật.</Text>

          <View style={styles.miniCard}>
            <Image source={{ uri: profileInfo.avatar || AVATAR_FALLBACK }} style={styles.miniAvatarImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.miniName} numberOfLines={1}>{profileInfo.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.miniRole}>Supporter chuyên nghiệp</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setShowSuccess(false);
              navigation?.goBack?.();
            }}
          >
            <Text style={styles.primaryBtnText}>Quay về</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // helper: hiển thị chuỗi ca ngắn gọn
  const renderDaySelectedShort = (day) => {
    const vals = selectedShifts[day] || [];
    if (!vals.length) return 'Chọn ca làm việc';
    const shorts = SHIFT_ENUM.filter((s) => vals.includes(s.value)).map((s) => s.short);
    return shorts.join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" backgroundColor="#2F66FF" />
        <ActivityIndicator size="large" color="#2F66FF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang tải hồ sơ...</Text>
      </SafeAreaView>
    );
  }

  const avatar = profile?.user?.avatar || AVATAR_FALLBACK;
  const fullName = profile?.user?.fullName || 'Supporter';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2F66FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Thông tin cơ bản */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <View style={styles.profileRow}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
              <Text style={styles.role}>Supporter chuyên nghiệp</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Số năm kinh nghiệm</Text>
          <TextInput
            style={styles.textInput}
            value={years}
            onChangeText={(t) => setYears(t.replace(/\D/g, '').slice(0, 2))}
            placeholder="0"
            placeholderTextColor="#CCC"
            keyboardType="number-pad"
            maxLength={2}
          />

          <Text style={styles.fieldLabel}>Mô tả công việc</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Mô tả ngắn gọn về bản thân, kỹ năng, sở thích và kinh nghiệm"
            placeholderTextColor="#CCCCCC"
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Lịch làm việc */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Lịch làm việc</Text>

          {DAYS.map((day) => (
            <TouchableOpacity key={day} style={styles.dayCard} onPress={() => openShiftModal(day)} activeOpacity={0.9}>
              <View style={styles.dayLeft}>
                <Text style={styles.dayTitle}>{day}</Text>
                <Text
                  style={[
                    styles.daySub,
                    !(selectedShifts[day] || []).length && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {renderDaySelectedShort(day)}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color="#0B1220" />
            </TouchableOpacity>
          ))}

          <View style={styles.noteBox}>
            <Icon name="information-circle-outline" size={16} color="#666" />
            <Text style={styles.noteText}>Nhấn vào từng ngày để chọn các ca có thể làm.</Text>
          </View>
        </View>

        {/* Khu vực phục vụ */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Khu vực phục vụ</Text>
          <Text style={styles.fieldLabel}>Bán kính phục vụ (km, tối đa 50)</Text>
          <TextInput
            style={styles.textInput}
            value={serviceArea}
            onChangeText={(t) => setServiceArea(t.replace(/\D/g, '').slice(0, 2))}
            placeholder="10"
            placeholderTextColor="#CCCCCC"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        {/* Nút lưu */}
        <TouchableOpacity
          style={[styles.saveBtn, disableSave && { opacity: 0.6 }]}
          onPress={onSave}
          disabled={disableSave}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu thông tin</Text>}
        </TouchableOpacity>
      </ScrollView>

      {renderShiftDropdown()}
      {renderSuccessPopup()}
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff', flex: 1, textAlign: 'center', marginRight: 40 },
  placeholder: { width: 40 },
  content: { flex: 1 },

  formSection: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 12 },
  fieldLabel: { fontSize: 14, color: '#000', marginBottom: 10, fontWeight: '500' },

  textInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#000', backgroundColor: '#fff', marginBottom: 10,
  },
  textArea: { height: 110, textAlignVertical: 'top' },

  profileRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#E9EEF9' },
  name: { fontSize: 16, fontWeight: '600', color: '#0B1220' },
  role: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  /*** Thẻ ngày có viền như ảnh mẫu ***/
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E3E8EF',     // màu viền nhạt
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  dayLeft: { flex: 1, paddingRight: 10 },
  dayTitle: { fontSize: 16, color: '#0B1220', fontWeight: '700', marginBottom: 4 },
  daySub: { fontSize: 14, color: '#0B1220' },
  placeholderText: { color: '#9AA6B2' }, // màu xám nhạt cho "Chọn ca làm việc"

  noteBox: { flexDirection: 'row', backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginTop: 12 },
  noteText: { fontSize: 12, color: '#666', marginLeft: 8, flex: 1, lineHeight: 16 },

  saveBtn: {
    backgroundColor: '#2F66FF', marginHorizontal: 16, marginVertical: 24,
    paddingVertical: 16, borderRadius: 8, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal chọn ca
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  dropdownContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%', maxWidth: 360 },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: '#0B1220', marginBottom: 12, textAlign: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#C9D4FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: '#2F66FF', borderColor: '#2F66FF' },
  dropdownItemText: { fontSize: 14, color: '#0B1220' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 8 },
  dropdownActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  btnGhost: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
    borderWidth: 1, borderColor: '#DFE8FF', marginRight: 10, backgroundColor: '#fff',
  },
  btnGhostText: { color: '#2F66FF', fontSize: 14, fontWeight: '700' },
  btnPrimary: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: '#2F66FF' },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Success popup
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  successCard: {
    width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 16,
    paddingTop: 20, paddingBottom: 16, paddingHorizontal: 16,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 7,
  },
  successTickWrap: { alignItems: 'center', marginBottom: 12 },
  successTickCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#1A5DFF', alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#0B1220', marginTop: 8 },
  successSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  miniCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: '#E5ECFF',
    padding: 10, borderRadius: 12, marginTop: 14,
  },
  miniAvatarImg: { width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: '#E9EEF9' },
  miniName: { fontSize: 15, fontWeight: '600', color: '#0B1220' },
  miniRole: { fontSize: 12, color: '#6B7280' },
  primaryBtn: { marginTop: 14, backgroundColor: '#1A5DFF', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default EditIntroductionProfileScreen;
