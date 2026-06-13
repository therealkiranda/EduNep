import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { authApi, notificationsApi, messagesApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, UserCheck, BookOpen, GraduationCap,
  ClipboardList, CheckSquare, BarChart3, Library, Bell, MessageSquare,
  Calendar, Settings, LogOut, Menu, X, ChevronDown, Globe,
  DollarSign, FileText, CreditCard, Award, BookMarked, Megaphone, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { key: 'dashboard',   path: '/dashboard',   icon: LayoutDashboard, label: 'dashboard',   roles: null },
  { key: 'students',    path: '/students',    icon: Users,            label: 'students',    perm: 'students.view' },
  { key: 'staff',       path: '/staff',       icon: UserCheck,        label: 'staff',       perm: 'staff.view' },
  { key: 'classes',     path: '/classes',     icon: BookOpen,         label: 'classes',     perm: 'classes.view' },
  { key: 'attendance',  path: '/attendance',  icon: CheckSquare,      label: 'attendance',  perm: 'attendance.view' },
  { key: 'assignments', path: '/exams',       icon: ClipboardList,    label: 'assignments', perm: 'assignments.view' },
  { key: 'grades',      path: '/grades',      icon: Award,            label: 'grades',      perm: 'grades.view' },
  {
    key: 'finance', label: 'finance', icon: DollarSign, perm: 'fees.view',
    children: [
      { path: '/finance',             label: 'dashboard',     icon: LayoutDashboard },
      { path: '/finance/fees',        label: 'fees',          icon: FileText },
      { path: '/finance/invoices',    label: 'invoice',       icon: CreditCard },
      { path: '/finance/payment',     label: 'payments',      icon: CreditCard },
      { path: '/finance/payroll',     label: 'payroll',       icon: DollarSign },
      { path: '/finance/defaulters',  label: 'unpaid',        icon: FileText },
    ]
  },
  { key: 'library',       path: '/library',       icon: Library,       label: 'library',       perm: 'library.view' },
  { key: 'announcements', path: '/announcements', icon: Megaphone,     label: 'announcements', perm: 'announcements.view' },
  { key: 'messages',      path: '/messages',      icon: MessageSquare, label: 'messages',      perm: 'messages.view' },
  { key: 'calendar',      path: '/calendar',      icon: Calendar,      label: 'calendar',      perm: 'calendar.view' },
  { key: 'reports',       path: '/reports',       icon: BarChart3,     label: 'reports',       perm: 'reports.academic' },
  { key: 'leaves',        path: '/leaves',        icon: BookMarked,    label: 'Leaves',        perm: 'leaves.view' },
  { key: 'settings',      path: '/settings',      icon: Settings,      label: 'settings',      roles: ['super_admin','school_admin'] },
];

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const navigate     = useNavigate();
  const location     = useLocation();
  const { user, logout, setLanguage, hasPermission, hasRole } = useAuthStore();
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [mobileOpen,  setMobileOpen]    = useState(false);
  const [openGroup,   setOpenGroup]     = useState(null);
  const [profileOpen, setProfileOpen]   = useState(false);

  const { data: unread } = useQuery({
    queryKey: ['unread-messages'],
    queryFn:  () => messagesApi.unreadCount().then(r => r.data?.count ?? r.data?.unread_count ?? 0),
    refetchInterval: 30_000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsApi.list().then(r => r.data?.notifications?.data ?? []),
    refetchInterval: 30_000,
  });

  const unreadNotifs = Array.isArray(notifications) ? notifications.filter(n => !n.read_at).length : 0;

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  const toggleLanguage = () => {
    const lang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  const canSee = (item) => {
    if (item.roles) return item.roles.includes(user?.role);
    if (!item.perm) return true;
    return hasPermission(item.perm);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const SidebarLink = ({ item }) => {
    if (item.children) {
      const isGroupActive = item.children.some(c => isActive(c.path));
      const isOpen = openGroup === item.key || isGroupActive;
      return (
        <div>
          <button
            onClick={() => setOpenGroup(isOpen ? null : item.key)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isGroupActive
                ? 'bg-primary-500/15 text-primary-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon size={18} className="shrink-0" />
            {sidebarOpen && <>
              <span className="flex-1 text-left">{t(item.label)}</span>
              <ChevronDown size={14} className={clsx('transition-transform', isOpen && 'rotate-180')} />
            </>}
          </button>
          <AnimatePresence>
            {isOpen && sidebarOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-6 mt-1 space-y-0.5"
              >
                {item.children.map(child => (
                  <NavLink key={child.path} to={child.path}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                      isActive ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    )}
                  >
                    <ChevronRight size={12} />
                    {t(child.label)}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink to={item.path}
        className={({ isActive }) => clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )}
        title={!sidebarOpen ? t(item.label) : undefined}
      >
        <item.icon size={18} className="shrink-0" />
        {sidebarOpen && <span>{t(item.label)}</span>}
      </NavLink>
    );
  };

  const Sidebar = ({ isMobile = false }) => (
    <aside className={clsx(
      'flex flex-col bg-white border-r border-gray-100 shadow-sm transition-all duration-300 h-full',
      isMobile ? 'w-72' : (sidebarOpen ? 'w-64' : 'w-16')
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center shadow-md shrink-0">
          <GraduationCap size={18} className="text-white" />
        </div>
        {(sidebarOpen || isMobile) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-serif font-bold text-xl text-primary-800">
              Edu<span className="text-gold-500">Nep</span>
            </h1>
            <p className="text-[10px] text-gray-400 leading-none">{t('dashboard')}</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
        {navItems.filter(canSee).map(item => (
          <SidebarLink key={item.key} item={item} />
        ))}
      </nav>

      {/* User mini */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className={clsx('flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50', !sidebarOpen && !isMobile && 'justify-center')}>
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-primary-700 font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          {(sidebarOpen || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role?.replace('_',' ')}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
              if (window.innerWidth >= 1024) {
                setSidebarOpen(s => !s);
              } else {
                setMobileOpen(s => !s);
              }
            }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              <Menu size={18} />
            </button>
            <div className="hidden md:block">
              <p className="text-xs text-gray-400">
                {i18n.language === 'ne' ? 'एडुनेप विद्यालय व्यवस्थापन प्रणाली' : 'EduNep School Management System'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors text-primary-700 text-xs font-semibold"
            >
              <Globe size={13} />
              {i18n.language === 'en' ? 'नेपाली' : 'English'}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600" onClick={() => navigate('/notifications')}>
              <Bell size={18} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </button>

            {/* Messages */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600" onClick={() => navigate('/messages')}>
              <MessageSquare size={18} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={13} className="text-gray-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-hover border border-gray-100 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <button onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <UserCheck size={14} /> {t('profile')}
                    </button>
                    <button onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Settings size={14} /> {t('settings')}
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut size={14} /> {t('logout')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6 min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
