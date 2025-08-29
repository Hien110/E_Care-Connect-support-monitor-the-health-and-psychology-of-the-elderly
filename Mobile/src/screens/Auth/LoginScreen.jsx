import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"

// asset logo
import logo from "../../assets/logoE_Care.png"

// service
import userService from "../../services/userService"

export default function LoginScreen() {
  const nav = useNavigation()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // chỉ animate logo
  const fadeIn = useRef(new Animated.Value(0)).current
  const floatY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -6,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [fadeIn, floatY])

  const handleLogin = async () => {
    setError("")
    setSuccess("")
    if (!phoneNumber || !password) {
      setError("Vui lòng nhập đủ số điện thoại và mật khẩu.")
      return
    }
    try {
      setLoading(true)
      const res = await userService.loginUser({ phoneNumber, password, rememberMe })
      if (!res.success) {
        setError(res.message || "Đăng nhập thất bại")
        return
      }
      if (res.token) await AsyncStorage.setItem("ecare_token", res.token)
      if (res.user) await AsyncStorage.setItem("ecare_user", JSON.stringify(res.user))

      setSuccess("Đăng nhập thành công")
      nav.reset({ index: 0, routes: [{ name: "Home" }] })
    } catch (e) {
      setError("Có lỗi xảy ra. Thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.inner}>
        {/* Logo + brand */}
        <View style={styles.logoWrap}>
          {/* CHỈ logo có hiệu ứng */}
          <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: floatY }] }}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          {/* brand + tagline không animate */}
          <Text style={styles.brand}>E-CARE</Text>
          <Text style={styles.tagline}>Chăm sóc sức khỏe thông minh</Text>
        </View>

        {/* Card: bỏ hiệu ứng */}
        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
              autoCapitalize="none"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                placeholder="••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                accessibilityLabel="toggle-password-visibility"
              >
                <Text style={{ color: "#64748b", fontWeight: "600" }}>{showPassword ? "Ẩn" : "Hiện"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <TouchableOpacity onPress={() => setRememberMe((v) => !v)} style={styles.checkbox}>
                {rememberMe && <Text style={styles.checkmark}>✔</Text>}
              </TouchableOpacity>
              <Text style={styles.small}>Ghi nhớ đăng nhập</Text>

            <TouchableOpacity onPress={() => nav.navigate("ForgotPassword")}>
              <Text style={[styles.small, { color: "#2563eb", fontWeight: "600" }]}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
          {!!success && <Text style={styles.success}>{success}</Text>}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Đăng nhập</Text>}
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={styles.small}>
              Bạn chưa có tài khoản?{" "}
              <Text onPress={() => nav.navigate("Registers")} style={{ color: "#2563eb", fontWeight: "700" }}>
                Đăng ký ngay
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },
  inner: { flex: 1, padding: 20, justifyContent: "center" },

  logoWrap: { alignItems: "center", marginBottom: 18 },

  logo: { width: 140, height: 140, borderRadius: 28 },

  brand: { marginTop: 2, fontSize: 28, fontWeight: "800", color: "#0f172a" },
  tagline: { marginTop: 2, color: "#64748b" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 12, textAlign: "center" },

  field: { marginBottom: 12 },
  label: { fontSize: 13, color: "#334155", marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    color: "#0f172a",
  },
  eyeBtn: { position: "absolute", right: 12, top: 12, padding: 6 },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkmark: {
    fontSize: 14,
    color: "#4f46e5", // màu tick
    fontWeight: "bold",
  },
  checkboxOn: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },

  small: { fontSize: 13, color: "#475569" },

  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderColor: "#fecaca",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    textAlign: "center",
  },
  success: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderColor: "#bbf7d0",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    textAlign: "center",
  },

  loginBtn: {
    height: 52,
    backgroundColor: "#4f46e5",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})
