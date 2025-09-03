import React from 'react';
import PetGameLogo from '../assets/PetGamelogo2-removebg-preview.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEconomic } from '../context/EconomicContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { coins, level, dailyLoginStreak, isLoading } = useEconomic();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                src={PetGameLogo}
                alt="Pet Game Logo"
                className="h-12 w-auto mx-auto"
                style={{ display: 'block' }}
              />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🏠 Dashboard
                </Link>
                <Link
                  to="/pets"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🐾 My Pets
                </Link>
                <Link
                  to="/daily-missions"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  📋 Nhiệm vụ
                </Link>
                <Link
                  to="/minigames"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🎮 Games
                </Link>
                <Link
                  to="/shop"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  🛒 Shop
                </Link>
                <Link
                  to="/friends"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  👥 Bạn bè
                </Link>
                
                {/* User Stats Display */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                  <span className="text-sm font-medium text-yellow-600">
                    💰 {isLoading ? '...' : coins?.toLocaleString() || '0'}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    ⭐ {isLoading ? '...' : level || '1'}
                  </span>
                  {dailyLoginStreak > 0 && (
                    <span className="text-sm font-medium text-orange-600">
                      🔥 {dailyLoginStreak}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm hover:bg-red-100 hover:text-red-700 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
