import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../../services/userService';

const { height } = Dimensions.get('window');

const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null); // Lưu thông tin user để xác định điều hướng

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userService.getUser?.();
        if (res?.success) setUser(res.data || null);
        else setUser(null);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Hàm validate

  const validate = () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return false;
    }
    if (newPassword === oldPassword) {
      setError('Mật khẩu mới không được trùng mật khẩu cũ.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return false;
    }
    // Check xem mật khẩu có dấu cách không
    if (/\s/.test(newPassword)) {
      setError('Mật khẩu mới không được có dấu cách.');
      return false;
    }
    return true;
  };
  

  const handleChangePassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await userService.changePassword({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      });

      if (res?.success) {
        navigation.navigate('SuccessScreen', {
          title: 'Đổi mật khẩu thành công',
          description:
            res.message ||
            'Bạn đã đổi mật khẩu thành công! Quay lại trang chủ.',
          navigate: user?.role === 'elderly' ? 'ElderHome' : 'FamilyMemberHome',
        });
      } else {
        setError(res?.message || 'Đổi mật khẩu thất bại, vui lòng thử lại.');
      }
    } catch (e) {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header ngang hàng */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Thay đổi mật khẩu</Text>
            <View style={{ width: 28 }} />
            {/* placeholder để cân đối 2 bên */}
          </View>

          {/*Hiển thị view Các điều kiện thay đổi mật khẩu như không có dấu cách và ít nhất 6 kí tự */}
          <Text style={{ color: '#555', fontSize: 12, marginTop: -10 }}>
            - Mật khẩu mới không được có dấu cách
            {'\n'}- Mật khẩu mới phải có ít nhất 6 ký tự
          </Text>

          {/* Mật khẩu cũ */}
          <Text style={styles.label}>Mật khẩu cũ</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu cũ của bạn"
              secureTextEntry={!showOld}
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowOld(v => !v)}
            >
              <Icon name={showOld ? 'eye' : 'eye-off'} size={22} color="#777" />
            </TouchableOpacity>
          </View>

          {/* Mật khẩu mới */}
          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới của bạn"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowNew(v => !v)}
            >
              <Icon name={showNew ? 'eye' : 'eye-off'} size={22} color="#777" />
            </TouchableOpacity>
          </View>

          {/* Nhập lại mật khẩu mới */}
          <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu của bạn"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowConfirm(v => !v)}
            >
              <Icon
                name={showConfirm ? 'eye' : 'eye-off'}
                size={22}
                color="#777"
              />
            </TouchableOpacity>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          {/* Nút lưu */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Đang lưu...' : 'Lưu mật khẩu'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    minHeight: height,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 6,
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    width: '100%',
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    paddingRight: 42,
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  button: {
    marginTop: 25,
    backgroundColor: '#335CFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    textAlign: 'center',
  },
});
