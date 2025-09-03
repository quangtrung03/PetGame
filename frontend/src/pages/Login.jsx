import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validators, validateForm, createRateLimiter } from '../utils/validation';

// Rate limiter for login attempts (5 attempts per 15 minutes)
const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000);


const Login = () => {
  // Lấy email và password đã lưu từ localStorage nếu có
  const savedEmail = localStorage.getItem('savedEmail') || '';
  const savedPassword = localStorage.getItem('savedPassword') || '';
  const [formData, setFormData] = useState({
    email: savedEmail,
    password: savedPassword,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
    
    // Lưu lại email và password khi người dùng nhập
    if (name === 'email') {
      localStorage.setItem('savedEmail', value);
    }
    if (name === 'password') {
      localStorage.setItem('savedPassword', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!loginRateLimiter()) {
      addToast('⚠️ Too many login attempts. Please try again later.', 'error');
      return;
    }
    
    // Client-side validation
    const validation = validateForm(formData, {
      email: (value) => validators.email(value),
      password: (value) => validators.password(value, true) // isLogin = true
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setErrors({});
    setError('');
    setIsSubmitting(true);

    // Lưu lại email và password khi đăng nhập
    localStorage.setItem('savedEmail', validation.sanitizedData.email);
    localStorage.setItem('savedPassword', formData.password);

    try {
      const response = await login(validation.sanitizedData);
      addToast('🎉 Đăng nhập thành công!', 'success');
      // Backend trả về { success, message, data: { user, token, dailyReward, streak } }
      if (response.data.data.dailyReward && response.data.data.dailyReward > 0) {
        addToast(`💰 Nhận thưởng đăng nhập: +${response.data.data.dailyReward} coins! (Streak: ${response.data.data.streak} ngày)`, 'success');
      }
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      addToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
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
                className={`input-field mt-1 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <div className="mt-1 text-sm text-red-600">
                  {errors.email.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
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
                className={`input-field mt-1 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <div className="mt-1 text-sm text-red-600">
                  {errors.password.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading || isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
