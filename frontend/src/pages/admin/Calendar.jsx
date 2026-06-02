import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, Globe } from 'lucide-react';
import { calendarApi } from '@/services/api';
import { PageHeader, Modal, Button, Badge, FormField, Input, Select } from '@/components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const nepMonths = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुन','चैत्र'];
const nepDays   = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि'];
const engDays   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const typeColors = {
  holiday: { bg:'bg-red-100',   text:'text-red-700',    dot:'bg-red-500'    },
  exam:    { bg:'bg-amber-100', text:'text-amber-700',  dot:'bg-amber-500'  },
  event:   { bg:'bg-blue-100',  text:'text-blue-700',   dot:'bg-blue-500'   },
  meeting: { bg:'bg-purple-100',text:'text-purple-700', dot:'bg-purple-500' },
  other:   { bg:'bg-gray-100',  text:'text-gray-600',   dot:'bg-gray-400'   },
};

export default function Calendar() {
  const { t, i18n } = useTranslation();
  const qc           = useQueryClient();
  const isNe         = i18n.language === 'ne';
  const [current,  setCurrent]  = useState(new Date());
  const [calMode,  setCalMode]  = useState('ad'); // 'ad' | 'bs'
  const [addOpen,  setAddOpen]  = useState(false);
  const [selected, setSelected] = useState(null);

  const from = format(startOfMonth(current), 'yyyy-MM-dd');
  const to   = format(endOfMonth(current),   'yyyy-MM-dd');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events', from, to],
    queryFn:  () => calendarApi.events({ from, to }).then(r => r.data.events),
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays', current.getFullYear()],
    queryFn:  () => calendarApi.holidays({ year: current.getFullYear() }).then(r => r.data.holidays),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const createMut = useMutation({
    mutationFn: (d) => calendarApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries(['calendar-events']);
      toast.success(t('created'));
      setAddOpen(false);
      reset();
    },
    onError: () => toast.error('Failed to create event'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => calendarApi.delete(id),
    onSuccess: () => { qc.invalidateQueries(['calendar-events']); toast.success(t('deleted')); setSelected(null); },
  });

  // Build calendar grid
  const year  = current.getFullYear();
  const month = current.getMonth();
  const first = new Date(year, month, 1).getDay(); // 0=Sun
  const days  = new Date(year, month + 1, 0).getDate();

  const eventsOnDay = (d) => {
    const dateStr = format(new Date(year, month, d), 'yyyy-MM-dd');
    return events.filter(e => e.start_date?.startsWith(dateStr) || (e.end_date && e.start_date <= dateStr && e.end_date >= dateStr));
  };

  const isToday = (d) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNe ? 'पात्रो' : t('calendar')}
        subtitle={isNe ? 'BS + AD दोहोरो पात्रो' : 'Bikram Sambat + Gregorian dual calendar'}
        breadcrumb="Home / Calendar"
        actions={
          <>
            {/* BS/AD toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {['ad','bs'].map(m => (
                <button key={m} onClick={() => setCalMode(m)}
                  className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    calMode === m ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}>
                  {m === 'ad' ? 'AD (Gregorian)' : 'BS (बिक्रम सम्बत)'}
                </button>
              ))}
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>Add Event</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary-800 to-primary-600 text-white">
            <button onClick={() => setCurrent(d => subMonths(d, 1))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="text-center">
              <p className="font-serif font-bold text-lg">
                {calMode === 'ad'
                  ? format(current, 'MMMM yyyy')
                  : `${nepMonths[month]} ${year + 56} BS`}
              </p>
              {calMode === 'bs' && (
                <p className="text-white/60 text-xs mt-0.5">{format(current, 'MMMM yyyy')} AD</p>
              )}
            </div>
            <button onClick={() => setCurrent(d => addMonths(d, 1))}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-primary-50 border-b border-primary-100">
            {(calMode === 'bs' ? nepDays : engDays).map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-semibold text-primary-600">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells */}
            {Array.from({ length: first }).map((_, i) => (
              <div key={`e${i}`} className="min-h-[90px] border-b border-r border-gray-50" />
            ))}

            {/* Day cells */}
            {Array.from({ length: days }).map((_, i) => {
              const d = i + 1;
              const dayEvents = eventsOnDay(d);
              const today     = isToday(d);
              const bsDay     = d; // simplified; full conversion would use NepaliDateService

              return (
                <motion.div
                  key={d}
                  whileHover={{ backgroundColor: '#EBF4FF' }}
                  className={clsx(
                    'min-h-[90px] border-b border-r border-gray-50 p-1.5 cursor-pointer transition-colors',
                    today && 'bg-primary-50'
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={clsx(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold',
                      today ? 'bg-primary-500 text-white' : 'text-gray-700'
                    )}>{d}</span>
                    {calMode === 'bs' && (
                      <span className="text-[9px] text-primary-400 font-devanagari">{bsDay}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => {
                      const tc = typeColors[e.type] || typeColors.other;
                      return (
                        <div key={e.id} onClick={() => setSelected(e)}
                          className={clsx('text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium cursor-pointer', tc.bg, tc.text)}>
                          {e.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <p className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Event Types</h4>
            {Object.entries(typeColors).map(([type, c]) => (
              <div key={type} className="flex items-center gap-2 mb-2">
                <div className={clsx('w-3 h-3 rounded-full', c.dot)} />
                <span className="text-xs text-gray-600 capitalize">{type}</span>
              </div>
            ))}
          </div>

          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">This Month's Events</h4>
            {isLoading && <div className="space-y-2">{Array.from({length:3}).map((_,i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>}
            {events.length === 0 && !isLoading && <p className="text-xs text-gray-400">No events this month</p>}
            <div className="space-y-2">
              {events.slice(0, 8).map(e => {
                const tc = typeColors[e.type] || typeColors.other;
                return (
                  <div key={e.id} className={clsx('flex items-start gap-2 p-2 rounded-xl', tc.bg)}>
                    <div className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', tc.dot)} />
                    <div>
                      <p className={clsx('text-xs font-semibold', tc.text)}>{e.title}</p>
                      <p className="text-[10px] text-gray-500">{e.start_date}</p>
                      {e.start_bs_formatted && (
                        <p className="text-[10px] text-gray-400 font-devanagari">{e.start_bs_formatted}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holidays */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Public Holidays</h4>
            <div className="space-y-2">
              {holidays.slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{h.title}</p>
                    <p className="text-[10px] text-gray-400">{h.start_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); reset(); }} title="Add Calendar Event" size="md">
        <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
          <FormField label="Title (English)" required error={errors.title?.message}>
            <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. Annual Sports Day" />
          </FormField>
          <FormField label="Title (नेपाली)" error={errors.title_ne?.message}>
            <Input {...register('title_ne')} placeholder="e.g. वार्षिक खेलकुद दिवस" className="font-devanagari" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required error={errors.start_date?.message}>
              <Input type="date" {...register('start_date', { required: 'Start date required' })} />
            </FormField>
            <FormField label="End Date">
              <Input type="date" {...register('end_date')} />
            </FormField>
          </div>
          <FormField label="Event Type" required>
            <Select {...register('type', { required: true })}>
              <option value="event">Event</option>
              <option value="holiday">Holiday</option>
              <option value="exam">Exam</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </Select>
          </FormField>
          <FormField label="Description">
            <textarea {...register('description')} rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-200 resize-none" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setAddOpen(false); reset(); }}>Cancel</Button>
            <Button variant="primary" type="submit" loading={createMut.isPending}>Create Event</Button>
          </div>
        </form>
      </Modal>

      {/* Event detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Event Details" size="sm">
        {selected && (
          <div className="space-y-3">
            <div className={clsx('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',
              typeColors[selected.type]?.bg, typeColors[selected.type]?.text)}>
              <div className={clsx('w-2 h-2 rounded-full', typeColors[selected.type]?.dot)} />
              <span className="capitalize">{selected.type}</span>
            </div>
            <h3 className="font-semibold text-gray-900">{selected.title}</h3>
            {selected.title_ne && <p className="text-sm text-gray-600 font-devanagari">{selected.title_ne}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Start (AD)</p><p className="font-medium">{selected.start_date}</p></div>
              {selected.start_bs_formatted && <div><p className="text-xs text-gray-400">Start (BS)</p><p className="font-medium font-devanagari">{selected.start_bs_formatted}</p></div>}
            </div>
            {selected.description && <p className="text-sm text-gray-600">{selected.description}</p>}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="danger" size="sm" onClick={() => deleteMut.mutate(selected.id)} loading={deleteMut.isPending}>Delete</Button>
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
