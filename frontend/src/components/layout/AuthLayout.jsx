import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout() {
  const { i18n } = useTranslation();
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/3 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-white font-serif font-bold text-2xl">
              Edu<span className="text-gold-300">Nep</span>
            </span>
          </div>

          {/* Center content */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white font-serif font-bold text-4xl leading-tight mb-6"
            >
              Nepal's Complete<br />
              <span className="text-gold-300">School & College</span><br />
              Management Platform
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 text-lg leading-relaxed mb-4"
            >
              Manage students, staff, fees, exams, and learning — all in one beautiful platform built for Nepal.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/50 font-devanagari text-base"
            >
              नेपालका विद्यालय र कलेजहरूका लागि सम्पूर्ण व्यवस्थापन प्रणाली।
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-8 mt-10"
            >
              {[['500+','Schools'],['120K+','Students'],['77','Districts']].map(([n,l]) => (
                <div key={l}>
                  <div className="text-white font-serif font-bold text-2xl">{n}</div>
                  <div className="text-white/60 text-xs mt-0.5">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇳🇵</span>
            <span className="text-white/60 text-sm">Made in Nepal for Nepali Educators</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="font-serif font-bold text-2xl text-primary-800">
              Edu<span className="text-gold-500">Nep</span>
            </span>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
