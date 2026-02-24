import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import { Login } from "../components/auth/Login";
import { Signup } from "../components/auth/Signup";
import { Dashboard } from "../components/Dashboard";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 50 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 1.2, y: -50 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

const backgroundVariants: Variants = {
  initial: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" as any,
  },
  animate: {
    background: [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    ] as any,
    transition: { duration: 20, repeat: Infinity, ease: "linear" },
  },
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedUser = localStorage.getItem("circleup_user");
      if (storedUser) setUser(JSON.parse(storedUser));
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("circleup_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("circleup_user");
  };

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-8 relative"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <motion.div
                className="w-10 h-10 rounded-full bg-white"
                animate={{ scale: [1, 0.8, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
          <motion.h1 className="text-4xl font-bold text-white mb-4">
            CircleUp
          </motion.h1>
          <motion.p className="text-white/80 text-lg">
            Connecting people, creating memories
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        variants={backgroundVariants}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="wait" initial={false}>
          {authMode === "login" ? (
            <motion.div
              key="login"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
            >
              <Login
                onLogin={handleLogin}
                onSignupToggle={() => setAuthMode("signup")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
            >
              <Signup
                onSignup={handleLogin}
                onLoginToggle={() => setAuthMode("login")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
