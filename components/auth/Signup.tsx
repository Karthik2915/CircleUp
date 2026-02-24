import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';

interface SignupProps {
  onSignup: (user: { id: string; name: string; email: string; avatar?: string }) => void;
  onLoginToggle: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const passwordRequirements = [
  { text: 'At least 6 characters', regex: /.{6,}/ },
  { text: 'Contains a number', regex: /\d/ },
  { text: 'Contains a letter', regex: /[a-zA-Z]/ }
];

export function Signup({ onSignup, onLoginToggle }: SignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const user = {
      id: '1',
      name: formData.name,
      email: formData.email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };

    setIsLoading(false);
    onSignup(user);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const getPasswordStrength = () =>
    passwordRequirements.filter(req => req.regex.test(formData.password)).length;

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    return ['bg-gray-200', 'bg-red-400', 'bg-yellow-400', 'bg-green-400'][strength];
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
      <motion.div variants={itemVariants}>
        <Card className="backdrop-blur-xl bg-white/90 shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <span className="text-2xl font-bold text-white">C</span>
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join CircleUp
            </CardTitle>
            <CardDescription className="text-gray-600">Create your account and start connecting</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={`pl-10 ${errors.name ? 'border-red-300' : 'focus:border-purple-500'} transition-all duration-200`}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-300' : 'focus:border-purple-500'} transition-all duration-200`}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-300' : 'focus:border-purple-500'} transition-all duration-200`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </motion.button>
                </div>

                {/* Password strength */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div className={`h-2 rounded-full ${getPasswordStrengthColor()}`} style={{ width: `${(getPasswordStrength() / 3) * 100}%` }} />
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300' : 'focus:border-purple-500'} transition-all duration-200`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </motion.button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  )}
                </Button>
              </motion.div>

              {/* Switch to Login */}
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <motion.button
                    type="button"
                    onClick={onLoginToggle}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Sign in
                  </motion.button>
                </p>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
