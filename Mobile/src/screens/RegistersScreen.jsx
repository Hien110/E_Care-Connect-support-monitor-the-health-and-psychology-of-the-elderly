import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from "react-native";
import { userService } from "../services/userService";

const Btn = ({ title, onPress, disabled }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} style={{ backgroundColor: disabled ? "#ccc" : "#007bff", padding: 12, borderRadius: 8, marginTop: 12 }}>
    <Text style={{ color: "#fff", textAlign: "center" }}>{title}</Text>
  </TouchableOpacity>
);

export default function RegistersScreen() {
  const [step, setStep] = useState(1);

  const [role, setRole] = useState("elderly");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [identityCard, setIdentityCard] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // yyyy-mm-dd
  const [gender, setGender] = useState("male");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 2: gửi OTP
  const handleSendOTP = async () => {
    if (!phoneNumber) return Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
    try {
      setLoading(true);
      const res = await userService.sendOTP({ phoneNumber, role });
      setLoading(false);
      if (res.success) {
        Alert.alert("OK", "OTP đã gửi");
        setStep(2.1); // 2.1: màn nhập OTP
      } else {
        Alert.alert("Lỗi", res.message || "Không gửi được OTP");
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("Lỗi", e.message || "Không gửi được OTP");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) return Alert.alert("Lỗi", "OTP 4 chữ số");
    try {
      setLoading(true);
      const res = await userService.verifyOTP({ phoneNumber, otp });
      setLoading(false);
      if (res.success) {
        Alert.alert("OK", "Xác thực OTP thành công");
        setStep(3);
      } else {
        Alert.alert("Lỗi", res.message || "OTP không đúng");
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("Lỗi", e.message || "OTP không đúng");
    }
  };

  const handleSetIdentity = async () => {
    if (!identityCard) return Alert.alert("Lỗi", "Nhập số CCCD");
    try {
      setLoading(true);
      const res = await userService.setIdentity({ phoneNumber, identityCard });
      setLoading(false);
      if (res.success) {
        Alert.alert("OK", "CCCD lưu thành công");
        setStep(4);
      } else {
        Alert.alert("Lỗi", res.message || "Không lưu được CCCD");
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("Lỗi", e.message || "Không lưu được CCCD");
    }
  };

  const handleComplete = async () => {
    if (!fullName || !gender || !password) return Alert.alert("Lỗi", "Vui lòng nhập họ tên, giới tính và mật khẩu");
    try {
      setLoading(true);
      const res = await userService.completeProfile({ phoneNumber, fullName, dateOfBirth, gender, password });
      setLoading(false);
      if (res.success) {
        Alert.alert("Hoàn tất", "Đăng ký thành công");
        // TODO: lưu token, chuyển màn hình login/home
      } else {
        Alert.alert("Lỗi", res.message || "Không thể hoàn tất");
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("Lỗi", e.message || "Không thể hoàn tất");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Đăng ký (step {step})</Text>

      {step === 1 && (
        <View style={{ marginTop: 20 }}>
          <Text>Chọn vai trò</Text>
          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <TouchableOpacity onPress={() => setRole("elderly")} style={{ padding: 10, borderWidth: 1, borderColor: role === "elderly" ? "#007bff" : "#ccc", borderRadius: 8, marginRight: 8 }}>
              <Text>Người cao tuổi</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRole("family")} style={{ padding: 10, borderWidth: 1, borderColor: role === "family" ? "#007bff" : "#ccc", borderRadius: 8 }}>
              <Text>Người thân</Text>
            </TouchableOpacity>
          </View>
          <Btn title="Tiếp theo" onPress={() => setStep(2)} />
        </View>
      )}

      {step === 2 && (
        <View style={{ marginTop: 20 }}>
          <Text>Nhập số điện thoại</Text>
          <TextInput placeholder="097xxxxxxx" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 8 }} />
          <Btn title="Gửi OTP" onPress={handleSendOTP} />
        </View>
      )}

      {step === 2.1 && (
        <View style={{ marginTop: 20 }}>
          <Text>Nhập OTP (4 số)</Text>
          <TextInput placeholder="1234" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={4} style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 8 }} />
          <Btn title="Xác thực OTP" onPress={handleVerifyOTP} />
        </View>
      )}

      {step === 3 && (
        <View style={{ marginTop: 20 }}>
          <Text>Nhập số CCCD / CMND</Text>
          <TextInput placeholder="012345678" value={identityCard} onChangeText={setIdentityCard} keyboardType="number-pad" style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 8 }} />
          <Btn title="Lưu CCCD" onPress={handleSetIdentity} />
        </View>
      )}

      {step === 4 && (
        <View style={{ marginTop: 20 }}>
          <Text>Hoàn tất hồ sơ</Text>
          <TextInput placeholder="Họ và tên" value={fullName} onChangeText={setFullName} style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 8 }} />
          <TextInput placeholder="Ngày sinh (yyyy-mm-dd)" value={dateOfBirth} onChangeText={setDateOfBirth} style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 8 }} />
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            {["male", "female", "other"].map(g => (
              <TouchableOpacity key={g} onPress={() => setGender(g)} style={{ padding: 10, borderWidth: 1, borderColor: gender === g ? "#007bff" : "#ccc", marginRight: 8, borderRadius: 8 }}>
                <Text>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput placeholder="Mật khẩu (>=6 ký tự)" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginTop: 8 }} />
          <Btn title="Hoàn tất đăng ký" onPress={handleComplete} />
        </View>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" />}
    </SafeAreaView>
  );
}
