import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown_menu';
import { Menu, LogOut, Settings, User, Bell, Search, Plus, MessageCircle } from 'lucide-react';
import { Input } from '../ui/input';

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    }
  }
};

const searchVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: "16rem",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  }
};

const notificationVariants = {
  idle: { scale: 1, rotate: 0 },
  ring: {
    scale: [1, 1.1, 1],
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const avatarVariants = {
  hover: {
    scale: 1.1,
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    }
  },
  tap: {
    scale: 0.95,
  }
};

const buttonHoverVariants = {
  hover: {
    scale: 1.05,
    y: -2,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    }
  },
  tap: {
    scale: 0.95,
    y: 0,
  }
};

const glowVariants = {
  animate: {
    boxShadow: [
      "0 0 0 rgba(59, 130, 246, 0)",
      "0 0 20px rgba(59, 130, 246, 0.3)",
      "0 0 0 rgba(59, 130, 246, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function Header({ user, onLogout, setSidebarOpen }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationCount] = useState(3);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      onLogout();
    }
  };

  const triggerNotificationRing = () => {
    // This would typically connect to a notification system
  };

  return (
    <motion.header 
      className="sticky top-0 z-20 flex items-center justify-between p-4 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm relative overflow-hidden"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <motion.div
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div variants={buttonHoverVariants}>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden relative overflow-hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.3 }}
              />
              <Menu className="h-5 w-5 relative z-10" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Welcome message with typing animation */}
        <motion.div variants={itemVariants}>
          <motion.h1 
            className="text-xl font-semibold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Welcome back, {user.name.split(' ')[0]}!
          </motion.h1>
          <motion.p 
            className="text-sm text-muted-foreground hidden sm:block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Ready to connect with your circle?
          </motion.p>
        </motion.div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-3">
        {/* Search bar with expand animation */}
        <motion.div 
          className="hidden lg:block relative"
          variants={itemVariants}
        >
          <motion.div
            variants={searchFocused ? searchVariants : {}}
            animate={searchFocused ? "visible" : "hidden"}
          >
            <div className="relative">
              <motion.div
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                animate={{
                  rotate: searchFocused ? 90 : 0,
                  scale: searchFocused ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </motion.div>
              <Input
                placeholder="Search CircleUp..."
                className="pl-10 w-64 bg-background/50 transition-all duration-300 focus:bg-background focus:shadow-lg"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchFocused && (
                <motion.div
                  className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Quick action buttons */}
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div variants={buttonHoverVariants}>
            <Button variant="ghost" size="sm" className="relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
              <Plus className="h-5 w-5 relative z-10" />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div variants={buttonHoverVariants}>
            <Button variant="ghost" size="sm" className="relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
              <MessageCircle className="h-5 w-5 relative z-10" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Notifications with animated badge */}
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div variants={buttonHoverVariants}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative overflow-hidden"
              onClick={triggerNotificationRing}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                variants={notificationVariants}
                animate="ring"
                transition={{ repeat: Infinity, repeatDelay: 3 }}
              >
                <Bell className="h-5 w-5 relative z-10" />
              </motion.div>
              <AnimatePresence>
                {notificationCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    variants={glowVariants}
                    whileInView="animate"
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </motion.div>

        {/* Sign Out Button */}
        <motion.div
          variants={itemVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div variants={buttonHoverVariants}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.3 }}
              />
              <LogOut className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Sign Out</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* User Avatar Dropdown with enhanced animations */}
        <motion.div variants={itemVariants}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                variants={avatarVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <Avatar className="h-10 w-10 relative z-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenuItem disabled className="flex-col items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="group">
                  <User className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="group">
                  <Settings className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-destructive focus:text-destructive group"
                >
                  <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Sign Out
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </motion.header>
  );
}