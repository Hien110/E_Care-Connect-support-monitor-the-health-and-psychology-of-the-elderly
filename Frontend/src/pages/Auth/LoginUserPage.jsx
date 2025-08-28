"use client"

import React, { useState } from "react"
import { Eye, EyeOff, Shield, Activity, Users, BarChart3, Lock, Phone, ArrowLeft, HelpCircle } from "lucide-react"
import userService from "@/services/userService"

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const res = await userService.loginUser({ phoneNumber, password })
      if (!res.success) {
        setError(res.message || "Đăng nhập thất bại")
      } else {
        if (rememberMe) localStorage.setItem("token", res.token)
        else sessionStorage.setItem("token", res.token)
        localStorage.setItem("currentUser", JSON.stringify(res.user || {}))
        setSuccess(res.message || "Đăng nhập thành công")
        // window.location.href = "/admin"
      }
    } catch (err) {
      console.error(err)
      setError("Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Section */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-orange-300/20 rounded-full blur-lg animate-bounce delay-1000" />
          <div className="absolute bottom-32 left-16 w-40 h-40 bg-cyan-300/15 rounded-full blur-2xl animate-pulse delay-500" />
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-300/20 rounded-full blur-xl animate-bounce delay-700" />
        </div>

        {/* Floating Dashboard Preview */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-float">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl w-80 border border-white/20">
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
                <div className="h-16 bg-gradient-to-t from-blue-400 to-blue-600 rounded w-8 animate-pulse delay-100" />
                <div className="h-12 bg-gradient-to-t from-green-400 to-green-600 rounded w-8 animate-pulse delay-200" />
                <div className="h-20 bg-gradient-to-t from-purple-400 to-purple-600 rounded w-8 animate-pulse delay-300" />
                <div className="h-8 bg-gradient-to-t from-yellow-400 to-yellow-600 rounded w-8 animate-pulse delay-400" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full ml-auto animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-16 text-white">
          <div className="max-w-lg animate-fade-in-up">
            <h1 className="text-5xl font-bold mb-6 text-balance">
              Quản lý
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 animate-gradient">
                {" "}Chăm sóc
              </span>
              <br />Sức khỏe
            </h1>

            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Hệ thống quản lý toàn diện cho việc chăm sóc và theo dõi sức khỏe người cao tuổi
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Dashboard Thông minh</h3>
                  <p className="text-blue-200 text-sm">Theo dõi tình trạng sức khỏe real-time</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300 delay-100">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Quản lý Bệnh nhân</h3>
                  <p className="text-blue-200 text-sm">Hồ sơ chi tiết và lịch sử điều trị</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300 delay-200">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Báo cáo & Thống kê</h3>
                  <p className="text-blue-200 text-sm">Phân tích dữ liệu chuyên sâu</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-12">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-colors cursor-default">
                🔒 Bảo mật cao
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-colors cursor-default">
                ⚡ 24/7 Monitor
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-colors cursor-default">
                ☁️ Cloud Sync
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, #6366f1 2px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="w-full max-w-md px-8 relative z-10">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h2>
            <p className="text-gray-600">Hệ thống quản lý chăm sóc sức khỏe</p>
          </div>

          {/* Card (HTML thuần) */}
          <div className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-xl animate-fade-in-up delay-200">
            <div className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      autoComplete="tel"
                      className="w-full h-12 pl-10 rounded-xl border border-gray-200 bg-white px-3 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full h-12 pl-10 pr-10 rounded-xl border border-gray-200 bg-white px-3 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <button type="button" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
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
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8 animate-fade-in-up delay-400">
            <button className="inline-flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Quay về trang chủ</span>
            </button>
          </div>

          {/* Support */}
          <div className="fixed bottom-6 right-6 group">
            <button className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
            <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Cần hỗ trợ?
              <br />
              Liên hệ: support@eldercare.vn
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
