import React, { useState, useEffect } from "react";
import userService from "../../services/userService";

function RegisterUserPage() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userData = { name, phoneNumber, password };
      const response = await userService.registerUser(userData);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartPolling = () => {
    if (!phoneNumber) {
      setStatusMsg("Vui lòng nhập số điện thoại");
      return;
    }
    setStatusMsg("Đang chờ ảnh từ điện thoại...");
    setIsPolling(true);
  };

  useEffect(() => {
    if (!isPolling || !phoneNumber) return;
    const interval = setInterval(async () => {
      try {
        const res = await userService.getTempRegister({ phoneNumber });
        if (res.success && res.data?.ocrData) {
          const { ocrData } = res.data;
          setName(ocrData.fullName || "");
          setDateOfBirth(ocrData.dateOfBirth || "");
          setGender(ocrData.gender || "");
          setAddress(ocrData.address || "");
          setIsPolling(false);
          setStatusMsg("Đã tải thông tin từ điện thoại");
        }
      } catch (_) {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isPolling, phoneNumber]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Đăng ký người dùng
        </h2>
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nhập tên của bạn"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nhập số điện thoại"
            />
            <button
              type="button"
              onClick={handleStartPolling}
              className="mt-3 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition"
            >
              Lấy dữ liệu từ điện thoại
            </button>
            {statusMsg && (
              <p className="text-sm text-gray-500 mt-2">{statusMsg}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Ngày sinh
            </label>
            <input
              type="text"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              readOnly
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Giới tính
            </label>
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              readOnly
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="male/female/other"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Địa chỉ
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              readOnly
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Địa chỉ từ CCCD"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
          >
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterUserPage;
