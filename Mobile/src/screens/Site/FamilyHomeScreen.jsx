import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
// Sửa lại path cho đúng với dự án của bạn
import { userService } from "../../services/userService";
import { useNavigation } from "@react-navigation/native";

/** ========= THEME ========= */
const C = {
  background: "#ffffff",
  foreground: "#111827",
  card: "#ffffff",
  cardFg: "#1f2937",
  mutedBg: "#f8fafc",
  mutedFg: "#6b7280",
  border: "#e5e7eb",
  indigo: "#4f46e5",
  purple: "#7c3aed",
  green: "#22c55e",
  yellow: "#eab308",
  blue: "#3b82f6",
  orange: "#f59e0b",
  red: "#ef4444",
};

const S = { radius: 14 };

/** ========= PROGRESS ========= */
function RNProgress({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

/** ========= BUTTON ========= */
function Button({ title, onPress, variant = "solid", style, left, right }) {
  const solid = variant === "solid";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        solid ? styles.btnSolid : styles.btnGhost,
        { opacity: pressed ? 0.9 : 1 },
        style,
      ]}
    >
      <View style={styles.btnRow}>
        {left ? <View style={{ marginRight: 8 }}>{left}</View> : null}
        <Text style={[styles.btnText, solid ? { color: "#fff" } : { color: C.indigo }]}>{title}</Text>
        {right ? <View style={{ marginLeft: 8 }}>{right}</View> : null}
      </View>
    </Pressable>
  );
}

/** ========= CARD ========= */
function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** ========= CONTACT TILE ========= */
function ContactTile({ contact }) {
  return (
    <View style={styles.contactTile}>
      <View style={{ position: "relative" }}>
        <View style={[styles.tileIconCircle, { backgroundColor: contact.color }]}>
          <Text style={styles.tileIconText}>{contact.icon}</Text>
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: contact.status === "online" ? "#22c55e" : "#9ca3af" },
          ]}
        />
      </View>
      <Text style={styles.contactName} numberOfLines={1}>{contact.name}</Text>
      <Text style={styles.contactSub} numberOfLines={1}>{contact.subtitle}</Text>
    </View>
  );
}

