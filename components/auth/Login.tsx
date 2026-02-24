import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { id: string; name: string; email: string; avatar?: string }) => void;
  onSignupToggle: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function Login({ onLogin, onSignupToggle }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = {
      id: '1',
      name: 'Karthik SHETTY',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    };

    setIsLoading(false);
    onLogin(user);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
      <motion.div variants={itemVariants}>
        <Card className="backdrop-blur-xl bg-white/90 shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <span className="text-2xl font-bold text-white">C</span>
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to continue your journey with CircleUp
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className=".relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={`pl-10 transition-all duration-200 ${
                      errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                   : 'focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500">
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className=".relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    className={`pl-10 pr-10 transition-all duration-200 ${
                      errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                      : 'focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </motion.button>
                </div>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500">
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </motion.div>
                    ) : (
                      <motion.div className="flex items-center" whileHover={{ x: 2 }}>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <motion.button
                    type="button"
                    onClick={onSignupToggle}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign up
                  </motion.button>
                </p>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6 text-center">
        <motion.p className="text-white/80 text-sm" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          Demo: Use any email and password to continue
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
