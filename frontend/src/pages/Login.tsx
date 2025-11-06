import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginFormData } from '../types';
import FormInput from '../components/FormInput';
import { Mail, Lock, Calendar, ArrowRight, CheckCircle, Eye, EyeOff, Clock, Users, Zap } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    if (apiError) setApiError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Clock, text: "Smart time slot management" },
    { icon: Users, text: "Seamless team collaboration" },
    { icon: Zap, text: "Instant swap notifications" },
    { icon: CheckCircle, text: "Secure and reliable" }
  ];

  return (
<div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-100 px-4 py-6">
      {/* The min-h calculation assumes your navbar height is ~64px */}

      <div className="w-full max-w-md">
        <div className="p-6 sm:p-8 bg-white rounded-2xl shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="bg-blue-400 w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Sign in to continue</p>
          </div>

          {/* Error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 shadow-sm">
              {apiError}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              error={errors.email}
            />

            <div className="relative">
              <FormInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                error={errors.password}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-600 transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Register Link */}
            <div className="text-center text-sm text-gray-600">
              New to SlotSwapper?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Create an account
              </Link>
            </div>
          </form>

          {/* Footer */}
          <p className="text-xs text-center text-gray-500 pt-2">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;