/** ========= MAIN ========= */
export default function EnhancedHealthAppRN() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeTimeframe, setActiveTimeframe] = useState("today");
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigation();

  /** ======= DATA ======= */
  const features = useMemo(
    () => [
      { id: "appointment", icon: "📅", label: "Đặt lịch tư vấn", color: C.orange, desc: "Đặt lịch hẹn với bác sĩ" },
      { id: "diary",      icon: "❤️", label: "Nhật ký sức khỏe", color: C.indigo, desc: "Ghi chép tình trạng" },
      { id: "chat",       icon: "💬", label: "Trò chuyện E-care", color: C.purple, desc: "Tư vấn trực tuyến 24/7" },
      { id: "pressure",   icon: "📈", label: "Huyết áp 120/80",   color: C.green,  desc: "Theo dõi huyết áp" },
      { id: "temperature",icon: "🌡️", label: "Nhiệt độ cơ thể",  color: C.blue,   desc: "Đo hằng ngày" },
      { id: "heartrate",  icon: "⚡", label: "Nhịp tim",          color: C.orange, desc: "Giám sát nhịp tim" },
    ],
    []
  );

  // Thêm type để phân tách người nhà & bác sĩ
  const contacts = useMemo(
    () => [
      { id: "mom",  type: "family", name: "Mẹ",      subtitle: "Minh Tuyền", color: C.purple, icon: "📞", status: "online" },
      { id: "dad",  type: "family", name: "Ba",      subtitle: "Thu Hằng",   color: C.orange, icon: "📞", status: "offline" },
      { id: "doc1", type: "doctor", name: "Bác sĩ",  subtitle: "Bá Lân",     color: C.indigo, icon: "🩺", status: "online" },
    ],
    []
  );

  const familyContacts = useMemo(() => contacts.filter(c => c.type === "family"), [contacts]);
  const doctorContacts = useMemo(() => contacts.filter(c => c.type === "doctor"), [contacts]);

  const activities = useMemo(
    () => [
      { time: "07:30", title: "Đo huyết áp buổi sáng", subtitle: "122/76 mmHg - Bình thường", color: C.green,  icon: "📈", status: "completed" },
      { time: "08:00", title: "Uống thuốc huyết áp",   subtitle: "Đã hoàn thành đúng giờ",    color: C.blue,   icon: "✅", status: "completed" },
      { time: "12:00", title: "Kiểm tra đường huyết",  subtitle: "85 mg/dL - Cần theo dõi",   color: C.yellow, icon: "📊", status: "pending" },
      { time: "14:30", title: "Ghi nhận tâm trạng",    subtitle: "Vui vẻ, tích cực",          color: C.green,  icon: "❤️", status: "pending" },
    ],
    []
  );

  const completed = activities.filter(a => a.status === "completed").length;
  const progressPct = Math.round((completed / activities.length) * 100);

  /** ======= TIME ======= */
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const dateStr = (() => {
    const days = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return `${days[now.getDay()]}, ${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
  })();

  /** ======= LOAD USER INFO ======= */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await userService.getUserInfo();
        if (mounted && res?.success) {
          setMe(res.data?.user || res.data);
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Card style={[styles.headerCard, { backgroundColor: C.indigo }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{
                    uri:
                      me?.avatarUrl ||
                      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=faces",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.onlineDot} />
              </View>
              <View>
                <Text style={styles.hTitle}>Theo dõi sức khỏe gia đình</Text>
                <Text style={styles.hSub}>
                  {me?.fullName || me?.name || "Người dùng"}
                </Text>
              </View>
            </View>
            <View style={styles.ketNoiPill}>
              <Text style={{ color: "#d1fae5", marginRight: 6 }}>📶</Text>
              <Text onPress={() => nav.navigate("FindPeople")} style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>Kết nối</Text>
            </View>
          </View>
          <Text style={styles.updated}>🕒 Cập nhật: Hôm nay, 18:30</Text>
        </Card>

        {/* Time bar */}
        <View style={styles.timeBar}>
          <View>
            <Text style={styles.timeNow}>{timeStr}</Text>
            <Text style={styles.dateNow}>{dateStr}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.scheduleCount}>3 lịch hẹn</Text>
            <Text style={styles.scheduleDay}>Hôm nay</Text>
          </View>
        </View>

        {/* Features */}
        <Card style={{ padding: 14 }}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.iconSquare, { backgroundColor: "#a855f7" }]}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>❤</Text>
              </View>
              <Text style={styles.sectionTitle}>Các chức năng</Text>
            </View>
            <Button title="Tùy chỉnh" variant="ghost" />
          </View>

          <View style={styles.grid2or3}>
            {features.map(f => {
              const active = activeFeature === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  activeOpacity={0.9}
                  onPress={() => setActiveFeature(f.id)}
                  style={[
                    styles.featureTile,
                    { borderColor: active ? C.indigo : C.border, backgroundColor: active ? "#eef2ff" : "#fff" },
                  ]}
                >
                  <View style={[styles.tileIconCircle, { backgroundColor: f.color }]}>
                    <Text style={styles.tileIconText}>{f.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.tileTitle}>{f.label}</Text>
                    <Text numberOfLines={2} style={styles.tileDesc}>{f.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Family connections — grouped */}
        <Card style={{ padding: 14 }}>
          {/* Group: Người nhà */}
          <View style={styles.groupHeader}>
            <View style={styles.groupHeaderLeft}>
              <View style={[styles.iconSquare, { backgroundColor: C.red }]}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>❤</Text>
              </View>
              <Text style={styles.sectionTitle} onPress={() => nav.navigate("FamilyList_Family")}>Người nhà</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{familyContacts.length}</Text>
            </View>
          </View>

          {familyContacts.length ? (
            <View style={styles.contactsGrid}>
              {familyContacts.map(c => <ContactTile key={c.id} contact={c} />)}
            </View>
          ) : (
            <Text style={styles.emptyText}>Chưa có người nhà nào được liên kết</Text>
          )}

          {/* Group: Bác sĩ */}
          <View style={[styles.groupHeader, { marginTop: 14 }]}>
            <View style={styles.groupHeaderLeft}>
              <View style={[styles.iconSquare, { backgroundColor: C.blue }]}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>🩺</Text>
              </View>
              <Text style={styles.sectionTitle}>Bác sĩ</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{doctorContacts.length}</Text>
            </View>
          </View>

          {doctorContacts.length ? (
            <View style={styles.contactsGrid}>
              {doctorContacts.map(c => <ContactTile key={c.id} contact={c} />)}
            </View>
          ) : (
            <Text style={styles.emptyText}>Chưa có bác sĩ nào được liên kết</Text>
          )}

          {/* Action buttons */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Button
              title="Cảnh báo khẩn cấp"
              left={<Text style={{ fontSize: 12 }}>🔔</Text>}
              style={{ flex: 1, backgroundColor: C.red, borderColor: C.red }}
            />
            <Button
              title="Gửi tin nhắn"
              left={<Text style={{ fontSize: 12 }}>📨</Text>}
              style={{ flex: 1, backgroundColor: C.green, borderColor: C.green }}
            />
          </View>
        </Card>

        {/* Activities */}
        <Card style={{ padding: 14 }}>
          <View style={styles.activitiesHeader}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Hoạt động hôm nay</Text>
            {/* Segment chọn khoảng thời gian */}
            <View style={styles.segment}>
              {[
                { id: "today", label: "Hôm nay" },
                { id: "week", label: "Tuần" },
                { id: "month", label: "Tháng" },
              ].map(seg => (
                <TouchableOpacity
                  key={seg.id}
                  onPress={() => setActiveTimeframe(seg.id)}
                  style={[
                    styles.segBtn,
                    activeTimeframe === seg.id && styles.segBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segText,
                      activeTimeframe === seg.id && styles.segTextActive,
                    ]}
                  >
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {activities.map((a, i) => (
              <View key={i} style={styles.activityRow}>
                <Text style={styles.activityTime}>{a.time}</Text>
                <View style={[styles.activityIconCircle, { backgroundColor: a.color }]}>
                  <Text style={{ color: "#fff", fontSize: 14 }}>{a.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle} numberOfLines={1}>{a.title}</Text>
                  <Text style={styles.activitySub} numberOfLines={2}>{a.subtitle}</Text>
                </View>
                <View
                  style={[
                    styles.smallStatusDot,
                    { backgroundColor: a.status === "completed" ? C.green : a.status === "pending" ? C.yellow : "#9ca3af" },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ hôm nay</Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <RNProgress value={progressPct} />
            <Text style={styles.progressHint}>
              <Text style={{ color: C.indigo, fontWeight: "700" }}>{completed}</Text>/{activities.length} hoạt động đã hoàn thành
            </Text>
          </View>
        </Card>

        {loading && (
          <View style={{ padding: 16 }}>
            <ActivityIndicator />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** ========= UTILS ========= */
function capitalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** ========= STYLES ========= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  container: { padding: 16, gap: 14, paddingBottom: 24 },

  // Header
  headerCard: {
    borderRadius: S.radius,
    padding: 14,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: { position: "relative" },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: "rgba(255,255,255,0.35)" },
  onlineDot: { position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: "#22c55e", borderWidth: 2, borderColor: "#fff" },
  hTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  hSub: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 2 },
  ketNoiPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  updated: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 8 },

  // Time bar
  timeBar: { backgroundColor: C.mutedBg, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 14, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between" },
  timeNow: { fontSize: 24, fontWeight: "800", color: "#1f2937" },
  dateNow: { fontSize: 12, color: C.mutedFg, marginTop: 2 },
  scheduleCount: { fontSize: 16, fontWeight: "700", color: C.blue },
  scheduleDay: { fontSize: 12, color: C.mutedFg },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: S.radius,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: C.cardFg, marginLeft: 8 },
  iconSquare: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },

  // Features (icon nhỏ hơn để không tràn)
  grid2or3: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureTile: { width: "48%", borderRadius: 14, borderWidth: 1, padding: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  tileIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  tileIconText: { color: "#fff", fontSize: 16 },
  tileTitle: { fontSize: 13, fontWeight: "700", color: C.cardFg },
  tileDesc: { fontSize: 11, color: C.mutedFg, marginTop: 2 },

  // Contacts (2 nhóm)
  groupHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  groupHeaderLeft: { flexDirection: "row", alignItems: "center" },
  countPill: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#f1f5f9", borderRadius: 999, borderWidth: 1, borderColor: C.border },
  countPillText: { fontSize: 12, color: C.mutedFg, fontWeight: "700" },
  emptyText: { fontSize: 12, color: C.mutedFg, marginBottom: 6 },

  contactsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  contactTile: { width: "31%", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 10, alignItems: "center", gap: 6 },
  contactName: { fontSize: 12.5, fontWeight: "700", color: C.cardFg },
  contactSub: { fontSize: 11, color: C.mutedFg },
  statusDot: { position: "absolute", top: -3, right: -3, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: "#fff" },

  // Buttons
  btn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: C.indigo },
  btnSolid: { backgroundColor: C.indigo },
  btnGhost: { backgroundColor: "transparent" },
  btnRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btnText: { fontWeight: "700", fontSize: 13 },

  // Activities
  activitiesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  segment: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 10, padding: 4 },
  segBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  segBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  segText: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  segTextActive: { color: C.indigo },

  activityRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 10 },
  activityTime: { minWidth: 48, textAlign: "right", color: C.mutedFg, fontSize: 12 },
  activityIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  activityTitle: { fontSize: 13.5, fontWeight: "700", color: C.cardFg },
  activitySub: { fontSize: 12, color: C.mutedFg, marginTop: 2 },
  smallStatusDot: { width: 12, height: 12, borderRadius: 6 },

  // Progress
  progressCard: { marginTop: 14, backgroundColor: "#eef2ff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e0e7ff" },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  progressTitle: { color: C.cardFg, fontSize: 13, fontWeight: "700" },
  progressPct: { color: C.indigo, fontSize: 18, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 6, backgroundColor: "#e5e7eb", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: C.indigo },
  progressHint: { color: C.mutedFg, fontSize: 12, marginTop: 6 },
});
