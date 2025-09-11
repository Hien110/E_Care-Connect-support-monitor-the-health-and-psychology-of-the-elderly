import React, { useMemo, useState } from 'react';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { supporterService } from '../../services/supporterService';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const DAY_TO_NUM = {
  'Thứ 2': 2,
  'Thứ 3': 3,
  'Thứ 4': 4,
  'Thứ 5': 5,
  'Thứ 6': 6,
  'Thứ 7': 7,
  'Chủ nhật': 8,
};

// Enum hợp lệ trên backend: morning | afternoon | evening
const SHIFT_ENUM = [
  { label: 'Ca sáng (06:00 - 12:00)', value: 'morning', short: 'Ca sáng' },
  { label: 'Ca chiều (12:00 - 18:00)', value: 'afternoon', short: 'Ca chiều' },
  { label: 'Ca tối (18:00 - 22:00)', value: 'evening', short: 'Ca tối' },
];

// Ảnh fallback cho avatar
const AVATAR_FALLBACK =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAf0Q5orw3lJzIC2j6NFU6Ik2VNcgB.png';

const CreateIntroductionProfile = ({ navigation }) => {
  // ⬇️ NEW: số năm kinh nghiệm
  const [experienceYears, setExperienceYears] = useState('');
  const [experienceYearsError, setExperienceYearsError] = useState('');

  const [jobDescription, setJobDescription] = useState('');
  // mỗi ngày là mảng các ca đã chọn
  const [selectedShifts, setSelectedShifts] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {})
  );
  const [serviceArea, setServiceArea] = useState('10');

  // Modal chọn ca
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  // staging lựa chọn tạm trong modal (ấn Lưu mới áp dụng)
  const [tempSelections, setTempSelections] = useState([]);

  const [loading, setLoading] = useState(false);

  // Popup thành công
  const [showSuccess, setShowSuccess] = useState(false);
  const [profileInfo, setProfileInfo] = useState({ name: '', avatar: '' });

  const disableCreate = useMemo(() => {
    const hasAnyShift = Object.values(selectedShifts).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
    const invalidYears = !!experienceYearsError || experienceYears === '';
    return !jobDescription.trim() || !hasAnyShift || loading || invalidYears;
  }, [jobDescription, selectedShifts, loading, experienceYearsError, experienceYears]);

  // ⬇️ CHỈ NHẬP SỐ 0–60, rỗng cũng coi là lỗi để buộc nhập
  const onChangeExperienceYears = (text) => {
    const onlyDigits = text.replace(/\D/g, '');
    // giới hạn tối đa 2 chữ số để UX gọn (60 năm là hợp lý)
    const clipped = onlyDigits.slice(0, 2);
    setExperienceYears(clipped);

    if (clipped === '') {
      setExperienceYearsError('Vui lòng nhập số năm kinh nghiệm.');
      return;
    }
    const num = Number(clipped);
    if (Number.isNaN(num) || num < 0) {
      setExperienceYearsError('Số năm kinh nghiệm không hợp lệ.');
    } else if (num > 60) {
      setExperienceYearsError('Số năm kinh nghiệm tối đa 60.');
    } else {
      setExperienceYearsError('');
    }
  };

  const openShiftModal = (day) => {
    setCurrentDay(day);
    // CLONE mảng để không trỏ cùng tham chiếu với state chính
    setTempSelections([...(selectedShifts[day] || [])]);
    setShowDropdown(true);
  };

  const toggleTempShift = (value) => {
    setTempSelections((prev) => {
      if (prev.includes(value)) return prev.filter((v) => v !== value);
      return [...prev, value];
    });
  };

  const saveDayShifts = () => {
    // luôn ghi đè bằng mảng mới; nếu rỗng → hiển thị placeholder
    const next = [...tempSelections];
    setSelectedShifts((prev) => ({
      ...prev,
      [currentDay]: next,
    }));
    setShowDropdown(false);
  };

  // Tạo payload: với mỗi ngày và mỗi ca → 1 item trong schedule
  const buildSchedulePayload = () => {
    const out = [];
    for (const day of DAYS) {
      const slots = selectedShifts[day] || [];
      if (slots.length) {
        slots.forEach((slot) => {
          out.push({
            dayOfWeek: DAY_TO_NUM[day],
            timeSlots: slot, // morning|afternoon|evening
          });
        });
      }
    }
    return out;
  };

  const onCreateProfile = async () => {
    const schedule = buildSchedulePayload();

    // Validate nhanh phía client
    if (experienceYears === '' || experienceYearsError) {
      Alert.alert('Thiếu thông tin', experienceYearsError || 'Vui lòng nhập số năm kinh nghiệm.');
      return;
    }
    if (!jobDescription.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mô tả công việc.');
      return;
    }
    if (schedule.length === 0) {
      Alert.alert('Thiếu lịch làm việc', 'Vui lòng chọn ít nhất 1 ca làm.');
      return;
    }

    const areaNum = Number(serviceArea);
    if (Number.isNaN(areaNum) || areaNum < 0) {
      Alert.alert('Khu vực không hợp lệ', 'Vui lòng nhập số km hợp lệ.');
      return;
    }

    const payload = {
      experience: {
        description: jobDescription.trim(),
        totalYears: Math.min(Math.max(Number(experienceYears), 0), 60), // 0..60
      },
      schedule, // nhiều phần tử nếu chọn nhiều ca trong 1 ngày
      serviceArea: Math.min(Math.max(areaNum, 0), 50),
    };

    try {
      setLoading(true);
      const result = await supporterService.createMyProfile(payload);
      setLoading(false);

      if (result.success) {
        const userName = result?.data?.user?.fullName || 'Supporter';
        const userAvatar = result?.data?.user?.avatar || AVATAR_FALLBACK;
        setProfileInfo({ name: userName, avatar: userAvatar });
        setShowSuccess(true);
      } else {
        Alert.alert('Không thành công', result.message || 'Có lỗi xảy ra.');
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Lỗi', e?.message || 'Có lỗi xảy ra.');
    }
  };

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
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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

          <Text style={styles.successTitle}>Tạo hồ sơ thành công!</Text>
          <Text style={styles.successSub}>
            Hồ sơ của bạn đã được tạo thành công. Bây giờ khách hàng có thể tìm thấy và liên hệ với bạn.
          </Text>

          <View style={styles.miniCard}>
            <Image source={{ uri: profileInfo.avatar }} style={styles.miniAvatarImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.miniName} numberOfLines={1}>{profileInfo.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.miniRole}>Supporter chuyên nghiệp</Text>
                <View style={styles.badgeNew}>
                  <Text style={styles.badgeNewText}>Mới tạo</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setShowSuccess(false);
              navigation?.navigate?.('MySupporterProfile');
            }}
          >
            <Text style={styles.primaryBtnText}>Xem hồ sơ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => {
              setShowSuccess(false);
              navigation?.navigate?.('EditSupporterProfile');
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="create-outline" size={18} color="#1A5DFF" style={{ marginRight: 6 }} />
              <Text style={styles.ghostBtnText}>Chỉnh sửa hồ sơ</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // helper: hiển thị chuỗi ca ngắn gọn ngoài list
  const renderDaySelectedShort = (day) => {
    const vals = selectedShifts[day] || [];
    if (!vals.length) return 'Chọn ca làm việc'; // khi mảng rỗng → placeholder
    const shorts = SHIFT_ENUM.filter((s) => vals.includes(s.value)).map((s) => s.short);
    return shorts.join(', ');
    };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2F66FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack?.()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo hồ sơ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Icon */}
        <View style={styles.profileIconSection}>
          <View style={styles.profileIcon}>
            <MaterialIcons name="person" size={32} color="#ffffff" />
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Tạo hồ sơ Supporter</Text>
          <Text style={styles.subtitle}>
            Hãy tạo hồ sơ của bạn để trở thành một Supporter. Bạn sẽ được hưởng quyền lợi từ chúng tôi.
          </Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Lợi ích khi có hồ sơ</Text>

          <View style={styles.benefitItem}>
            <View style={styles.checkIcon}>
              <Icon name="checkmark" size={16} color="#ffffff" />
            </View>
            <Text style={styles.benefitText}>Ưu tiên các việc làm hấp dẫn</Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkIcon}>
              <Icon name="checkmark" size={16} color="#ffffff" />
            </View>
            <Text style={styles.benefitText}>Hỗ trợ được ưu tiên</Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkIcon}>
              <Icon name="checkmark" size={16} color="#ffffff" />
            </View>
            <Text style={styles.benefitText}>Nhận thêm nhiều công việc</Text>
          </View>
        </View>

        {/* Experience Years */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <Text style={styles.fieldLabel}>Số năm kinh nghiệm</Text>
          <TextInput
            style={[
              styles.textInput,
              !!experienceYearsError && { borderColor: '#EF4444' },
            ]}
            value={experienceYears}
            onChangeText={onChangeExperienceYears}
            placeholder="Ví dụ: 2"
            placeholderTextColor="#CCCCCC"
            keyboardType="numeric"
            maxLength={2}
          />
          {!!experienceYearsError && (
            <Text style={{ color: '#EF4444', marginTop: 6 }}>{experienceYearsError}</Text>
          )}
        </View>

        {/* Job Description */}
        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>Mô tả công việc</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Mô tả ngắn gọn về bản thân, kỹ năng, sở thích và kinh nghiệm của bạn"
            placeholderTextColor="#CCCCCC"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Work Schedule */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Lịch làm việc</Text>
          <Text style={styles.fieldLabel}>Chọn ngày và ca làm việc</Text>

          {DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={styles.daySelector}
              onPress={() => openShiftModal(day)}
            >
              <Text style={styles.dayText}>{day}</Text>
              <View style={styles.shiftSelector}>
                <Text
                  style={[
                    styles.shiftText,
                    !(selectedShifts[day] || []).length && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {renderDaySelectedShort(day)}
                </Text>
                <Icon name="chevron-down" size={20} color="#CCCCCC" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Service Area */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Khu vực phục vụ</Text>
          <Text style={styles.fieldLabel}>Bán kính phục vụ (km, tối đa 50)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              value={serviceArea}
              onChangeText={setServiceArea}
              placeholder="10"
              placeholderTextColor="#CCCCCC"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        {/* Create Profile Button */}
        <TouchableOpacity
          style={[styles.createButton, disableCreate && { opacity: 0.6 }]}
          onPress={onCreateProfile}
          disabled={disableCreate}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Tạo hồ sơ</Text>
          )}
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
  headerTitle: {
    fontSize: 18, fontWeight: '600', color: '#ffffff', flex: 1, textAlign: 'center', marginRight: 10,
  },
  placeholder: { width: 40 },
  content: { flex: 1 },
  profileIconSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#ffffff' },
  profileIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  titleSection: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#ffffff' },
  mainTitle: { fontSize: 20, fontWeight: '600', color: '#000000', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666666', textAlign: 'center', lineHeight: 20 },
  benefitsSection: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 16 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkIcon: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#4A90E2', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  benefitText: { fontSize: 14, color: '#000000', flex: 1 },
  formSection: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 16, marginTop: 8 },
  fieldLabel: { fontSize: 14, color: '#000000', marginBottom: 8, fontWeight: '500' },
  textInput: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#000000', backgroundColor: '#ffffff',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  daySelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  dayText: { fontSize: 14, color: '#000000', fontWeight: '500' },
  shiftSelector: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  shiftText: { fontSize: 14, color: '#000000', marginRight: 8 },
  placeholderText: { color: '#CCCCCC' },
  createButton: {
    backgroundColor: '#4A90E2', marginHorizontal: 16, marginVertical: 24,
    paddingVertical: 16, borderRadius: 8, alignItems: 'center',
  },
  createButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

  // Dropdown modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
  },
  dropdownContainer: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    width: '100%', maxWidth: 360,
  },
  dropdownTitle: {
    fontSize: 16, fontWeight: '700', color: '#0B1220',
    marginBottom: 12, textAlign: 'center',
  },
  // checkbox row
  checkRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 8,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#C9D4FF',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#2F66FF',
    borderColor: '#2F66FF',
  },
  dropdownItemText: { fontSize: 14, color: '#0B1220' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 8 },

  dropdownActions: {
    flexDirection: 'row', justifyContent: 'flex-end',
    marginTop: 12,
  },
  btnGhost: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
    borderWidth: 1, borderColor: '#DFE8FF', marginRight: 10, backgroundColor: '#fff',
  },
  btnGhostText: { color: '#2F66FF', fontSize: 14, fontWeight: '700' },
  btnPrimary: {
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10,
    backgroundColor: '#2F66FF',
  },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Success popup styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successCard: {
    width: '100%', maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 20, paddingBottom: 16, paddingHorizontal: 16,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 7,
  },
  successTickWrap: { alignItems: 'center', marginBottom: 12 },
  successTickCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#1A5DFF', alignItems: 'center', justifyContent: 'center',
  },
  successTitle: {
    fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#0B1220', marginTop: 8,
  },
  successSub: {
    fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 18,
  },
  miniCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: '#E5ECFF',
    padding: 10, borderRadius: 12, marginTop: 14,
  },
  miniAvatarImg: {
    width: 42, height: 42, borderRadius: 21, marginRight: 10, backgroundColor: '#E9EEF9',
  },
  miniName: { fontSize: 15, fontWeight: '600', color: '#0B1220' },
  miniRole: { fontSize: 12, color: '#6B7280' },
  badgeNew: {
    marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, backgroundColor: '#E7F0FF', borderWidth: 1, borderColor: '#CFE0FF',
  },
  badgeNewText: { fontSize: 11, color: '#1A5DFF', fontWeight: '600' },
  primaryBtn: {
    marginTop: 14, backgroundColor: '#1A5DFF',
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ghostBtn: {
    marginTop: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#CFE0FF',
    paddingVertical: 12, borderRadius: 10, alignItems: 'center',
  },
  ghostBtnText: { color: '#1A5DFF', fontSize: 15, fontWeight: '700' },
});

export default CreateIntroductionProfile;
