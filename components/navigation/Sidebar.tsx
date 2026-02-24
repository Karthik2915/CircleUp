import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll_area';
import { cn } from '../ui/utils';
import {
  Home,
  Users,
  MessageCircle,
  Calendar,
  Bell,
  User,
  MapPin,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const navigationItems = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'hangouts', label: 'Hangouts', icon: Calendar },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User },
];

const sidebarVariants: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05, // Slightly faster stagger
    },
  },
};

const logoVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  hover: {
    scale: 1.1,
    rotate: 360,
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
};

// FIX 1: The 'visible' variant now accepts a custom prop for staggering
const navItemVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay: i * 0.05, // Use the custom prop 'i' for delay
    },
  }),
  hover: {
    x: 5,
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  },
  tap: { scale: 0.98, x: 2 },
};

const iconVariants: Variants = {
  initial: { rotate: 0, scale: 1 },
  hover: {
    rotate: [0, -10, 10, -10, 0],
    scale: 1.1,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  active: {
    scale: [1, 1.2, 1],
    rotate: [0, 5, 0], // Made the active animation more subtle
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const backgroundGlowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (delay: number = 0) => ({
    opacity: [0, 0.3, 0],
    scale: [0.8, 1.2, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    },
  }),
};

export function Sidebar({ activeTab, onTabChange, className }: SidebarProps) {
  return (
    <motion.div
      className={cn(
        'w-64 h-screen bg-card/95 backdrop-blur-xl border-r border-border flex flex-col relative overflow-hidden',
        className
      )}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background decorative elements */}
      <motion.div
        className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-xl"
        variants={backgroundGlowVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-500/10 to-pink-600/10 rounded-full blur-xl"
        variants={backgroundGlowVariants}
        initial="initial"
        custom={1} // Pass custom delay
        animate="animate"
      />

      {/* Header */}
      <motion.div
        className="flex items-center justify-center p-6 border-b border-border relative"
        variants={navItemVariants}
      >
        <motion.div
          className="flex items-center space-x-3 cursor-pointer"
          whileHover="hover"
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden"
            variants={logoVariants}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <span className="text-white font-bold text-lg relative z-10">C</span>
          </motion.div>
          <motion.h2
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            CircleUp
          </motion.h2>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-6">
        <motion.nav className="space-y-2 px-4">
          <AnimatePresence>
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <motion.div
                  key={item.id}
                  variants={navItemVariants}
                  custom={index} // Pass the index as a custom prop
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-12 transition-all duration-300 relative group overflow-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'hover:bg-accent/50 hover:text-accent-foreground'
                    )}
                    onClick={() => onTabChange(item.id)}
                  >
                    {/* Animated background for active state */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700"
                        layoutId="active-nav-bg" // Add layoutId for smooth animation between tabs
                        transition={{
                          duration: 0.3,
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Hover ripple effect */}
                    {!isActive && (
                       <motion.div
                        className="absolute inset-0 bg-white/10 rounded-lg"
                        initial={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    <motion.div
                      className="flex items-center space-x-3 relative z-10"
                      // FIX 2: More explicit animation control
                      animate={isActive ? 'active' : 'initial'}
                      whileHover="hover"
                      variants={iconVariants}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </motion.div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                        layoutId="active-indicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                      />
                    )}

                    {/* Notification badge for some items */}
                    {(item.id === 'notifications' || item.id === 'chat') && (
                      <motion.div
                        className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.nav>
      </ScrollArea>

      {/* Footer */}
      <motion.div
        className="p-4 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + navigationItems.length * 0.05 }}
      >
        <div className="text-center text-xs text-muted-foreground">
          CircleUp v1.0
        </div>
      </motion.div>
    </motion.div>
  );
}