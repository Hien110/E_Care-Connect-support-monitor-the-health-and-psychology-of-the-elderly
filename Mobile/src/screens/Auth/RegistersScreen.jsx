import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../../services/userService';
import { launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import logo from "../../assets/logoBrand.png";
import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';
const Btn = ({ title, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
      backgroundColor: disabled ? '#ccc' : '#007bff',
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      width: '100%',
    }}
  >
    <Text style={{ color: '#fff', textAlign: 'center' }}>{title}</Text>
  </TouchableOpacity>
);

export default function RegistersScreen() {
  const inputRefs = useRef([]);
  const nav = useNavigation();
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(60);
  const [role, setRole] = useState('elderly');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [identityCard, setIdentityCard] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('male');
  const [address, setAddress] = useState('');
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    let timer;
    if (step === 2.1 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [step, countdown]);

  // Chỉ cleanup khi màn hình unmount (thoát flow), không chạy mỗi lần countdown thay đổi
  useEffect(() => {
    return () => {
      cleanupOnExit();
    };
  }, []);

  const cleanupOnExit = async () => {
    if (phoneNumber && step > 1 && step < 4) {
      try {
        await userService.cleanupTempData({ phoneNumber });
      } catch (error) {
        console.log('Cleanup error:', error);
      }
    }
  };

  const handleBack = newStep => {
    if (newStep < step) {
      cleanupOnExit();
    }
    setStep(newStep);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setPhoneError('Vui lòng nhập số điện thoại');
      return;
    }
    try {
      setLoading(true);
      const res = await userService.sendOTP({ phoneNumber, role });
      setLoading(false);
      if (res.success) {
        setPhoneError('');
        setStep(2.1);
        setCountdown(60);
      } else {
        // nếu backend trả về số tồn tại
        setPhoneError(res.message || 'Số điện thoại đã tồn tại');
      }
    } catch (e) {
      setLoading(false);
      setPhoneError('Số điện thoại đã tồn tại');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      setOtpError(true);
      return;
    }
    try {
      setLoading(true);
      const res = await userService.verifyOTP({ phoneNumber, otp });
      setLoading(false);
      if (res.success) {
        setOtpError(false);
        setStep(3);
      } else {
        setOtpError(true);
      }
    } catch (e) {
      setLoading(false);
      setOtpError(true);
    }
  };

  const requestCameraPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const camera = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      // Android 13+
      const readImages = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      ).catch(() => PermissionsAndroid.RESULTS.GRANTED);
      // Older Android
      const readStorage = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      ).catch(() => PermissionsAndroid.RESULTS.GRANTED);

      const ok =
        camera === PermissionsAndroid.RESULTS.GRANTED &&
        (readImages === PermissionsAndroid.RESULTS.GRANTED ||
          readStorage === PermissionsAndroid.RESULTS.GRANTED);
      if (!ok) {
        Alert.alert('Quyền bị từ chối', 'Vui lòng cấp quyền Camera và Ảnh.');
      }
      return ok;
    } catch (e) {
      return false;
    }
  };

  const captureSide = async (side) => {
    const hasPerm = await requestCameraPermissions();
    if (!hasPerm) return null;
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.6, // reduce size to avoid 413
      cameraType: 'back',
      saveToPhotos: false,
      includeExtra: true,
    });
    if (result?.errorCode) {
      Alert.alert('Lỗi Camera', result.errorMessage || result.errorCode);
      return null;
    }
    if (result?.didCancel) {
      return null;
    }
    const asset = result?.assets?.[0];
    if (!asset?.base64) {
      Alert.alert('Lỗi', 'Không nhận được ảnh từ camera');
      return null;
    }
    const base64 = `data:${asset.type};base64,${asset.base64}`;
    if (side === 'front') setFrontImage(base64);
    if (side === 'back') setBackImage(base64);
    return base64;
  };

  const handleExtractFromImages = async () => {
    if (!frontImage || !backImage) return;
    try {
      setLoading(true);
      const res = await userService.uploadIdentity({ phoneNumber, frontImageBase64: frontImage, backImageBase64: backImage });
      setLoading(false);
      if (res.success) {
        setIdentityCard(res.data.identityCard || '');
        setFullName(res.data.fullName || '');
        setDateOfBirth(res.data.dateOfBirth || '');
        setGender(res.data.gender || 'other');
        setAddress(res.data.address || '');
        setStep(4);
      } else {
        console.error('Upload identity failed:', res.message);
        Alert.alert('Lỗi', res.message || 'Không thể trích xuất từ ảnh');
      }
    } catch (e) {
      setLoading(false);
      const msg = e?.response?.data?.message || e?.message || 'Upload identity error';
      console.error('Upload identity exception:', msg);
      Alert.alert('Lỗi', msg);
    }
  };

  const handleComplete = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Mật khẩu không hợp lệ', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    try {
      setLoading(true);
      const res = await userService.completeProfile({ phoneNumber, password });
      setLoading(false);
      if (res.success) {
        Alert.alert('Đăng Ký Thành Công');
        nav.navigate('Login');
      }
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      {/* STEP 1 chọn vai trò */}
      {step === 1 && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <View style={{ marginTop: 25 }}>
            <Image
              source={logo}
              style={{ width: 200, height: 100, resizeMode: 'contain' }}
            />
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            E-CARE{'\n'}Chào mừng bạn!
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#666',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            Vui lòng chọn vai trò của bạn để tiếp tục
          </Text>

          <TouchableOpacity
            onPress={() => setRole('elderly')}
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: role === 'elderly' ? '#007bff' : '#ccc',
              backgroundColor: role === 'elderly' ? '#e6f0ff' : '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#007bff',
                marginBottom: 4,
              }}
            >
              Người cao tuổi
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Tôi là người cao tuổi cần được chăm sóc và theo dõi sức khỏe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRole('family')}
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: role === 'family' ? '#007bff' : '#ccc',
              backgroundColor: role === 'family' ? '#e6f0ff' : '#fff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#007bff',
                marginBottom: 4,
              }}
            >
              Thành viên gia đình
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Tôi là người thân muốn chăm sóc và theo dõi người cao tuổi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStep(2)}
            style={{
              backgroundColor: '#007bff',
              paddingVertical: 14,
              borderRadius: 12,
              width: '100%',
              marginBottom: 16,
            }}
          >
            <Text
              style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}
            >
              TIẾP TỤC
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 14 }}>
            Bạn đã có tài khoản?
            <Text
              onPress={() => nav.navigate('Login')}
              style={{ color: '#2563eb', fontWeight: '700' }}
            >
              Đăng Nhập ngay
            </Text>
          </Text>
        </View>
      )}

      {/* STEP 2 nhập sđt */}
      {step === 2 && (
        <View style={{ flex: 100, justifyContent: 'center', padding: 16 }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}
            onPress={() => handleBack(1)}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginTop: 26 }}>
            <Image
              source={logo}
              style={{ width: 200, height: 100, resizeMode: 'contain' }}
            />
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            E-CARE
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Đăng Ký
          </Text>

          <TextInput
            placeholder="Nhập số điện thoại của bạn"
            value={phoneNumber}
            onChangeText={text => {
              setPhoneNumber(text);
              setPhoneError('');
            }}
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: phoneError ? 'red' : '#ccc',
              padding: 14,
              borderRadius: 12,
              marginBottom: 8,
            }}
          />
          {phoneError ? (
            <Text style={{ color: 'red', fontSize: 12, marginBottom: 12 }}>
              {phoneError}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleSendOTP}
            style={{
              backgroundColor: '#007bff',
              paddingVertical: 14,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text
              style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}
            >
              Đăng ký
            </Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 14, textAlign: 'center' }}>
            Bạn đã có tài khoản?{' '}
            <Text
              onPress={() => nav.navigate('Login')}
              style={{ color: '#2563eb', fontWeight: '700' }}
            >
              Đăng Nhập ngay
            </Text>
          </Text>
        </View>
      )}

      {/* STEP 2.1 nhập OTP */}
      {step === 2.1 && (
  <View style={{ flex: 1, paddingTop: 80, alignItems: 'center' }}>
    <TouchableOpacity
      style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}
      onPress={() => handleBack(2)}
    >
      <Icon name="arrow-back" size={28} color="#000" />
    </TouchableOpacity>

    <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
      Xác thực số điện thoại
    </Text>
    <Text
      style={{ color: '#666', marginBottom: 20, textAlign: 'center' }}
    >
      Chúng tôi sẽ gửi một mã đến số điện thoại của bạn để xác nhận đó là
      của bạn
    </Text>

    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
      }}
    >
      {[0, 1, 2, 3].map(i => (
        <TextInput
          key={i}
          ref={ref => (inputRefs.current[i] = ref)} // tham chiếu input
          value={otp[i] || ''}
          onChangeText={val => {
            const digit = (val || '').replace(/[^0-9]/g, '');
            const newOtp = otp.split('');
            newOtp[i] = digit;
            setOtp(newOtp.join(''));
            if (digit && i < 3) inputRefs.current[i + 1]?.focus();
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') {
              const current = otp[i] || '';
              const newOtp = otp.split('');
              if (current) {
                // Xoá số hiện tại và lùi về ô trước
                newOtp[i] = '';
                setOtp(newOtp.join(''));
                if (i > 0) inputRefs.current[i - 1]?.focus();
              } else if (i > 0) {
                // Ô trống: lùi về ô trước và xoá nó
                inputRefs.current[i - 1]?.focus();
                newOtp[i - 1] = '';
                setOtp(newOtp.join(''));
              }
            }
          }}
          maxLength={1}
          keyboardType="number-pad"
          style={{
            width: 50,
            height: 50,
            borderWidth: 2,
            borderColor: otpError ? 'red' : '#ccc',
            textAlign: 'center',
            fontSize: 20,
            marginHorizontal: 6,
            borderRadius: 8,
            color: '#000', // chữ màu đen
          }}
        />
      ))}
    </View>

    {/* Hiển thị lỗi OTP sai */}
    {otpError && (
      <Text style={{ color: 'red', fontSize: 12, marginBottom: 12 }}>
        Mã OTP không chính xác
      </Text>
    )}

    <Btn title="Xác thực" onPress={handleVerifyOTP} />

    {countdown > 0 ? (
      <Text style={{ marginTop: 16, color: '#666' }}>
        Gửi lại mã trong {countdown}s
      </Text>
    ) : (
      <TouchableOpacity style={{ marginTop: 16 }} onPress={handleSendOTP}>
        <Text style={{ color: '#007bff' }}>Gửi lại mã</Text>
      </TouchableOpacity>
    )}
  </View>
)}

      {/* STEP 3: Chụp CCCD 2 mặt */}
      {step === 3 && (
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}
            onPress={() => handleBack(2.1)}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
              source={logo}
              style={{ width: 80, height: 80, resizeMode: 'contain' }}
            />
          </View>
          <Text>Chụp mặt trước CCCD</Text>
          <Btn title="Chụp mặt trước" onPress={() => captureSide('front')} />
          {frontImage ? (
            <Image source={{ uri: frontImage }} style={{ width: '100%', height: 180, marginTop: 8, borderRadius: 8 }} />
          ) : null}
          <Text style={{ marginTop: 12 }}>Chụp mặt sau CCCD</Text>
          <Btn title="Chụp mặt sau" onPress={() => captureSide('back')} />
          {backImage ? (
            <Image source={{ uri: backImage }} style={{ width: '100%', height: 180, marginTop: 8, borderRadius: 8 }} />
          ) : null}
          <Btn title="Trích xuất thông tin" onPress={handleExtractFromImages} disabled={!(frontImage && backImage)} />
        </View>
      )}

      {/* STEP 4 hoàn tất: hiển thị thông tin từ CCCD, chỉ nhập mật khẩu */}
      {step === 4 && (
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, left: 20, zIndex: 20 }}
            onPress={() => handleBack(3)}
          >
            <Icon name="arrow-back" size={28} color="#000" />
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
              source={logo}
              style={{ width: 80, height: 80, resizeMode: 'contain' }}
            />
          </View>
          <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif' }}>Thông tin nhận diện từ CCCD</Text>
          <TextInput editable={false} value={fullName} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 8,color: '#000', fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif' }} />
          <TextInput editable={false} value={dateOfBirth} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 8,color: '#000', fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif' }} />
          <TextInput editable={false} value={gender} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 8,color: '#000', fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif' }} />
          <TextInput editable={false} value={identityCard} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 8,color: '#000', fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif' }} />
          <TextInput editable={false} value={address} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 8,color: '#000', fontFamily: Platform.OS === 'ios' ? 'Arial' : 'sans-serif' }} />
          <TextInput
            placeholder="Mật khẩu (>=6 ký tự)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              borderRadius: 8,
              marginTop: 8,
            }}
          />
          <Btn title="Hoàn tất đăng ký" onPress={handleComplete} />
        </View>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" />}
    </SafeAreaView>
  );
}
