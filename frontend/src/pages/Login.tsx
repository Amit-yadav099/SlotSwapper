import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginFormData } from '../types';
import FormInput from '../components/FormInput';
import AnimatedBackground from '../components/AnimateBackground';
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
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-r from-blue-500 to-blue-300">
      <AnimatedBackground />
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ">
        {/* Left Side - Branding and Features */}
        <div className="text-center lg:text-left space-y-8 animate-slide-up">
          <div className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-2">
                  SlotSwapper
                </h1>
                <p className="text-xl text-white/90 font-light">
                  Intelligent Calendar Management
                </p>
              </div>
            </div>
            <p className="text-lg text-white/80 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Revolutionize how you manage your schedule. Swap time slots seamlessly with colleagues and optimize your productivity.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto lg:mx-0 border border-white/20 shadow-xl">
            <h3 className="text-white font-semibold mb-6 text-xl flex items-center justify-center lg:justify-start space-x-2">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span>Why Professionals Love Us</span>
            </h3>
            <ul className="space-y-4">
              {features.map(({ icon: Icon, text }, index) => (
                <li key={index} className="flex items-center space-x-4 text-white/90 group">
                  <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
                    <Icon className="h-5 w-5 text-green-300" />
                  </div>
                  <span className="font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="text-center bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-white/70 text-sm">Active Users</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-white/70 text-sm">Teams</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-white/70 text-sm">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="animate-fade-in">
          <div className="card max-w-md mx-auto lg:mx-0 lg:max-w-full transform hover:scale-[1.02] transition-transform duration-300">
            <div className="p-8 sm:p-10 space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-r from-primary-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Welcome Back
                </h2>
                <p className="text-gray-600 text-lg">
                  Sign in to continue to your account
                </p>
              </div>

              {/* Error Alert */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-fade-in shadow-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-red-700 text-sm">
                    <div className="font-semibold">Authentication Error</div>
                    <div>{apiError}</div>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <FormInput
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  error={errors.email}
                />

                <div className="space-y-2">
                  <div className="relative">
                    <FormInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      icon={Lock}
                      error={errors.password}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        rememberMe 
                          ? 'bg-primary-500 border-primary-500' 
                          : 'bg-white border-gray-300 group-hover:border-primary-400'
                      }`}>
                        {rememberMe && (
                          <CheckCircle className="h-4 w-4 text-white absolute top-0.5 left-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="text-gray-700 text-sm font-medium group-hover:text-gray-900 transition-colors duration-200">
                      Remember me
                    </span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to your account</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">New to SlotSwapper?</span>
                  </div>
                </div>

                {/* Register Link */}
                <Link
                  to="/register"
                  className="w-full border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:border-primary-400 hover:text-primary-600 transition-all duration-200 flex items-center justify-center space-x-2 group"
                >
                  <span>Create your account</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </form>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;