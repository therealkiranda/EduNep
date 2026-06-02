import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-8">
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="text-center max-w-md">
        <div className="text-9xl font-serif font-bold text-primary-200 mb-4">404</div>
        <h1 className="text-2xl font-serif font-bold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={15}/> Go Back
          </button>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors">
            <Home size={15}/> Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
