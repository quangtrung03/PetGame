import React, { useState, useEffect } from 'react';
import { helpAPI } from '../api/helpAPI';

const Help = () => {
  const [helpData, setHelpData] = useState(null);
  const [quickGuide, setQuickGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        setLoading(true);
        const [helpResponse, guideResponse] = await Promise.all([
          helpAPI.getHelpInfo(),
          helpAPI.getQuickGuide()
        ]);
        
        if (helpResponse.success) {
          setHelpData(helpResponse.data);
        }
        if (guideResponse.success) {
          setQuickGuide(guideResponse.data);
        }
      } catch (err) {
        console.error('Error loading help data:', err);
        setError('Không thể tải dữ liệu hướng dẫn');
      } finally {
        setLoading(false);
      }
    };

    fetchHelpData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '🎯 Tổng Quan', icon: '🎮' },
    { id: 'quickstart', label: '🚀 Bắt Đầu Nhanh', icon: '⚡' },
    { id: 'features', label: '✨ Tính Năng', icon: '🔥' },
    { id: 'tips', label: '💡 Mẹo Hay', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {helpData?.title || 'Pet Game - Hướng Dẫn'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {helpData?.introduction || 'Khám phá tất cả những gì bạn có thể làm trong Pet Game!'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-xl shadow-sm p-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 mx-1 my-1 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && helpData && (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpData.features.map((feature, index) => (
                  <div key={feature.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-3">{feature.title.split(' ')[0]}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title.substring(2)}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full inline-block">
                      {feature.capabilities.length} tính năng
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Start Tab */}
          {activeTab === 'quickstart' && quickGuide && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                  🚀 {quickGuide.title}
                </h2>
                
                <div className="space-y-6">
                  {quickGuide.steps.map((step, index) => (
                    <div key={step.step} className="flex items-start bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-2">{step.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            🎯 {step.action}
                          </span>
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                            🏆 {step.reward}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Warnings */}
                <div className="mt-8 bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-xl">
                  <h3 className="text-lg font-bold text-orange-800 mb-4">⚠️ Những Điều Cần Lưu Ý</h3>
                  <ul className="space-y-2">
                    {quickGuide.warnings.map((warning, index) => (
                      <li key={index} className="text-orange-700 flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>{warning.substring(3)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && helpData && (
            <div className="p-8">
              <div className="space-y-8">
                {helpData.features.map((feature, index) => (
                  <div key={feature.id} className="border rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                      <h2 className="text-2xl font-bold">{feature.title}</h2>
                      <p className="text-blue-100 mt-2">{feature.description}</p>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ Tính Năng Chi Tiết:</h3>
                          <ul className="space-y-2">
                            {feature.capabilities.map((capability, idx) => (
                              <li key={idx} className="flex items-start text-gray-700">
                                <span className="text-green-500 mr-2 mt-1">✓</span>
                                <span>{capability}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎁 Phần Thưởng:</h3>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800">{feature.rewards}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && helpData && (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                  💡 Mẹo Chơi Game Hiệu Quả
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {helpData.tips.map((tip, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>

                {/* Support Section */}
                {helpData.support && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">🆘 {helpData.support.title}</h3>
                    <ul className="space-y-2">
                      {helpData.support.info.map((info, index) => (
                        <li key={index} className="text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">ℹ️</span>
                          <span>{info}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Sẵn Sàng Bắt Đầu? 🎮</h2>
            <p className="text-blue-100 mb-6">Bây giờ bạn đã biết Pet Game có thể giúp gì cho bạn rồi!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/pets" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                🐾 Tạo Thú Cưng Ngay
              </a>
              <a 
                href="/dashboard" 
                className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center"
              >
                📊 Vào Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;