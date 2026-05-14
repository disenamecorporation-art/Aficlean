import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Loader2, Phone, MapPin, Hash, Building2 } from 'lucide-react';
import { useAppContext } from '../AppContext';

import { supabase } from '../lib/supabase';

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isWholesale, setIsWholesale] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
        
        // El AppContext se encargará de actualizar el usuario vía onAuthStateChange
        onClose();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name: name
            }
          }
        });
        
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          try {
            const ADMIN_EMAILS = ['corplegaint5@gmail.com', 'disenamecorporation@gmail.com', 'aficleanweb@gmail.com'];
            const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());

            const profileData = {
              id: data.user.id,
              email,
              name,
              role: isAdminEmail ? 'admin' : (isWholesale ? 'wholesale' : 'user'),
              phone,
              address,
              tax_id: taxId
            };

            await supabase
              .from('profiles')
              .upsert(profileData);
          } catch (profileErr) {
            console.error('Error in background profile creation:', profileErr);
          }
        }

        // Si el correo fue enviado o la sesión ya se inició
        setIsLogin(true);
        setError('Registro exitoso. ¡Inicia sesión con tus credenciales!');
        setPassword(''); // Clear password for login
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      // Solo quitamos el loading si ocurrió un error o estamos en registro
      // Si el login fue exitoso, el modal se cerrará y no importa el loading
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit max-h-[90vh] overflow-y-auto bg-white z-[201] shadow-2xl rounded-[2rem]"
          >
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src="https://i.postimg.cc/0NvYq3b2/LOGOOFICIALWEB.png" alt="Logo" className="h-8 w-auto" />
                  <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tighter">
                    {isLogin ? 'Bienvenido' : (isWholesale ? 'Registro Mayorista' : 'Crea tu cuenta')}
                  </h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {!isLogin && (
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button 
                    onClick={() => setIsWholesale(false)}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isWholesale ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500'}`}
                  >
                    Cliente Regular
                  </button>
                  <button 
                    onClick={() => setIsWholesale(true)}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isWholesale ? 'bg-primary-green text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="w-3 h-3" />
                      Soy Mayorista
                    </div>
                  </button>
                </div>
              )}

              {error && (
                <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-wider ${error.includes('exitoso') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">
                        {isWholesale ? 'Nombre de la Empresa / Razón Social' : 'Nombre Completo'}
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-green focus:bg-white outline-none transition-all font-medium text-sm"
                          placeholder={isWholesale ? "Distribuidora Clean C.A." : "Juan Perez"}
                        />
                      </div>
                    </div>

                    {isWholesale && (
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">RIF (Opcional)</label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            type="text" 
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-green focus:bg-white outline-none transition-all font-medium text-sm"
                            placeholder="J-12345678-9"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Teléfono</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            required
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-green focus:bg-white outline-none transition-all font-medium text-sm"
                            placeholder="+58 424..."
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Ciudad / Zona</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            required
                            type="text" 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-green focus:bg-white outline-none transition-all font-medium text-sm"
                            placeholder="Caracas, Chacao"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-green focus:bg-white outline-none transition-all font-medium text-sm"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      required
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-green focus:bg-white outline-none transition-all font-medium text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={loading}
                    className="w-full premium-btn bg-primary-green text-white shadow-lg shadow-green-100 flex items-center justify-center gap-2 h-14"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Iniciar Sesión' : 'Registrarme')}
                  </button>
                </div>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-xs font-black text-primary-green hover:underline uppercase tracking-widest"
                >
                  {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
