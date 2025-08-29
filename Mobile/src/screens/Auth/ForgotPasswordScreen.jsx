import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [phone, setPhone] = React.useState('');

  const handleSendOTP = () => {
    navigation.navigate('VerifySMS');
  };

  return (
    <View style={styles.root}>
      {/* Back button trên cùng */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      {/* Logo */}
      {/* <View style={styles.logoWrapper}>
        <Image
          source={require('../../assets/logoE_Care.png')}
          style={styles.image}
        />
      </View> */}

      {/* Form Quên mật khẩu */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quên mật khẩu</Text>
        </View>

        {/* Mô tả */}
        <Text style={styles.description}>
          Vui lòng nhập số điện thoại của bạn để bắt đầu quá trình đặt lại mật
          khẩu. Một mã xác minh gồm 4 chữ số sẽ được gửi đến SMS của bạn, sau đó
          bạn có thể tạo mật khẩu mới.
        </Text>

        {/* Input số điện thoại */}
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại của bạn"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* Button gửi OTP */}
        <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
          <Text style={styles.buttonText}>Gửi mã OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20, // đẩy xuống 1 chút cho an toàn với status bar
    left: 20,
    zIndex: 20,
  },
  logoWrapper: {
    position: 'absolute',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
  },
  image: {
    width: 220,
    height: 180,
    resizeMode: 'contain',
  },
  container: {
    padding: 20,
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 6,
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
  },
  button: {
    marginTop: 25,
    backgroundColor: '#335CFF',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
