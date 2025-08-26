import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const OtpVerificationScreen = ({ navigation }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleChange = (text, index) => {
    if (text.length > 1) return; // chỉ cho nhập 1 số
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };

  const handleResend = () => {
    setOtp(["", "", "", ""]);
    console.log("Gửi lại mã OTP");
  };

  const handleSubmit = () => {
    console.log("OTP nhập:", otp.join(""));
    // TODO: Gọi API xác thực OTP
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
              style={styles.otpInput}
              value={digit}
              keyboardType="number-pad"
              maxLength={1}
              onChangeText={(text) => handleChange(text, index)}
            />
          ))}
        </View>

        {/* Nút đặt lại mật khẩu */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
        </TouchableOpacity>

        {/* Gửi lại mã */}
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>Gửi lại mã</Text>
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
});
