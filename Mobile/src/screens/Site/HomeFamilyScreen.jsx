import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from "react-native";

/** ========= PALETTE & THEME ========= */
const C = {
  background: "#ffffff",
  foreground: "#164e63",
  card: "#ecfeff",
  cardForeground: "#475569",
  primary: "#8b5cf6",
  primaryFg: "#ffffff",
  muted: "#f1f5f9",
  mutedFg: "#64748b",
  border: "#e5e7eb",
  ring: "rgba(139, 92, 246, 0.5)",
  healthPrimary: "#6366f1",
  healthSecondary: "#8b5cf6",
  orange: "#f97316",
  green: "#22c55e",
  blue: "#3b82f6",
  red: "#ef4444",
  yellow: "#eab308",
};

const S = {
  radius: 12,
  cardPadding: 16,
};

/** ========= PROGRESS ========= */
function Progress({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

/** ========= BUTTON (đơn giản) ========= */
function Button({ title, onPress, variant = "solid", color = C.primary, left, right, size = "md", style }) {
  const sizes = {
    sm: { padV: 8, padH: 12, fz: 12 },
    md: { padV: 10, padH: 14, fz: 14 },
    lg: { padV: 12, padH: 16, fz: 15 },
  }[size];

  const base = {
    backgroundColor: variant === "solid" ? color : "transparent",
    borderColor: color,
    borderWidth: variant === "outline" || variant === "ghost" ? 1 : 0,
  };

  const txt = {
    color: variant === "solid" ? "#fff" : (variant === "ghost" ? C.mutedFg : color),
    fontWeight: "700",
    fontSize: sizes.fz,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btnBase,
        { paddingVertical: sizes.padV, paddingHorizontal: sizes.padH, opacity: pressed ? 0.85 : 1 },
        base,
        style,
      ]}
    >
      <View style={styles.btnRow}>
        {left ? <View style={{ marginRight: 8 }}>{left}</View> : null}
        <Text style={txt}>{title}</Text>
        {right ? <View style={{ marginLeft: 8 }}>{right}</View> : null}
      </View>
    </Pressable>
  );
}

