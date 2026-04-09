import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare, FileText, Zap, Clock, Menu, X,
  LogOut, User, ChevronDown, Brain, Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Chat', icon: MessageSquare },
  { path: '/dashboard/pdf', label: 'PDF Analyzer', icon: FileText },
  { path: '/dashboard/quiz', label: 'Quiz Generator', icon: Zap },
 
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 🔥 Dynamic Avatar (Image or Initial)
 const renderAvatar = () => {
  return (
    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
      <User className="h-4 w-4 text-primary-foreground" />
    </div>
  );
};

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg gradient-bg flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">LakshyaAI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* AI Status */}
      <div className="p-3">
        <div className="glass rounded-lg p-3 text-center">
          <Sparkles className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">
            AI Status: <span className="text-green-500 font-medium">Online</span>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex bg-background overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 flex flex-col border-r border-border bg-card z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Section */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navbar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/40">

          {/* Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="hidden md:block" />

          {/* Profile Section */}
          <div className="relative">

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {renderAvatar()}
              <span className="text-sm text-foreground hidden sm:block">
                {user?.name || "User"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-12 w-52 glass rounded-xl p-2 z-50"
                >
                
                  {/* 🔥 Dynamic History */}
                  <button
                    onClick={() => navigate(`/dashboard/history?user=${user?.id}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted/50"
                  >
                    <Clock className="h-4 w-4" />
                    My History
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-2 sm:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}