import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, X, Plus, Download, Filter } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, color = 'blue', trend, subtitle, loading }) {
  const colors = {
    blue:   { bg: 'bg-primary-50',  icon: 'bg-primary-500',  text: 'text-primary-700', border: 'border-primary-100' },
    green:  { bg: 'bg-emerald-50',  icon: 'bg-emerald-500',  text: 'text-emerald-700', border: 'border-emerald-100' },
    gold:   { bg: 'bg-gold-50',     icon: 'bg-gold-500',     text: 'text-gold-700',    border: 'border-gold-100'    },
    red:    { bg: 'bg-red-50',      icon: 'bg-red-500',      text: 'text-red-700',     border: 'border-red-100'     },
    purple: { bg: 'bg-purple-50',   icon: 'bg-purple-500',   text: 'text-purple-700',  border: 'border-purple-100'  },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(27,108,168,0.12)' }}
      className={clsx('bg-white rounded-2xl p-5 border shadow-card', c.border)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <p className="text-2xl font-serif font-bold text-gray-800">{value ?? '—'}</p>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={clsx('text-xs font-medium mt-1', trend > 0 ? 'text-emerald-600' : 'text-red-500')}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', c.icon)}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <p className="text-xs text-gray-400 mb-1">{breadcrumb}</p>
        )}
        <h1 className="text-xl font-serif font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

// ─── DATA TABLE ──────────────────────────────────────────────────────────────
export function DataTable({ columns, data, loading, pagination, onPageChange, searchable, onSearch, emptyText }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder={t('search') + '...'}
              onChange={e => onSearch?.(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map(col => (
                <th key={col.key} className={clsx(
                  'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap',
                  col.className
                )}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400 text-sm">
                  {emptyText || t('no_data')}
                </td>
              </tr>
            ) : (
              data?.map((row, i) => (
                <motion.tr
                  key={row.id ?? i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors"
                >
                  {columns.map(col => (
                    <td key={col.key} className={clsx('px-4 py-3 text-sm text-gray-700', col.cellClass)}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > pagination.per_page && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {t('page')} {pagination.current_page} {t('of')} {Math.ceil(pagination.total / pagination.per_page)}
            {' '}· {pagination.total} {t('total')}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === Math.ceil(pagination.total / pagination.per_page)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
export function Badge({ label, color = 'gray' }) {
  const colors = {
    green:  'bg-emerald-100 text-emerald-700',
    red:    'bg-red-100 text-red-700',
    blue:   'bg-primary-100 text-primary-700',
    gold:   'bg-gold-100 text-gold-700',
    gray:   'bg-gray-100 text-gray-600',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', colors[color] || colors.gray)}>
      {label}
    </span>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className={clsx('bg-white rounded-2xl shadow-2xl w-full overflow-hidden', sizes[size])}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-serif font-bold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, icon: Icon, onClick, type = 'button', disabled, className }) {
  const variants = {
    primary:  'bg-gradient-to-r from-primary-800 to-primary-500 text-white shadow-md shadow-primary-200 hover:shadow-lg hover:shadow-primary-300',
    secondary:'bg-white text-primary-600 border-2 border-primary-200 hover:bg-primary-50',
    danger:   'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    ghost:    'text-gray-600 hover:bg-gray-100',
    gold:     'bg-gradient-to-r from-gold-600 to-gold-400 text-white shadow-gold hover:shadow-gold',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-sm gap-2',
  };
  return (
    <button
      type={type} onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5',
        variants[variant], sizes[size], className
      )}
    >
      {loading ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
               : Icon ? <Icon size={size === 'sm' ? 13 : 15} /> : null}
      {children}
    </button>
  );
}

// ─── FORM FIELD ──────────────────────────────────────────────────────────────
export function FormField({ label, error, required, children, hint }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Input({ error, className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all',
        'focus:ring-2 focus:ring-primary-200 focus:border-primary-400',
        error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300',
        className
      )}
      {...props}
    />
  );
}

export function Select({ error, children, className, ...props }) {
  return (
    <select
      className={clsx(
        'w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all appearance-none bg-white',
        'focus:ring-2 focus:ring-primary-200 focus:border-primary-400',
        error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
export function Avatar({ name, src, size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  if (src) return <img src={src} alt={name} className={clsx(sizes[size], 'rounded-xl object-cover')} />;
  return (
    <div className={clsx(sizes[size], 'rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center shrink-0')}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ─── LOADING SPINNER ─────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  return (
    <div className={clsx(sizes[size], 'border-primary-200 border-t-primary-500 rounded-full animate-spin', className)} />
  );
}

// ─── CARD ────────────────────────────────────────────────────────────────────
export function Card({ children, className, title, action }) {
  return (
    <div className={clsx('bg-white rounded-2xl border border-gray-100 shadow-card', className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
