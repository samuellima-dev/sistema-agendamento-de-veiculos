import React, { useState } from 'react';
import { useAuth } from '../store';
import { Button, Input } from './UI';
import { Car } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      login(email);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
        {/* Background Image with Overlay */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-40" 
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-0"></div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in duration-300 mx-4">
            <div className="p-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 mb-4">
                    <Car className="text-brand-600" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Bem-vindo</h1>
                <p className="text-slate-500 mt-2 text-sm">Entre para gerenciar os test-drives da loja</p>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
                <Input 
                    label="E-mail" 
                    type="email" 
                    placeholder="gerente@driveflow.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input 
                    label="Senha" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                
                <div className="pt-2">
                    <Button 
                        fullWidth 
                        type="submit" 
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Acessar Painel'}
                    </Button>
                </div>
                
                <div className="text-center pt-2">
                    <p className="text-xs text-slate-400">
                        Credenciais de Demo: Qualquer e-mail / senha
                    </p>
                </div>
            </form>
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">Não tem uma conta? <span className="text-brand-600 font-semibold cursor-pointer hover:underline">Solicitar Acesso</span></p>
            </div>
        </div>
    </div>
  );
};