import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import userService from "../../services/userService";

export default function HomeScreen() {
  const nav = useNavigation();

  // ===== boot/auth state =====
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);

  // Guard: nếu không có token -> về Login. Nếu có thì load user.
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("ecare_token");
        if (!token) {
          nav.reset({ index: 0, routes: [{ name: "Login" }] });
          return;
        }

        // Lấy user từ local trước cho nhanh
        const cached = await AsyncStorage.getItem("ecare_user");
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {}
        }

        // Thử refresh từ server (interceptor tự gắn token)
        const res = await userService.getUserInfo();
        if (res?.success && res?.data) {
          setUser(res.data);
          await AsyncStorage.setItem("ecare_user", JSON.stringify(res.data));
        }
      } catch (e) {
        // Nếu lỗi nghiêm trọng, cho về login
        nav.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      } finally {
        setBooting(false);
      }
    })();
  }, [nav]);

  // ===== time UI =====
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const timeStr = useMemo(
    () => now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    [now]
  );
  const dateStr = useMemo(() => {
    const weekday = now.toLocaleDateString("vi-VN", { weekday: "long" });
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `${cap(weekday)}, ${day} tháng ${month}, ${year}`;
  }, [now]);

  // ===== notify helpers =====
  const notify = useCallback((msg, type = "info") => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert(type === "success" ? "Thành công" : "Thông báo", msg);
  }, []);

  const handleEmergency = useCallback(() => {
    Alert.alert("Trường hợp khẩn cấp", "Bạn có chắc gọi khẩn cấp không?", [
      { text: "Huỷ", style: "cancel" },
      { text: "Gọi ngay", style: "destructive", onPress: () => notify("Đang gọi 115 • Gia đình • Bác sĩ", "success") },
    ]);
  }, [notify]);

  // ===== features (giữ nguyên) =====
  const bookAppointment = () =>
    Alert.alert("Đặt lịch tư vấn", "📅 Chọn ngày giờ • 👩‍⚕️ Chọn bác sĩ • 💬 Trực tiếp/Video");
  const healthDiary = () => Alert.alert("Nhật ký sức khỏe", "📝 Triệu chứng • 📊 Chỉ số • 💭 Tâm trạng");
  const chatSupport = () => Alert.alert("Trò chuyện cùng E-care", "💬 Chat với AI • 🤖 Tư vấn cơ bản • ❤️ Hỗ trợ tinh thần");
  const findSupport = () => Alert.alert("Tìm người hỗ trợ", "🔍 Giúp việc • 👩‍⚕️ Y tá tại nhà • 🚗 Đưa đón");

  const callFamily = (who) => {
    const contacts = { son: "Con trai Minh Tuấn", daughter: "Con gái Thu Hằng" };
    notify(`Đang gọi cho ${contacts[who]}...\n📞 Kết nối cuộc gọi`, "success");
  };
  const callDoctor = () => notify("Đang gọi Bác sĩ Lan...\n📞 Kết nối phòng khám", "success");

  // ===== logout =====
  const onLogout = useCallback(async () => {
    try {
      await userService.logout?.(); // nếu có trong service
      await AsyncStorage.multiRemove(["ecare_token", "ecare_user"]);
    } finally {
      nav.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }, [nav]);

  // ===== boot splash =====
  if (booting) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#6b7280" }}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  const displayName =
    (user?.fullName && user.fullName.trim()) ||
    (user?.phoneNumber && `người dùng ${user.phoneNumber}`) ||
    "bác Minh";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.hi}>Chào, {displayName}!</Text>
              <Text style={styles.date}>{dateStr}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View style={styles.timePill}>
                <Text style={styles.timeText}>{timeStr}</Text>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Emergency */}
        <Section title="Trường hợp khẩn cấp" icon="🆘" color="#EA3D3D">
          <View style={styles.emgCard}>
            <View style={styles.emgIconWrap}><Text style={styles.emgIcon}>🚨</Text></View>
            <Text style={styles.emgTitle}>Khi cần hỗ trợ ngay</Text>
            <Text style={styles.emgDesc}>Nhấn nút để hệ thống tự liên hệ 115, gia đình và bác sĩ.</Text>
            <TouchableOpacity style={styles.emgBtn} onPress={handleEmergency}>
              <Text style={styles.emgBtnText}>📞 GỌI KHẨN CẤP</Text>
            </TouchableOpacity>
            <Text style={styles.hotline}>Hotline: 115 • Gia đình • Bác sĩ</Text>
          </View>
        </Section>

        {/* Features */}
        <Section title="Các chức năng" icon="✨" color="#3867d6">
          <View style={styles.tileGrid}>
            <Tile bg="#EAF2FF" tint="#3875F6" icon="📅" title="Đặt lịch tư vấn"
              desc="Chọn bác sĩ, trực tiếp hoặc video" onPress={bookAppointment} />
            <Tile bg="#FFF2E7" tint="#FF8A34" icon="📝" title="Nhật ký sức khỏe"
              desc="Ghi chỉ số & cảm xúc" onPress={healthDiary} />
            <Tile bg="#EAFBF4" tint="#16A34A" icon="💬" title="Trò chuyện E-care"
              desc="Tâm sự, hỗ trợ tinh thần" onPress={chatSupport} />
            <Tile bg="#FFEAF1" tint="#E35183" icon="🔍" title="Tìm người hỗ trợ"
              desc="Giúp việc, y tá tại nhà" onPress={findSupport} />
          </View>
        </Section>

        {/* Health overview */}
        <Section title="Tổng quan sức khỏe" icon="📊" color="#16A34A">
          <View style={styles.statRow}>
            <StatChip color="#22C55E" icon="❤️" label="Huyết áp" value="120/80" />
            <StatChip color="#3B82F6" icon="🌡️" label="Nhiệt độ" value="36.6°C" />
            <StatChip color="#F59E0B" icon="💓" label="Nhịp tim" value="72" />
          </View>

          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>Chỉ số sức khỏe tổng thể</Text>
              <Text style={styles.scoreBadge}>Tốt • 85%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "85%" }]} />
            </View>
            <Text style={styles.scoreHint}>Dựa trên các chỉ số gần đây</Text>
          </View>
        </Section>

        {/* Schedule */}
        <Section title="Lịch trình hôm nay" icon="📅" color="#6D28D9">
          <View style={styles.scheduleList}>
            <ScheduleItem icon="💊" title="Uống thuốc huyết áp" sub="08:00 • Đã hoàn thành" status="done" />
            <ScheduleItem icon="🚶" title="Đi bộ trong công viên" sub="16:00 • Sắp đến giờ" status="soon" rightBadge="30 phút" />
            <ScheduleItem icon="💊" title="Uống thuốc tối" sub="20:00 • Chưa đến giờ" status="default" />
          </View>
        </Section>

        {/* Family */}
        <Section title="Kết nối gia đình" icon="👨‍👩‍👧" color="#F43F5E">
          <View style={styles.familyRow}>
            <ContactCard icon="👨" title="Con trai" sub="Minh Tuấn" onPress={() => callFamily("son")} />
            <ContactCard icon="👩" title="Con gái" sub="Thu Hằng" onPress={() => callFamily("daughter")} />
            <ContactCard icon="👩‍⚕️" title="Bác sĩ" sub="Bs. Lan" onPress={callDoctor} />
          </View>

          <View style={styles.msgCard}>
            <View style={styles.msgIcon}><Text>💬</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.msgTitle}>Tin nhắn mới từ con gái</Text>
              <Text style={styles.msgText}>"Bố có uống thuốc chưa ạ? Con nhớ bố nhiều! ❤️"</Text>
              <Text style={styles.msgTime}>2 giờ trước</Text>
            </View>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Subcomponents (giữ nguyên) ---------- */
