import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './navigation/Header';
import { Sidebar } from './navigation/Sidebar';
import { Feed } from './features/Feed';
import { Friends } from './features/Friends';
import { Chat } from './features/Chat';
import { Hangouts } from './features/Hangouts';
import { Notifications } from './features/Notifications';
import { Profile } from './features/Profile';
import { Map } from './features/Map';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.95
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: 20,
    scale: 0.95
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const mobileSidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    const components = {
      feed: <Feed user={user} />,
      friends: <Friends user={user} />,
      chat: <Chat user={user} />,
      hangouts: <Hangouts user={user} />,
      notifications: <Notifications user={user} />,
      profile: <Profile user={user} />,
      map: <Map user={user} />
    };

    return components[activeTab as keyof typeof components] || components.feed;
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Desktop Sidebar - Always visible */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 h-full z-30"
          >
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </motion.div>
        </div>

        {/* Mobile Sidebar - Sliding overlay */}
        <div className="md:hidden">
          <motion.div
            className="fixed left-0 top-0 h-full z-50"
            variants={mobileSidebarVariants}
            initial="closed"
            animate={sidebarOpen ? "open" : "closed"}
          >
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSidebarOpen(false);
              }}
              className="shadow-xl"
            />
          </motion.div>
        </div>

        {/* Desktop sidebar spacer */}
        <div className="hidden md:block w-64 flex-shrink-0" />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Header
              user={user}
              onLogout={onLogout}
              setSidebarOpen={setSidebarOpen}
            />
          </motion.div>

          <motion.main
            className="flex-1 overflow-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={pageVariants}
                  initial="initial"
                  animate="in"
                  exit="out"
                  transition={pageTransition}
                  className="max-w-7xl mx-auto"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.main>
        </div>
      </div>
    </motion.div>
  );
}