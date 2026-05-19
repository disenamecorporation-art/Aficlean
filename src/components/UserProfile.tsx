import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  CreditCard, 
  Save, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Settings,
  UserPlus,
  Copy
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, setUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    taxId: user?.taxId || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });

  const [sellerName, setSellerName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        phone: user.phone || '',
        address: user.address || '',
        taxId: user.taxId || '',
        email: user.email
      }));

      if (user.referredBy) {
        supabase
          .from('profiles')
          .select('name')
          .eq('id', user.referredBy)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setSellerName(data.name);
          });
      }
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          tax_id: formData.taxId
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setUser({
        ...user!,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        taxId: formData.taxId
      });

      setSuccess('Perfil actualizado correctamente.');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Password update
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        
        const { error: passError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        
        if (passError) throw passError;
        
        setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      }

      // Email update
      if (formData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (emailError) throw emailError;
        
        setSuccess('Se ha enviado un correo de confirmación a tu nueva dirección.');
      } else if (formData.newPassword) {
        setSuccess('Contraseña actualizada correctamente.');
      }

    } catch (err: any) {
      setError(err.message || 'Error al actualizar credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen pt-24 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
            <Settings className="w-10 h-10 text-primary-green" />
            Configuración
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Gestiona tu perfil y seguridad</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{success}</p>
          </motion.div>
        )}

        {/* Referral Section for Sellers */}
        {(user?.referralCode || user?.role === 'vendedor') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-green to-emerald-600 p-8 rounded-[3rem] shadow-xl text-white overflow-hidden relative"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary-yellow text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Socio Vendedor</div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Tu Código de Ventas</h2>
                </div>
                <p className="text-primary-green-50 text-sm font-medium">Usa este código para registrar a tus clientes y ganar comisiones por cada venta confirmada.</p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
                <div className="px-6 py-2">
                  <span className="text-2xl font-black tracking-widest font-mono">{user.referralCode || 'GENERANDO...'}</span>
                  {!user.referralCode && <p className="text-[10px] text-white/60">Actualiza para ver tu código</p>}
                </div>
                {user.referralCode && (
                  <button 
                    onClick={() => copyToClipboard(user.referralCode!)}
                    className={`p-3 rounded-xl transition-all ${copied ? 'bg-primary-yellow text-slate-900' : 'bg-white text-primary-green hover:scale-105'}`}
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        )}

        {/* Info del Vendedor para clientes */}
        {user?.referredBy && !user.referralCode && user.role !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendedor Asignado</p>
                <p className="text-xl font-black text-slate-800 tracking-tight">{sellerName || 'Cargando...'}</p>
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
              Vinculado
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
              <User className="w-5 h-5 text-primary-green" />
              Información Personal
            </h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-green transition-all outline-none font-bold text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-green transition-all outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Identificación Fiscal (RIF)</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.taxId}
                    onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-green transition-all outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Dirección</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea 
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-green transition-all outline-none font-bold text-sm resize-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-primary-green text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-100 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar Cambios
              </button>
            </form>
          </motion.div>

          {/* Security Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Lock className="w-5 h-5 text-primary-yellow" />
              Seguridad y Cuenta
            </h2>
            
            <form onSubmit={handleAuthUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-green transition-all outline-none font-bold text-sm"
                    required
                  />
                </div>
              </div>

              <hr className="border-slate-50 my-8" />

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="Dejar en blanco para no cambiar"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-green transition-all outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="Repite la nueva contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary-green transition-all outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg shadow-slate-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Actualizar Cuenta
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
