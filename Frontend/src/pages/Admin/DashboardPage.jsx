"use client"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Admin User. Here's what's happening today.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Record</h3>
              <p className="text-sm text-gray-500">Elder care facility revenue tracking</p>
            </div>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-64 mb-6">
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {/* Chart bars */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-16 bg-blue-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Jan</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-20 bg-gray-300 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Feb</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-32 bg-blue-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Mar</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Apr</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-28 bg-blue-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">May</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-24 bg-gray-300 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Jun</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-36 bg-blue-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Jul</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-18 bg-gray-300 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500 transform -rotate-45">Aug</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Pending</div>
              <div className="text-xl font-bold text-orange-600">$5,486</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Completed</div>
              <div className="text-xl font-bold text-green-600">$9,275</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Rejected</div>
              <div className="text-xl font-bold text-red-600">$3,868</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Revenue</div>
              <div className="text-xl font-bold text-blue-600">$50,668</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Total Residents Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold">30,569</div>
              <div className="bg-white/20 px-2 py-1 rounded text-sm">12%</div>
            </div>
            <div className="text-blue-100 text-sm mb-4">Total Residents</div>
            <div className="h-16 bg-white/10 rounded-lg mb-4"></div>
          </div>

          {/* Services List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Healthcare Services</div>
                    <div className="text-sm text-gray-500">Elder Care</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">$1200</div>
                  <div className="text-sm text-gray-500">5 active</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Physical Therapy</div>
                    <div className="text-sm text-gray-500">Rehabilitation</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">$1450</div>
                  <div className="text-sm text-gray-500">3 active</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Social Activities</div>
                    <div className="text-sm text-gray-500">Recreation</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">$1250</div>
                  <div className="text-sm text-gray-500">3 active</div>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              FULL DETAILS
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Tasks Completed</span>
            </div>
            <span className="text-xs text-gray-500">22/35 completed</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">22/35</div>
          <div className="h-2 bg-gray-200 rounded-full mb-3">
            <div className="h-2 bg-blue-500 rounded-full" style={{ width: "63%" }}></div>
          </div>
          <div className="text-sm text-green-600">28% more from last week</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">New Tasks</span>
            </div>
            <span className="text-xs text-gray-500">5/20 completed</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">5/20</div>
          <div className="h-2 bg-gray-200 rounded-full mb-3">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: "25%" }}></div>
          </div>
          <div className="text-sm text-green-600">34% more from last week</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Project Done</span>
            </div>
            <span className="text-xs text-gray-500">20/30 completed</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">20/30</div>
          <div className="h-2 bg-gray-200 rounded-full mb-3">
            <div className="h-2 bg-orange-500 rounded-full" style={{ width: "67%" }}></div>
          </div>
          <div className="text-sm text-green-600">42% more from last week</div>
        </div>
      </div>
    </div>
  )
}
