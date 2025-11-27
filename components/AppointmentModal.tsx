import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Phone, Car } from 'lucide-react';
import { Button, Input, TextArea } from './UI';
import { Appointment } from '../types';
import { useAppointments } from '../store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  existingAppointment?: Appointment | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ 
  isOpen, onClose, selectedDate, existingAppointment 
}) => {
  const { addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  
  const [formData, setFormData] = useState({
    leadName: '',
    phone: '',
    time: '10:00',
    model: '',
    notes: ''
  });

  useEffect(() => {
    if (existingAppointment) {
      setFormData({
        leadName: existingAppointment.leadName,
        phone: existingAppointment.phone,
        time: format(existingAppointment.date, 'HH:mm'),
        model: existingAppointment.model,
        notes: existingAppointment.notes || ''
      });
    } else {
      // Reset form for new appointment
      setFormData({
        leadName: '',
        phone: '',
        time: '09:00',
        model: '',
        notes: ''
      });
    }
  }, [existingAppointment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct Date object combining selectedDate + time
    const [hours, minutes] = formData.time.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const payload = {
      leadName: formData.leadName,
      phone: formData.phone,
      date: appointmentDate,
      model: formData.model,
      notes: formData.notes
    };

    if (existingAppointment) {
      updateAppointment(existingAppointment.id, payload);
    } else {
      addAppointment(payload);
    }
    onClose();
  };

  const handleDelete = () => {
    if (existingAppointment && confirm('Tem certeza que deseja cancelar este agendamento?')) {
      deleteAppointment(existingAppointment.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {existingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 capitalize">
              <CalendarIcon size={12} />
              {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Horário</label>
               <div className="relative">
                 <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                 <input 
                   type="time" 
                   required
                   className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                   value={formData.time}
                   onChange={(e) => setFormData({...formData, time: e.target.value})}
                 />
               </div>
            </div>
            
             <div className="space-y-1">
               <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Veículo</label>
               <div className="relative">
                 <Car className="absolute left-3 top-2.5 text-slate-400" size={16} />
                 <input
                    type="text"
                    required
                    placeholder="Ex: Toyota Corolla"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                 />
               </div>
            </div>
          </div>

          <div className="space-y-1">
             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Nome do Cliente</label>
             <div className="relative">
               <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <input 
                 type="text" 
                 required
                 placeholder="João da Silva"
                 className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                 value={formData.leadName}
                 onChange={(e) => setFormData({...formData, leadName: e.target.value})}
               />
             </div>
          </div>

          <div className="space-y-1">
             <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Telefone</label>
             <div className="relative">
               <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
               <input 
                 type="tel" 
                 required
                 placeholder="(11) 99999-9999"
                 className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                 value={formData.phone}
                 onChange={(e) => setFormData({...formData, phone: e.target.value})}
               />
             </div>
          </div>

          <TextArea 
            label="Observações" 
            placeholder="Pedidos especiais, veículo de troca..." 
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />

          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2">
            {existingAppointment && (
              <Button type="button" variant="danger" onClick={handleDelete} className="w-1/3">
                Excluir
              </Button>
            )}
            <Button type="submit" variant="primary" className="flex-1">
              {existingAppointment ? 'Salvar' : 'Agendar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};