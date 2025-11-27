import React, { useState } from 'react';
import { X, ExternalLink, HelpCircle } from 'lucide-react';
import { Button, Input } from './UI';

interface GoogleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string) => void;
}

export const GoogleConfigModal: React.FC<GoogleConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const [clientId, setClientId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim()) {
      onSave(clientId.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             Configurar Google Agenda
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
            <p className="flex gap-2 font-semibold mb-2">
              <HelpCircle size={18} />
              Configuração Necessária
            </p>
            <p className="mb-2">Para abrir a janela oficial de login do Google, este aplicativo precisa de um <strong>Client ID</strong> do Google Cloud.</p>
            <p>
              O Google não permite autenticação "genérica" sem um projeto registrado por motivos de segurança.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
               <label className="block text-sm font-semibold text-slate-700">Google Client ID</label>
               <Input 
                 placeholder="Ex: 123456789-abc...apps.googleusercontent.com" 
                 value={clientId}
                 onChange={(e) => setClientId(e.target.value)}
                 required
               />
               <p className="text-xs text-slate-500">
                 Cole aqui seu ID criado no console do GCP.
               </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Salvar e Conectar</Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-2">Como obter um Client ID:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" className="text-brand-600 hover:underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink size={10}/></a>.</li>
              <li>Crie um projeto e habilite a <strong>Google Calendar API</strong>.</li>
              <li>Vá em <strong>Credenciais</strong>, crie um "ID do cliente OAuth".</li>
              <li>Escolha "Aplicativo da Web".</li>
              <li>Em "Origens JavaScript autorizadas", adicione a URL atual do seu site.</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
};