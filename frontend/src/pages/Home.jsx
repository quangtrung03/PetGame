import React from 'react';
import PetGameLogoRemove from '../assets/PetGameLogo-removebg-preview.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">

      {/* Hero Section - PetGameLogo style */}
      <div className="bg-[#d6e7d0] flex items-center justify-center py-20">
        <div className="text-center">
          <img
            src={PetGameLogoRemove}
            alt="Pet Game Logo"
            className="mx-auto mb-6" style={{ maxWidth: '260px', width: '100%' }}
          />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Pet Game
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Chào mừng đến với thế giới thú cưng ảo! Nuôi dưỡng, chăm sóc và khám phá cùng những người bạn đáng yêu.
          </p>
          {!isAuthenticated ? (
            <div className="space-x-4">
              <Link
                to="/register"
                className="inline-block bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Bắt đầu ngay
              </Link>
              <Link
                to="/login"
                className="inline-block border-2 border-primary-600 text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-primary-600 hover:text-white transition-colors duration-200"
              >
                Đăng nhập
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="inline-block bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              Vào chơi ngay
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá những điều thú vị mà Pet Game mang lại
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🐱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nuôi thú cưng
              </h3>
              <p className="text-gray-600">
                Chọn và nuôi dưỡng những chú mèo, chó đáng yêu theo ý thích của bạn
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chăm sóc hàng ngày
              </h3>
              <p className="text-gray-600">
                Cho ăn, chơi đùa và theo dõi sức khỏe của thú cưng mỗi ngày
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tăng cấp độ
              </h3>
              <p className="text-gray-600">
                Hoàn thành nhiệm vụ và nâng cao cấp độ chăm sóc thú cưng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cách bắt đầu
            </h2>
            <p className="text-lg text-gray-600">
              Chỉ với 3 bước đơn giản
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Đăng ký tài khoản
              </h3>
              <p className="text-gray-600">
                Tạo tài khoản miễn phí để bắt đầu hành trình nuôi thú cưng
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chọn thú cưng
              </h3>
              <p className="text-gray-600">
                Chọn loại thú cưng yêu thích và đặt tên cho chúng
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bắt đầu chăm sóc
              </h3>
              <p className="text-gray-600">
                Cho ăn, chơi đùa và theo dõi sức khỏe thú cưng mỗi ngày
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="text-center mt-12">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3"
              >
                Bắt đầu ngay hôm nay
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Help Section - Answers "What can you help me with?" */}
      <div className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🤔 Pet Game có thể giúp gì cho bạn?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              Đây là tất cả những gì chúng tôi có thể hỗ trợ bạn trong hành trình nuôi thú cưng ảo!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🐾</div>
              <h3 className="text-lg font-semibold mb-2">Quản lý thú cưng</h3>
              <p className="text-sm text-gray-600">Nuôi 5 loại thú cưng với kỹ năng đặc biệt</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🛒</div>
              <h3 className="text-lg font-semibold mb-2">Mua sắm thông minh</h3>
              <p className="text-sm text-gray-600">Shop với hệ thống giá động và inventory</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-lg font-semibold mb-2">Mini games</h3>
              <p className="text-sm text-gray-600">Memory game với bonus và streak system</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Achievement & Missions</h3>
              <p className="text-sm text-gray-600">Nhiệm vụ hàng ngày và thành tích đặc biệt</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/help"
              className="inline-flex items-center bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg"
            >
              <span className="mr-2">❓</span>
              Xem hướng dẫn chi tiết
            </Link>
            <p className="text-sm text-gray-600 mt-4">
              Tìm hiểu đầy đủ về tất cả tính năng và cách chơi hiệu quả
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
