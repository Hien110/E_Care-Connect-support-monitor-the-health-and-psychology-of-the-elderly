import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import userService from '../../services/userService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const res = await userService.getUserInfo();
      console.log('[ProfileScreen] getUserInfo:', res);
      if (res.success) setUser(res.data);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Không tìm thấy thông tin người dùng</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack && navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xem thông tin cá nhân</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                user.avatar ||
                'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mAf0Q5orw3lJzIC2j6NFU6Ik2VNcgB.png',
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Họ và tên */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Họ và tên</Text>
            <Text style={styles.fieldValue}>{user.fullName || ''}</Text>
          </View>

          {/* Ngày sinh */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Ngày sinh</Text>
            <Text style={styles.fieldValue}>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : ''}</Text>
          </View>

          {/* Giới tính */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Giới tính</Text>
            <Text style={styles.fieldValue}>{user.gender || ''}</Text>
          </View>

          {/* Quê quán */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Quê quán</Text>
            <Text style={styles.fieldValue}>{user.hometown || ''}</Text>
          </View>

          {/* Quốc tịch */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Quốc tịch</Text>
            <Text style={styles.fieldValue}>{user.nationality || 'Việt Nam'}</Text>
          </View>

          {/* Số */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Số</Text>
            <Text style={styles.fieldValue}>{user.identityCard || ''}</Text>
          </View>

          {/* Số điện thoại */}
          <View style={styles.fieldContainerWithButton}>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Số điện thoại</Text>
              <Text style={styles.fieldValue}>{user.phoneNumber || ''}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View style={styles.fieldContainerWithButton}>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{user.email || ''}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Button */}
        <TouchableOpacity style={styles.changeButton}>
          <Text style={styles.changeButtonText}>Thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginLeft: 10,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
  },
  formSection: {
    paddingHorizontal: 16,
  },
  fieldContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldContainerWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  editButton: {
    backgroundColor: '#0046FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: '#0046FF',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarWrapper: {
  position: 'relative',
  width: 100,
  height: 100,
},
profileImage: {
  width: '100%',
  height: '100%',
  borderRadius: 50,
  backgroundColor: '#f5f5f5',
},
editAvatarButton: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '#0046FF',
  borderRadius: 16,
  padding: 6,
  borderWidth: 2,
  borderColor: '#fff', 
  elevation: 3, 
},
});

export default ProfileScreen;
