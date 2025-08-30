"use client"

import React, { useState } from "react"
import {
  Eye,
  EyeOff,
  Shield,
  Activity,
  Users,
  BarChart3,
  Lock,
  Phone,
  HelpCircle,
} from "lucide-react"
import userService from "@/services/userService"

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [logoFailed, setLogoFailed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const res = await userService.loginUser({ phoneNumber, password })
      if (!res?.success) {
        setError(res?.message || "Đăng nhập thất bại")
      } else {
        if (res.user?.role !== "admin") {
          setError("Chỉ tài khoản admin mới có thể truy cập trang này")
        } else {
          sessionStorage.setItem("token", res.token)
          localStorage.setItem("currentUser", JSON.stringify(res.user || {}))
          setSuccess(res.message || "Đăng nhập thành công")
          window.location.href = "/admin/dashboard"
        }
      }
    } catch (err) {
      console.error(err)
      setError("Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      {/* LEFT: Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 hidden md:flex md:items-stretch ">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-orange-300/20 rounded-full blur-lg animate-bounce" />
          <div className="absolute bottom-32 left-16 w-40 h-40 bg-cyan-300/15 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-300/20 rounded-full blur-xl animate-bounce" />
        </div>

        {/* Content container */}
        <div className="relative z-10 h-full w-full px-6 lg:px-12">
          <div className="mx-auto max-w-[720px] h-full grid content-center gap-10 py-12 lg:py-20">
            
            {/* Floating Dashboard Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-10 w-fit mx-auto animate-float">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl w-80 border border-white/20 animate-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      <div className="w-3 h-3 bg-green-400 rounded-full" />
                    </div>
                    <div className="text-xs text-gray-500">Dashboard</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full w-3/4 animate-pulse" />
                    <div className="flex space-x-2">
                      <div className="h-16 bg-gradient-to-t from-blue-400 to-blue-600 rounded w-8 animate-pulse" style={{ animationDelay: "100ms" }} />
                      <div className="h-12 bg-gradient-to-t from-green-400 to-green-600 rounded w-8 animate-pulse" style={{ animationDelay: "200ms" }} />
                      <div className="h-20 bg-gradient-to-t from-purple-400 to-purple-600 rounded w-8 animate-pulse" style={{ animationDelay: "300ms" }} />
                      <div className="h-8 bg-gradient-to-t from-yellow-400 to-yellow-600 rounded w-8 animate-pulse" style={{ animationDelay: "400ms" }} />
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full ml-auto animate-spin-slow" />
                  </div>
                </div>
              </div>
            </div>

            {/* Text Block */}
            <div className="relative">
              <div className="absolute -inset-4 bg-black/25 rounded-2xl blur-lg pointer-events-none"></div>
              <div className="relative z-10 text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]">
                  Quản lý{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                    Chăm sóc
                  </span>
                  <br />
                  Sức khỏe
                </h1>

                <p className="text-lg lg:text-xl text-white/90 mb-10 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                  Hệ thống quản lý toàn diện cho việc chăm sóc và theo dõi sức khỏe người cao tuổi
                </p>

                <div className="space-y-5">
                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white drop-shadow">Dashboard Thông minh</h3>
                      <p className="text-white/80 text-sm drop-shadow">Theo dõi tình trạng sức khỏe real-time</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white drop-shadow">Quản lý Bệnh nhân</h3>
                      <p className="text-white/80 text-sm drop-shadow">Hồ sơ chi tiết và lịch sử điều trị</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 group">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white drop-shadow">Báo cáo & Thống kê</h3>
                      <p className="text-white/80 text-sm drop-shadow">Phân tích dữ liệu chuyên sâu</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-10">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30 text-white drop-shadow">🔒 Bảo mật cao</span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30 text-white drop-shadow">⚡ 24/7 Monitor</span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm border border-white/30 text-white drop-shadow">☁️ Cloud Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex items-center justify-center bg-gray-50 relative p-6 sm:p-8">
        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 25px 25px, #6366f1 2px, transparent 0)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="w-full max-w-md relative">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center bg-white">
              {!logoFailed ? (
                <img
                  src="/logo.svg"
                  alt="Logo"
                  className="w-12 h-12 object-contain transition-transform duration-300 hover:scale-105"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 animate-pulse">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Admin Portal</h2>
            <p className="text-gray-600">Hệ thống quản lý chăm sóc sức khỏe</p>
          </div>

          {/* Card */}
          <div className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-xl">
            <div className="p-6 sm:p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Số điện thoại"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      autoComplete="tel"
                      className="w-full h-12 pl-10 rounded-xl border border-gray-200 bg-white px-3 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full h-12 pl-10 pr-10 rounded-xl border border-gray-200 bg-white px-3 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-end">
                  <button type="button" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    Quên mật khẩu?
                  </button>
                </div>

                {/* Error / Success */}
                {(error || success) && (
                  <div
                    className={`text-sm rounded-lg p-3 ${
                      error
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                  >
                    {error || success}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 flex items-center justify-end">
            <div className="hidden sm:block bg-gray-900 text-white text-xs px-3 py-2 rounded-lg w-max mr-3 shadow">
              Cần hỗ trợ?
              <br />
              Liên hệ: support@eldercare.vn
            </div>
            <button
              className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-110 flex items-center justify-center"
              aria-label="Cần hỗ trợ?"
              type="button"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
