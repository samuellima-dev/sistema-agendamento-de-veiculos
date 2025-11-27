import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, LogOut, Menu, X, CalendarCheck } from 'lucide-react';
import { useAuth, useAppointments } from '../store';
import { AppointmentModal } from './AppointmentModal';
import { GoogleConfigModal } from './GoogleConfigModal';
import { Button } from './UI';
import { Appointment } from '../types';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    appointments, 
    getAppointmentsByDate, 
    isGoogleConnected, 
    connectGoogleCalendar,
    googleClientId,
    setGoogleClientId
  } = useAppointments();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart); // date-fns default starts on Sunday
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsMobileSidebarOpen(true); // On mobile, open sidebar to show details
  };

  const handleAddClick = () => {
    setEditingAppt(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (appt: Appointment) => {
    setEditingAppt(appt);
    setIsModalOpen(true);
  };

  const handleConnectClick = () => {
    if (isGoogleConnected) return; // Already connected

    if (!googleClientId) {
        setIsConfigModalOpen(true);
    } else {
        connectGoogleCalendar();
    }
  };

  const handleSaveConfig = (id: string) => {
    setGoogleClientId(id);
    setIsConfigModalOpen(false);
    // Give a slight delay for the state/script to settle before triggering popup
    setTimeout(() => {
        connectGoogleCalendar();
    }, 500);
  };

  const selectedDayAppointments = getAppointmentsByDate(selectedDate);

  // Render Logic
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      
      {/* --- Top Navigation --- */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg">
                <CalIcon className="text-white" size={20} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Sistema de Agendamento</h1>
                <p className="text-xs text-slate-500 font-medium">Inteligente</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleConnectClick}
                disabled={isGoogleConnected}
                className={isGoogleConnected ? "text-green-600 border-green-200 bg-green-50 opacity-100 cursor-default" : ""}
            >
                {isGoogleConnected ? (
                    <><CalendarCheck size={16} className="mr-2" /> Google Sincronizado</>
                ) : (
                    "Conectar Google Agenda"
                )}
            </Button>
            
            <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
                <span className="text-xs text-slate-400">Gerente de Vendas</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500 hover:text-red-500">
                <LogOut size={18} />
            </Button>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex flex-1 overflow-hidden relative">
        
        {/* Calendar View */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                    <div className="flex bg-white rounded-md border border-slate-200 shadow-sm">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 border-r border-slate-100 text-slate-600"><ChevronLeft size={20}/></button>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 text-slate-600"><ChevronRight size={20}/></button>
                    </div>
                    <button onClick={goToToday} className="text-sm font-medium text-brand-600 hover:text-brand-700">Hoje</button>
                </div>
                <div className="flex gap-2">
                     <Button onClick={handleAddClick} className="gap-2 shadow-lg shadow-brand-500/20">
                        <Plus size={18} /> Novo Agendamento
                     </Button>
                </div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid Body */}
            <div className="grid grid-cols-7 grid-rows-6 flex-1 bg-slate-100 gap-px border-b border-slate-200">
                {calendarDays.map((day, dayIdx) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const dayAppts = getAppointmentsByDate(day);
                    
                    return (
                        <div 
                            key={day.toString()}
                            onClick={() => handleDateClick(day)}
                            className={`
                                relative bg-white p-2 min-h-[80px] transition-colors cursor-pointer group hover:bg-slate-50
                                ${!isCurrentMonth ? 'bg-slate-50/50' : ''}
                                ${isSelected ? 'ring-2 ring-inset ring-brand-500 z-10' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`
                                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                    ${isToday(day) ? 'bg-brand-600 text-white' : (isCurrentMonth ? 'text-slate-700' : 'text-slate-400')}
                                `}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                            
                            {/* Appointment Dots/Bars */}
                            <div className="mt-1 space-y-1">
                                {dayAppts.slice(0, 3).map((appt) => (
                                    <div key={appt.id} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-medium truncate border border-brand-100/50">
                                        {format(appt.date, 'HH:mm')} - {appt.model}
                                    </div>
                                ))}
                                {dayAppts.length > 3 && (
                                    <div className="text-[10px] text-slate-400 pl-1">
                                        + {dayAppts.length - 3} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Sidebar (Desktop: Static, Mobile: Absolute/Drawer) */}
        <aside className={`
            absolute md:relative inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-xl md:shadow-none z-20 transform transition-transform duration-300
            ${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
            {/* Mobile Close Button */}
            <div className="md:hidden p-4 flex justify-between items-center border-b border-slate-100">
                <span className="font-semibold text-slate-700">Agenda</span>
                <button onClick={() => setIsMobileSidebarOpen(false)}><X size={20} className="text-slate-400"/></button>
            </div>

            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                    <h3 className="text-lg font-bold text-slate-800 capitalize">{format(selectedDate, 'EEEE', { locale: ptBR })}</h3>
                    <p className="text-slate-500 capitalize">{format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}</p>
                </div>

                {/* Agenda List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedDayAppointments.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalIcon className="text-slate-300" size={24} />
                            </div>
                            <p className="text-slate-500 text-sm">Nenhum test-drive agendado.</p>
                            <Button variant="ghost" size="sm" onClick={handleAddClick} className="mt-2 text-brand-600">
                                Agendar Agora
                            </Button>
                        </div>
                    ) : (
                        selectedDayAppointments.map(appt => (
                            <div 
                                key={appt.id} 
                                className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer"
                                onClick={() => handleEditClick(appt)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md">
                                        {format(appt.date, 'HH:mm')}
                                    </span>
                                    {/* Edit Hint Icon */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                                        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-slate-800 text-sm mb-0.5">{appt.leadName}</h4>
                                <div className="text-xs text-slate-500 font-medium mb-2">{appt.model}</div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{appt.phone}</span>
                                </div>
                                {/* Sync Status Dot */}
                                {appt.googleEventId && (
                                    <div className="absolute bottom-4 right-4" title="Sincronizado com Google">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                
                {/* Bottom Add Button (Mobile Friendly) */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <Button fullWidth onClick={handleAddClick} variant="secondary">
                         Adicionar em {format(selectedDate, 'dd/MM')}
                    </Button>
                </div>
            </div>
        </aside>

      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={selectedDate}
        existingAppointment={editingAppt}
      />

      <GoogleConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
      />
    </div>
  );
};