function Section({ title, icon, color, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.secHeader}>
        <View style={[styles.secChip, { backgroundColor: hexWithAlpha(color, 0.12) }]}>
          <Text style={[styles.secChipText, { color }]}>{icon}</Text>
          <Text style={[styles.secChipText, { color, marginLeft: 6 }]}>{title}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function Tile({ bg, tint, icon, title, desc, onPress }) {
  return (
    <TouchableOpacity style={[styles.tile, { backgroundColor: bg, borderColor: hexWithAlpha(tint, 0.22) }]} onPress={onPress}>
      <View style={[styles.tileIconWrap, { backgroundColor: hexWithAlpha(tint, 0.15) }]}>
        <Text style={[styles.tileIcon, { color: tint }]}>{icon}</Text>
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

function StatChip({ color, icon, label, value }) {
  return (
    <View style={[styles.statChip, { borderColor: hexWithAlpha(color, 0.3), backgroundColor: hexWithAlpha(color, 0.07) }]}>
      <Text style={[styles.statChipIcon, { color }]}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.statChipValue, { color }]}>{value}</Text>
        <Text style={styles.statChipLabel}>{label}</Text>
      </View>
    </View>
  );
}

function ScheduleItem({ icon, title, sub, status = "default", rightBadge }) {
  const map = {
    done: { border: "#22C55E", bg: "#F0FFF7" },
    soon: { border: "#F59E0B", bg: "#FFF8ED" },
    default: { border: "#CBD5E1", bg: "#F8FAFC" },
  };
  const { border, bg } = map[status] ?? map.default;
  return (
    <View style={[styles.schItem, { borderLeftColor: border, backgroundColor: bg }]}>
      <Text style={styles.schIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.schTitle}>{title}</Text>
        <Text style={styles.schSub}>{sub}</Text>
      </View>
      {!!rightBadge && (
        <View style={[styles.badge, { backgroundColor: border }]}>
          <Text style={styles.badgeText}>{rightBadge}</Text>
        </View>
      )}
    </View>
  );
}

function ContactCard({ icon, title, sub, onPress }) {
  return (
    <TouchableOpacity style={styles.contact} onPress={onPress}>
      <View style={styles.contactIconWrap}><Text style={styles.contactIcon}>{icon}</Text></View>
      <Text style={styles.contactTitle}>{title}</Text>
      <Text style={styles.contactSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Utils & styles ---------- */
function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function hexWithAlpha(hex, alpha = 0.1) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F7FB" },
  container: { padding: 16, paddingBottom: 28, gap: 14 },

  /* Header */
  header: {
    backgroundColor: "#5C6CFF",
    borderRadius: 22,
    padding: 18,
    paddingBottom: 22,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hi: { color: "#fff", fontSize: 22, fontWeight: "800" },
  date: { color: "rgba(255,255,255,0.9)", marginTop: 6 },
  timePill: { backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  timeText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  logoutBtn: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "rgba(0,0,0,0.15)", borderRadius: 10 },
  logoutText: { color: "#fff", fontWeight: "700" },

  /* Section */
  section: { gap: 12 },
  secHeader: { paddingHorizontal: 2 },
  secChip: {
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, flexDirection: "row", alignItems: "center",
  },
  secChipText: { fontWeight: "800", fontSize: 16 },

  /* Emergency */
  emgCard: {
    backgroundColor: "#FFEDEE", borderRadius: 18, padding: 16, alignItems: "center",
    borderWidth: 1, borderColor: hexWithAlpha("#EA3D3D", 0.25)
  },
  emgIconWrap: {
    width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: hexWithAlpha("#EA3D3D", 0.15), marginBottom: 8
  },
  emgIcon: { fontSize: 26 },
  emgTitle: { fontSize: 18, fontWeight: "800", color: "#b91c1c", marginBottom: 6 },
  emgDesc: { textAlign: "center", color: "#6b7280", lineHeight: 20, marginBottom: 12 },
  emgBtn: { backgroundColor: "#EA3D3D", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, minWidth: 240, alignItems: "center" },
  emgBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  hotline: { color: "#6b7280", marginTop: 8, fontSize: 12 },

  /* Tiles */
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    flexBasis: "48%", borderRadius: 16, padding: 14, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  tileIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tileIcon: { fontSize: 22 },
  tileTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  tileDesc: { color: "#6b7280", fontSize: 13, lineHeight: 18 },

  /* Health */
  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  statChip: {
    flexGrow: 1, flexBasis: "30%", borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: "row", gap: 10, alignItems: "center"
  },
  statChipIcon: { fontSize: 20 },
  statChipValue: { fontSize: 16, fontWeight: "800" },
  statChipLabel: { color: "#64748b", fontSize: 12 },

  scoreCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  scoreHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  scoreTitle: { fontWeight: "800", fontSize: 16, color: "#111827" },
  scoreBadge: { backgroundColor: hexWithAlpha("#22C55E", 0.15), color: "#16A34A", fontWeight: "800", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  progressTrack: { height: 10, borderRadius: 6, backgroundColor: "#E5E7EB", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#22C55E" },
  scoreHint: { color: "#6b7280", fontSize: 12, marginTop: 8 },

  /* Schedule */
  scheduleList: { gap: 10 },
  schItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderLeftWidth: 5 },
  schIcon: { fontSize: 18, width: 26, textAlign: "center" },
  schTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  schSub: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  /* Family */
  familyRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 10 },
  contact: { flexBasis: "31%", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 14, alignItems: "center" },
  contactIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  contactIcon: { fontSize: 24 },
  contactTitle: { fontWeight: "800", color: "#111827" },
  contactSub: { color: "#6b7280", fontSize: 12 },

  msgCard: { flexDirection: "row", gap: 10, backgroundColor: "#F0FFF7", borderRadius: 16, borderLeftWidth: 5, borderLeftColor: "#22C55E", padding: 14 },
  msgIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center" },
  msgTitle: { fontWeight: "800", color: "#111827", marginBottom: 4, fontSize: 14 },
  msgText: { color: "#475569", marginBottom: 4, lineHeight: 18 },
  msgTime: { color: "#94a3b8", fontSize: 12 },
});