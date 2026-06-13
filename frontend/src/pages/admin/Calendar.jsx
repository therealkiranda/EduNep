import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { calendarApi } from '@/services/api';
import { PageHeader, Button, Card, Modal, FormField, Input, Select } from '@/components/ui';
import { adToBs, bsToAd, getBsMonthGrid, MONTHS_EN, MONTHS_NE, DAYS_EN, DAYS_NE, toDevanagari, useNepaliDate } from '@/hooks/useNepaliDate';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const TC = {
  holiday:{bg:'bg-red-100',text:'text-red-700',dot:'bg-red-500'},
  exam:   {bg:'bg-amber-100',text:'text-amber-700',dot:'bg-amber-500'},
  event:  {bg:'bg-blue-100',text:'text-blue-700',dot:'bg-blue-500'},
  meeting:{bg:'bg-purple-100',text:'text-purple-700',dot:'bg-purple-500'},
  other:  {bg:'bg-gray-100',text:'text-gray-600',dot:'bg-gray-400'},
};

export default function Calendar() {
  const {t,i18n}  = useTranslation();
  const {isNe}    = useNepaliDate();
  const qc        = useQueryClient();
  const [adCurrent,setAdCurrent] = useState(new Date());
  const [mode,setMode]   = useState('ad');
  const [addOpen,setAddOpen] = useState(false);
  const [selected,setSelected] = useState(null);

  const currentBs = adToBs(adCurrent.toISOString().split('T')[0]) || {year:2082,month:1,day:1};
  const from = format(startOfMonth(adCurrent),'yyyy-MM-dd');
  const to   = format(endOfMonth(adCurrent),'yyyy-MM-dd');

  const {data:events=[],isLoading} = useQuery({
    queryKey:['cal-events',from,to],
    queryFn:()=>calendarApi.events({from,to}).then(r=>r.data?.events??[]),
  });
  const {data:holidays=[]} = useQuery({
    queryKey:['cal-holidays',adCurrent.getFullYear()],
    queryFn:()=>calendarApi.holidays({year:adCurrent.getFullYear()}).then(r=>r.data?.holidays??[]),
  });

  const {register,handleSubmit,reset,formState:{errors}} = useForm();

  const createMut = useMutation({
    mutationFn:calendarApi.create,
    onSuccess:()=>{qc.invalidateQueries(['cal-events']);toast.success(isNe?'कार्यक्रम थपियो!':'Event created!');setAddOpen(false);reset();},
    onError:()=>toast.error('Failed'),
  });
  const deleteMut = useMutation({
    mutationFn:(id)=>calendarApi.delete(id),
    onSuccess:()=>{qc.invalidateQueries(['cal-events']);toast.success('Deleted');setSelected(null);},
  });

  const eventsOn = useCallback((dateStr)=>events.filter(e=>e.start_date<=dateStr&&(e.end_date?e.end_date>=dateStr:e.start_date===dateStr)),[events]);

  // AD Grid
  const renderAD = ()=>{
    const yr=adCurrent.getFullYear(),mo=adCurrent.getMonth();
    const first=new Date(yr,mo,1).getDay(),days=new Date(yr,mo+1,0).getDate();
    const tod=new Date();
    const cells=[];
    for(let i=0;i<first;i++) cells.push(<div key={`e${i}`} className="min-h-[72px] border-b border-r border-gray-50"/>);
    for(let d=1;d<=days;d++){
      const ds=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const ev=eventsOn(ds);
      const bs=adToBs(ds);
      const isT=d===tod.getDate()&&mo===tod.getMonth()&&yr===tod.getFullYear();
      cells.push(
        <div key={d} className={clsx('min-h-[72px] border-b border-r border-gray-50 p-1 cursor-pointer hover:bg-primary-50/40 transition-colors',isT&&'bg-primary-50')}>
          <div className="flex items-start justify-between">
            <span className={clsx('w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold',isT?'bg-primary-500 text-white':'text-gray-700')}>{d}</span>
            {bs&&<span className="text-[9px] text-primary-300 font-devanagari">{toDevanagari(bs.day)}</span>}
          </div>
          {ev.slice(0,2).map(e=>{const c=TC[e.type]||TC.other;return(
            <div key={e.id} onClick={()=>setSelected(e)} className={clsx('text-[9px] px-1 py-0.5 rounded truncate mt-0.5 cursor-pointer font-medium',c.bg,c.text)}>
              {isNe&&e.title_ne?e.title_ne:e.title}
            </div>
          );})}
          {ev.length>2&&<p className="text-[9px] text-gray-400">+{ev.length-2}</p>}
        </div>
      );
    }
    return cells;
  };

  // BS Grid
  const renderBS = ()=>{
    const {totalDays,firstDayOfWeek}=getBsMonthGrid(currentBs.year,currentBs.month);
    const tod=adToBs(new Date().toISOString().split('T')[0]);
    const cells=[];
    for(let i=0;i<firstDayOfWeek;i++) cells.push(<div key={`e${i}`} className="min-h-[72px] border-b border-r border-gray-50"/>);
    for(let d=1;d<=totalDays;d++){
      const adDate=bsToAd(currentBs.year,currentBs.month,d);
      const ev=adDate?eventsOn(adDate):[];
      const isT=tod&&d===tod.day&&currentBs.month===tod.month&&currentBs.year===tod.year;
      cells.push(
        <div key={d} className={clsx('min-h-[72px] border-b border-r border-gray-50 p-1 cursor-pointer hover:bg-primary-50/40 transition-colors',isT&&'bg-primary-50')}>
          <div className="flex items-start justify-between">
            <span className={clsx('w-6 h-6 flex items-center justify-center rounded-full font-devanagari text-xs font-semibold',isT?'bg-primary-500 text-white':'text-gray-700')}>{toDevanagari(d)}</span>
            {adDate&&<span className="text-[9px] text-gray-400">{new Date(adDate).getDate()}</span>}
          </div>
          {ev.slice(0,2).map(e=>{const c=TC[e.type]||TC.other;return(
            <div key={e.id} onClick={()=>setSelected(e)} className={clsx('text-[9px] px-1 py-0.5 rounded truncate mt-0.5 cursor-pointer font-medium',c.bg,c.text)}>
              {isNe&&e.title_ne?e.title_ne:e.title}
            </div>
          );})}
        </div>
      );
    }
    return cells;
  };

  const todayBs = adToBs(new Date().toISOString().split('T')[0]);
  const monthLabel = mode==='ad'
    ? format(adCurrent,'MMMM yyyy')
    : `${isNe?toDevanagari(currentBs.year):currentBs.year} ${isNe?MONTHS_NE[currentBs.month-1]:MONTHS_EN[currentBs.month-1]} BS`;
  const monthSub = mode==='bs' ? format(adCurrent,'MMMM yyyy AD') : (currentBs?`${currentBs.year} ${MONTHS_EN[currentBs.month-1]} BS`:'');
  const dayHdrs  = mode==='bs'&&isNe ? DAYS_NE : DAYS_EN;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader title={isNe?'पात्रो':'Calendar'} subtitle="Bikram Sambat + Gregorian dual calendar" breadcrumb="Home / Calendar"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {['ad','bs'].map(m=>(
                <button key={m} onClick={()=>setMode(m)} className={clsx('px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',mode===m?'bg-white text-primary-700 shadow-sm':'text-gray-500 hover:text-gray-700')}>
                  {m==='ad'?'AD':'BS (बिक्रम)'}
                </button>
              ))}
            </div>
            <Button variant="primary" size="sm" icon={Plus} onClick={()=>setAddOpen(true)}>{isNe?'थप्नुहोस्':'Add Event'}</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Calendar main */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-primary-800 to-primary-600 text-white">
            <button onClick={()=>setAdCurrent(d=>subMonths(d,1))} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><ChevronLeft size={16}/></button>
            <div className="text-center">
              <p className={clsx('font-serif font-bold text-base md:text-lg',mode==='bs'&&'font-devanagari')}>{monthLabel}</p>
              {monthSub&&<p className="text-white/60 text-xs mt-0.5">{monthSub}</p>}
            </div>
            <button onClick={()=>setAdCurrent(d=>addMonths(d,1))} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"><ChevronRight size={16}/></button>
          </div>
          <div className="grid grid-cols-7 bg-primary-50 border-b border-primary-100">
            {dayHdrs.map(d=><div key={d} className={clsx('py-2 text-center text-[10px] md:text-xs font-semibold text-primary-600',mode==='bs'&&isNe&&'font-devanagari')}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {isLoading?Array.from({length:35}).map((_,i)=><div key={i} className="min-h-[72px] border-b border-r border-gray-50 animate-pulse bg-gray-50/50"/>)
              :mode==='ad'?renderAD():renderBS()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Today */}
          <Card>
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{isNe?'आजको मिति':"Today's Date"}</h4>
              <div className="p-2.5 bg-primary-50 rounded-xl mb-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">AD</p>
                <p className="text-sm font-semibold text-primary-700">{format(new Date(),'MMMM d, yyyy')}</p>
              </div>
              <div className="p-2.5 bg-gold-50 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">BS</p>
                {todayBs&&<p className="text-sm font-semibold text-gold-700 font-devanagari">{toDevanagari(todayBs.year)} {MONTHS_NE[todayBs.month-1]} {toDevanagari(todayBs.day)}</p>}
              </div>
            </div>
          </Card>

          {/* Legend */}
          <Card>
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{isNe?'प्रकार':'Types'}</h4>
              {Object.entries(TC).map(([type,c])=>(
                <div key={type} className="flex items-center gap-2 mb-1.5">
                  <div className={clsx('w-2.5 h-2.5 rounded-full',c.dot)}/><span className="text-xs text-gray-600 capitalize">{type}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Events list */}
          <Card>
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{isNe?'यो महिना':'This Month'}</h4>
              {events.length===0&&<p className="text-xs text-gray-400">{isNe?'कुनै कार्यक्रम छैन':'No events'}</p>}
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {events.map(e=>{const c=TC[e.type]||TC.other;return(
                  <div key={e.id} onClick={()=>setSelected(e)} className={clsx('flex items-start gap-2 p-2 rounded-xl cursor-pointer hover:opacity-80',c.bg)}>
                    <div className={clsx('w-2 h-2 rounded-full mt-1 shrink-0',c.dot)}/>
                    <div className="min-w-0">
                      <p className={clsx('text-xs font-semibold truncate',c.text)}>{isNe&&e.title_ne?e.title_ne:e.title}</p>
                      <p className="text-[10px] text-gray-500">{e.start_date}</p>
                      {e.start_bs_formatted&&<p className="text-[10px] text-gray-400 font-devanagari">{e.start_bs_formatted}</p>}
                    </div>
                  </div>
                );})}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal open={addOpen} onClose={()=>{setAddOpen(false);reset();}} title={isNe?'नयाँ कार्यक्रम':'Add Event'} size="md">
        <form onSubmit={handleSubmit(d=>createMut.mutate(d))} className="space-y-4">
          <FormField label="Title (English)" required error={errors.title?.message}>
            <Input {...register('title',{required:'Required'})} placeholder="e.g. Sports Day"/>
          </FormField>
          <FormField label="शीर्षक (नेपाली)">
            <Input {...register('title_ne')} placeholder="e.g. खेलकुद दिवस" className="font-devanagari"/>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required error={errors.start_date?.message}>
              <Input type="date" {...register('start_date',{required:'Required'})}/>
            </FormField>
            <FormField label="End Date">
              <Input type="date" {...register('end_date')}/>
            </FormField>
          </div>
          <FormField label="Type" required>
            <Select {...register('type',{required:true})}>
              <option value="event">Event</option><option value="holiday">Holiday</option>
              <option value="exam">Exam</option><option value="meeting">Meeting</option><option value="other">Other</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={()=>{setAddOpen(false);reset();}}>Cancel</Button>
            <Button variant="primary" type="submit" loading={createMut.isPending}>Create</Button>
          </div>
        </form>
      </Modal>

      {/* Event detail */}
      <Modal open={!!selected} onClose={()=>setSelected(null)} title="Event Details" size="sm">
        {selected&&(
          <div className="space-y-3">
            <span className={clsx('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold',(TC[selected.type]||TC.other).bg,(TC[selected.type]||TC.other).text)}>
              <div className={clsx('w-2 h-2 rounded-full',(TC[selected.type]||TC.other).dot)}/> {selected.type}
            </span>
            <h3 className="font-semibold text-gray-900">{isNe&&selected.title_ne?selected.title_ne:selected.title}</h3>
            {selected.title_ne&&!isNe&&<p className="text-sm text-gray-500 font-devanagari">{selected.title_ne}</p>}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400 mb-0.5">AD</p><p className="font-medium">{selected.start_date}{selected.end_date&&selected.end_date!==selected.start_date?` → ${selected.end_date}`:''}</p></div>
              {selected.start_bs_formatted&&<div><p className="text-xs text-gray-400 mb-0.5">BS</p><p className="font-medium font-devanagari">{selected.start_bs_formatted}</p></div>}
            </div>
            {selected.description&&<p className="text-sm text-gray-600">{selected.description}</p>}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="danger" size="sm" icon={Trash2} onClick={()=>deleteMut.mutate(selected.id)} loading={deleteMut.isPending}>Delete</Button>
              <Button variant="secondary" size="sm" onClick={()=>setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
