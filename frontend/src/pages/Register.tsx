import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterFormData } from '../types';
import FormInput from '../components/FormInput';
import { Mail, Lock, User, Calendar, ArrowRight, CheckCircle, Eye, EyeOff, Shield, Clock, Users, Zap } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-8 transform hover:scale-[1.01] transition-transform duration-300">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="bg-blue-400 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
            <p className="text-gray-600 text-sm">Join SlotSwapper to get started!</p>
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start space-x-3 animate-fade-in shadow-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-red-700 text-sm">
                <div className="font-semibold">Registration Error</div>
                <div>{apiError}</div>
              </div>
            </div>
          )}

          {/* Sign Up Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormInput
              id="name"
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <FormInput
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            {/* Password Field */}
            <div className="space-y-3">
              <div className="relative">
                <FormInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                  icon={Lock}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
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
                    <span
                      className={`font-semibold ${
                        passwordStrength <= 25
                          ? "text-red-600"
                          : passwordStrength <= 50
                          ? "text-orange-600"
                          : passwordStrength <= 75
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor(
                        passwordStrength
                      )}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
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
                <div
                  className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                    agreedToTerms
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300 group-hover:border-blue-400"
                  }`}
                >
                  {agreedToTerms && (
                    <CheckCircle className="h-4 w-4 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </div>
              <span className="text-gray-700 text-sm flex-1">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>

            {/* Divider & Login Link */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;