/** ========= CARD ========= */
function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** ========= MAIN ========= */
export default function HealthApp() {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = useMemo(
    () => [
      { id: "appointment", icon: "📅", label: "Đặt lịch tư vấn", color: C.orange },
      { id: "diary", icon: "❤️", label: "Nhật ký sức khỏe", color: C.healthPrimary },
      { id: "chat", icon: "💬", label: "Trò chuyện cùng E-care", color: C.healthSecondary },
      { id: "pressure", icon: "🫀", label: "120/80 Huyết áp", color: C.green },
      { id: "temperature", icon: "🌡️", label: "Nhiệt độ", color: C.blue },
      { id: "heartrate", icon: "⚡", label: "Nhịp tim", color: C.orange },
    ],
    []
  );

  const contacts = useMemo(
    () => [
      { id: "mom", name: "Mẹ", subtitle: "Minh Tuyền", color: C.healthSecondary, icon: "📞" },
      { id: "dad", name: "Ba", subtitle: "Thu Hằng", color: C.orange, icon: "📞" },
      { id: "doctor", name: "Bác sĩ", subtitle: "Bá Lân", color: C.healthSecondary, icon: "👤" },
    ],
    []
  );

  const activities = useMemo(
    () => [
      { time: "07:30", title: "Đo huyết áp buổi sáng", subtitle: "122/76 mmHg", color: C.blue, icon: "📈", status: "completed" },
      { time: "08:00", title: "Uống thuốc huyết áp", subtitle: "Đã hoàn thành", color: C.orange, icon: "💊", status: "completed" },
      { time: "12:00", title: "Kiểm tra đường huyết", subtitle: "85 mg/dL", color: C.blue, icon: "📊", status: "pending" },
      { time: "14:30", title: "Ghi nhận tâm trạng", subtitle: "Vui vẻ 😊", color: C.orange, icon: "❤️", status: "pending" },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Theo dõi sức khỏe gia đình</Text>
              <Text style={styles.hSub}>Bà Nguyễn Thị Lan • 68 tuổi</Text>
            </View>
            <View style={styles.connRow}>
              <View style={styles.connDot} />
              <Text style={styles.connText}>Kết nối</Text>
            </View>
          </View>
          <Text style={styles.updatedAt}>Cập nhật: Hôm nay, 18:30</Text>
        </View>

        {/* Features */}
        <Card style={{ padding: S.cardPadding }}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconSquare, { backgroundColor: C.healthSecondary }]}>
                <Text style={styles.iconSquareText}>❤</Text>
              </View>
              <Text style={styles.cardTitle}>Các chức năng</Text>
            </View>
            <Button title="Tùy chỉnh" variant="ghost" size="sm" color={C.healthPrimary} />
          </View>

          <View style={styles.grid3}>
            {features.map((f) => {
              const active = activeFeature === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setActiveFeature(f.id)}
                  style={[styles.tile, active ? styles.tileActive : styles.tileInactive]}
                  activeOpacity={0.9}
                >
                  <View style={[styles.tileIconCircle, { backgroundColor: f.color }]}>
                    <Text style={styles.tileIconText}>{f.icon}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.tileLabel}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Family Connections */}
        <Card style={{ padding: S.cardPadding }}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.iconSquare, { backgroundColor: C.red }]}>
              <Text style={styles.iconSquareText}>❤</Text>
            </View>
            <Text style={styles.cardTitle}>Kết nối người thân</Text>
          </View>

          <View style={[styles.grid3, { marginTop: 16 }]}>
            {contacts.map((c) => (
              <TouchableOpacity key={c.id} style={styles.contactTile} activeOpacity={0.9}>
                <View style={[styles.tileIconCircle, { backgroundColor: c.color }]}>
                  <Text style={styles.tileIconText}>{c.icon}</Text>
                </View>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactSub}>{c.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.quickRow}>
            <Button
              title="Cảnh báo"
              size="lg"
              color={C.red}
              left={<Text style={styles.btnIcon}>🔔</Text>}
              right={<View style={styles.badgePill}><Text style={styles.badgePillText}>0 thông báo mới</Text></View>}
              style={{ flex: 1 }}
            />
            <Button
              title="Tin nhắn"
              size="lg"
              color={C.green}
              left={<Text style={styles.btnIcon}>📤</Text>}
              right={<View style={styles.badgePill}><Text style={styles.badgePillText}>Gửi tin nhắn</Text></View>}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Daily Activities */}
        <Card style={{ padding: S.cardPadding }}>
          <View style={styles.cardHeaderBetween}>
            <Text style={styles.cardTitle}>Hoạt động hôm nay</Text>
            <View style={styles.segmentRow}>
              <Button title="Hôm nay" variant="ghost" size="sm" color={C.healthPrimary} style={styles.segmentActive} />
              <Button title="Tuần" variant="ghost" size="sm" color={C.mutedFg} />
              <Button title="Tháng" variant="ghost" size="sm" color={C.mutedFg} />
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {activities.map((a, idx) => (
              <View key={idx} style={styles.activityRow}>
                <Text style={styles.activityTime}>{a.time}</Text>
                <View style={[styles.activityIconCircle, { backgroundColor: a.color }]}>
                  <Text style={styles.activityIconText}>{a.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{a.title}</Text>
                  <Text style={styles.activitySub}>{a.subtitle}</Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: a.status === "completed" ? C.green : "#d1d5db" },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến độ hôm nay</Text>
              <Text style={styles.progressPct}>67%</Text>
            </View>
            <Progress value={67} />
            <Text style={styles.progressHint}>4/6 hoạt động đã hoàn thành</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

/** ========= STYLES ========= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  container: { padding: 16, gap: 16, paddingBottom: 24 },

  /** Header */
  header: {
    backgroundColor: C.healthPrimary, // có thể thay bằng LinearGradient nếu cần
    borderRadius: S.radius + 4,
    padding: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 22 },
  h1: { color: "#fff", fontSize: 18, fontWeight: "800" },
  hSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
  connRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  connDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  connText: { color: "#fff" },
  updatedAt: { color: "rgba(255,255,255,0.9)", marginTop: 8, fontSize: 12 },

  /** Card */
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
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardHeaderBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: C.foreground },
  iconSquare: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  iconSquareText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  /** Grid 3 columns */
  grid3: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    flexBasis: "31%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  tileInactive: { backgroundColor: "#fff" },
  tileActive: { backgroundColor: C.muted },
  tileIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  tileIconText: { color: "#fff", fontSize: 22 },
  tileLabel: { fontSize: 12, color: C.cardForeground, fontWeight: "600", textAlign: "center", lineHeight: 16 },

  /** Contacts */
  contactTile: {
    flexBasis: "31%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  contactName: { fontSize: 13, fontWeight: "700", color: C.cardForeground },
  contactSub: { fontSize: 11, color: C.mutedFg },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  btnBase: {
    borderRadius: 12,
  },
  btnRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btnIcon: { fontSize: 14 },

  badgePill: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999 },
  badgePillText: { color: "#fff", fontSize: 11 },

  /** Activities */
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  activityTime: { minWidth: 48, textAlign: "right", color: C.mutedFg, fontSize: 12, fontVariant: ["tabular-nums"] },
  activityIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  activityIconText: { color: "#fff", fontSize: 18 },
  activityTitle: { fontSize: 13.5, fontWeight: "700", color: C.cardForeground },
  activitySub: { fontSize: 12, color: C.mutedFg, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  /** Progress card */
  progressCard: { marginTop: 16, backgroundColor: C.muted, borderRadius: 12, padding: 12 },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  progressTitle: { color: C.cardForeground, fontSize: 13, fontWeight: "700" },
  progressPct: { color: C.healthPrimary, fontSize: 13, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 6, backgroundColor: "#e5e7eb", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: C.healthPrimary },
  progressHint: { color: C.mutedFg, fontSize: 12, marginTop: 6 },
});
