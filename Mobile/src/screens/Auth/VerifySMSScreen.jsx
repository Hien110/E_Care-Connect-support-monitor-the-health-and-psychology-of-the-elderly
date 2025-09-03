import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { userService } from '../../services/userService';

const OtpVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  
  // Tạo refs cho các TextInput
  const inputRefs = useRef([]);
  
  // Lấy thông tin từ route params
  const { phoneNumber, isResetPassword = false } = route.params || {};

  const handleChange = (text, index) => {
    if (text.length > 1) return; // chỉ cho nhập 1 số
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Tự động nhảy đến ô tiếp theo khi nhập số
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tự động submit khi nhập đủ 4 số
    if (text && index === 3) {
      const completeOtp = newOtp.join("");
      if (completeOtp.length === 4) {
        // Delay một chút để UI cập nhật
        setTimeout(() => {
          handleSubmitWithOtp(completeOtp);
        }, 100);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // Xử lý phím Backspace để nhảy về ô trước
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", ""]);
    // Focus vào ô đầu tiên sau khi reset
    inputRefs.current[0]?.focus();
    
    if (isResetPassword && phoneNumber) {
      setLoading(true);
      try {
        const result = await userService.sendForgotPasswordOTP({ phoneNumber });
        if (result.success) {
          Alert.alert('Thành công', result.message);
        } else {
          Alert.alert('Lỗi', result.message);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi lại mã OTP');
        console.error('Resend OTP error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitWithOtp = async (otpCode = null) => {
    const finalOtpCode = otpCode || otp.join("");
    if (finalOtpCode.length !== 4) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Lỗi', 'Không tìm thấy số điện thoại');
      return;
    }

    setLoading(true);
    try {
      if (isResetPassword) {
        // Xử lý xác thực OTP cho quên mật khẩu
        const result = await userService.verifyForgotPasswordOTP({ 
          phoneNumber, 
          otp: finalOtpCode 
        });
        
        if (result.success) {
          // Chuyển đến màn hình đặt lại mật khẩu
          navigation.navigate('ResetPassword', { 
            resetToken: result.data.resetToken,
            phoneNumber 
          });
        } else {
          Alert.alert('Lỗi', result.message);
        }
      } else {
        // Xử lý OTP cho đăng ký (logic cũ)
        console.log("OTP nhập:", finalOtpCode);
        // TODO: Gọi API xác thực OTP cho đăng ký
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác thực OTP');
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    handleSubmitWithOtp();
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={26} color="#000000ff" />
      </TouchableOpacity>

      <View style={styles.container}>
        {/* Tiêu đề */}
        <Text style={styles.title}>Nhập mã 4 chữ số</Text>
        <Text style={styles.subtitle}>
          Chúng tôi đã gửi mã đến SMS của bạn, vui lòng kiểm tra hộp thư.
        </Text>

        {/* Ô nhập OTP */}
        <View style={styles.otpWrapper}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              autoFocus={index === 0} // Tự động focus vào ô đầu tiên
            />
          ))}
        </View>

        {/* Nút đặt lại mật khẩu */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {isResetPassword 
              ? (loading ? 'Đang xác thực...' : 'Đặt lại mật khẩu')
              : (loading ? 'Đang xác thực...' : 'Xác thực')
            }
          </Text>
        </TouchableOpacity>

        {/* Gửi lại mã */}
        <TouchableOpacity onPress={handleResend} disabled={loading}>
          <Text style={[styles.resendText, loading && styles.textDisabled]}>
            {loading ? 'Đang gửi...' : 'Gửi lại mã'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: 'absolute',
    top: 20, // đẩy xuống 1 chút cho an toàn với status bar
    left: 20,
    zIndex: 20,
  },
  container: {
    flex: 1,
    marginTop: 20,
    alignItems: "center",
    // justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    lineHeight: 20,
  },
  otpWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
    marginTop: 20,
  },
  otpInput: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    backgroundColor: "#fff",
  },
  timer: {
    fontSize: 13,
    color: "#666",
    marginBottom: 25,
  },
  button: {
    width: "100%",
    backgroundColor: "#335CFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendText: {
    fontSize: 15,
    color: "#335CFF",
    fontWeight: "500",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  textDisabled: {
    color: "#ccc",
  },
});
