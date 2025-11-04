import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { RegisterFormData } from '../types';
import FormInput from '../components/FormInput';
import AnimatedBackground from '../components/AnimateBackground';
import { Mail, Lock, User, Calendar, ArrowRight, CheckCircle, Eye, EyeOff, Shield, Clock, Users, Zap } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength === 0) return 'bg-gray-200';
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength === 0) return 'Enter a password';
    if (strength <= 25) return 'Very Weak';
    if (strength <= 50) return 'Weak';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    if (apiError) setApiError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      setApiError('Please agree to the Terms of Service and Privacy Policy');
      return false;
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
      await register(formData.name, formData.email, formData.password);
      navigate('/login');
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Clock, text: "Smart time slot swapping" },
    { icon: Users, text: "Team collaboration features" },
    { icon: Shield, text: "Enterprise-grade security" },
    { icon: Zap, text: "Real-time notifications" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-r from-primary-100 to-blue-400">
      <AnimatedBackground />
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Registration Form */}
        <div className="animate-slide-up">
          <div className="card max-w-md mx-auto lg:mx-0 lg:max-w-full transform hover:scale-[1.02] transition-transform duration-300">
            <div className="p-8 sm:p-10 space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-r from-primary-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Join SlotSwapper
                </h2>
                <p className="text-gray-600 text-lg">
                  Create your account and get started
                </p>
              </div>

              {/* Error Alert */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-fade-in shadow-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-red-700 text-sm">
                    <div className="font-semibold">Registration Error</div>
                    <div>{apiError}</div>
                  </div>
                </div>
              )}

              {/* Registration Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <FormInput
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={User}
                  error={errors.name}
                />

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

                {/* Password Field */}
                <div className="space-y-3">
                  <div className="relative">
                    <FormInput
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Create a strong password"
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

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="space-y-2 animate-fade-in bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">Password strength</span>
                        <span className={`font-semibold ${
                          passwordStrength <= 25 ? 'text-red-600' :
                          passwordStrength <= 50 ? 'text-orange-600' :
                          passwordStrength <= 75 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor(passwordStrength)}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>Include uppercase letters</span>
                        <CheckCircle className={`h-3 w-3 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <FormInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={Lock}
                    error={errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Terms Agreement */}
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                      agreedToTerms 
                        ? 'bg-primary-500 border-primary-500' 
                        : 'bg-white border-gray-300 group-hover:border-primary-400'
                    }`}>
                      {agreedToTerms && (
                        <CheckCircle className="h-4 w-4 text-white absolute top-0.5 left-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="text-gray-700 text-sm flex-1">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create your account</span>
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
                    <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
                  </div>
                </div>

                {/* Login Link */}
                <Link
                  to="/login"
                  className="w-full border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:border-primary-400 hover:text-primary-600 transition-all duration-200 flex items-center justify-center space-x-2 group"
                >
                  <span>Sign in to your account</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="text-center lg:text-left space-y-8 animate-fade-in">
          <div className="space-y-6">
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-2">
                  Get Started
                </h1>
                <p className="text-xl text-white/90 font-light">
                  Join thousands of productive teams
                </p>
              </div>
            </div>
            <p className="text-lg text-white/80 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Experience the future of calendar management with intelligent time slot swapping and seamless team coordination.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto lg:mx-0 border border-white/20 shadow-xl">
            <h3 className="text-white font-semibold mb-6 text-xl flex items-center justify-center lg:justify-start space-x-2">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span>What You'll Get</span>
            </h3>
            <ul className="space-y-4">
              {benefits.map(({ icon: Icon, text }, index) => (
                <li key={index} className="flex items-center space-x-4 text-white/90 group">
                  <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
                    <Icon className="h-5 w-5 text-green-300" />
                  </div>
                  <span className="font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="text-center bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-white font-semibold">Secure</div>
              <div className="text-white/70 text-sm">Enterprise Security</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-white font-semibold">Always Available</div>
              <div className="text-white/70 text-sm">24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;