import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


const Login = () => {
  // Lấy email và password đã lưu từ localStorage nếu có
  const savedEmail = localStorage.getItem('savedEmail') || '';
  const savedPassword = localStorage.getItem('savedPassword') || '';
  const [formData, setFormData] = useState({
    email: savedEmail,
    password: savedPassword,
  });
  const [error, setError] = useState('');

  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Lưu lại email và password khi người dùng nhập
    if (e.target.name === 'email') {
      localStorage.setItem('savedEmail', e.target.value);
    }
    if (e.target.name === 'password') {
      localStorage.setItem('savedPassword', e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Lưu lại email và password khi đăng nhập
    localStorage.setItem('savedEmail', formData.email);
    localStorage.setItem('savedPassword', formData.password);

    try {
      const response = await login(formData);
      addToast('🎉 Đăng nhập thành công!', 'success');
      if (response.data.dailyReward && response.data.dailyReward > 0) {
        addToast(`💰 Nhận thưởng đăng nhập: +${response.data.dailyReward} coins! (Streak: ${response.data.streak} ngày)`, 'success');
      }
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      addToast(`❌ ${errorMessage}`, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              tạo tài khoản mới
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field mt-1"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
