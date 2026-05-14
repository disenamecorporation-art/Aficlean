import React from 'react';
import { Instagram, MapPin, Phone, Mail, Droplets, ScrollText, Eraser as Brush, Trash2, Sparkles, Package } from 'lucide-react';
import { useAppContext } from '../AppContext';

const footerCategories = [
  { name: 'Detergentes', icon: Droplets },
  { name: 'Papel Higiénico', icon: ScrollText },
  { name: 'Utensilios de Limpieza', icon: Brush },
  { name: 'Bolsas para Basura', icon: Trash2 },
  { name: 'Cuidado Personal', icon: Sparkles },
  { name: 'Envases Plásticos', icon: Package },
];

export const Footer = () => {
  const { setView, setStoreCategory } = useAppContext();

  return (
    <footer className="bg-slate-900 text-white pt-32 pb-16 px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <img src="https://i.postimg.cc/0NvYq3b2/LOGOOFICIALWEB.png" alt="Afi Clean Logo" className="h-16 w-auto" />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Líderes en distribución de productos de limpieza de alta gama en Caracas. Calidad garantizada para tu hogar y empresa.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/afishop.ve" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-green transition-all hover:-translate-y-1">
                <Instagram className="w-6 h-6 text-white" />
              </a>
              <a href="https://wa.me/584241294220" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 transition-all hover:-translate-y-1">
                <Phone className="w-6 h-6 text-white" />
              </a>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-red transition-all hover:-translate-y-1 cursor-pointer">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8">Categorías</h4>
            <div className="grid grid-cols-1 gap-4">
              {footerCategories.map((cat) => (
                <button 
                  key={cat.name} 
                  onClick={() => {
                    setStoreCategory(cat.name as any);
                    setView('store');
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center gap-3 group text-left w-full"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary-yellow transition-colors">
                    <cat.icon className="w-4 h-4 text-slate-400 group-hover:text-black transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8">Contacto Directo</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-green/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary-green" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ubicación</p>
                  <p className="text-sm font-medium leading-tight">Boleita Sur, 1ra Transversal, Caracas</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-yellow/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary-yellow" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ventas</p>
                  <p className="text-sm font-black text-primary-yellow">0424-1294220</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Redes Sociales</p>
                  <p className="text-sm font-medium">@afishop.ve</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 h-fit">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 text-center">Aceptamos</h4>
            <div className="flex flex-col items-center gap-6">
              <div className="bg-[#FFEB00] px-6 py-3 rounded-2xl flex flex-col items-center gap-1 group cursor-pointer hover:scale-105 transition-transform">
                <span className="text-[8px] font-black text-black uppercase tracking-widest">Paga con</span>
                <img src="https://i.postimg.cc/vZZr2Hv8/logocashea.jpg" alt="Cashea" className="h-6 w-auto mix-blend-multiply" />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500">ZELLE</div>
                <div className="h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500">PAGO MÓVIL</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-green rounded-full flex items-center justify-center text-[10px] font-black">A</div>
            </div>
            <a 
              href="https://instagram.com/legaint.ve" 
              target="_blank" 
              rel="noreferrer" 
              className="group flex items-center gap-2"
            >
              <span className="text-[10px] font-black text-slate-500 group-hover:text-white transition-colors uppercase tracking-widest">Hecho por Legaint Corporation</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-yellow animate-pulse" />
            </a>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <p>© {new Date().getFullYear()}. Caracas, Venezuela.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
