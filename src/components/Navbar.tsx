import React, { useState } from 'react';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Trash2, Plus, Minus } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = ({ onOpenAuth, onOpenCart, onOpenAdmin }: { onOpenAuth: () => void, onOpenCart: () => void, onOpenAdmin: () => void }) => {
  const { user, setUser, cart, view, setView, exchangeRate } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const navLinks = [
    { name: 'Inicio', view: 'home', href: '#' },
    { name: 'Tienda', view: 'store', href: '#' },
    { name: 'Nosotros', href: '#nosotros' },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FFEB00] text-black h-10 flex items-center justify-between px-6 overflow-hidden shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Paga en cuotas con</span>
          <img src="https://i.postimg.cc/vZZr2Hv8/logocashea.jpg" alt="Cashea" className="h-6 w-auto mix-blend-multiply" />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-black/5 px-3 py-1 rounded-full">
            <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Tasa BCV:</span>
            <span className="text-[10px] font-black text-black">1$ = {exchangeRate.toFixed(2)} BS</span>
          </div>
        </div>
      </div>
      <nav className="fixed top-10 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center" onClick={() => setView('home')}>
            <img src="https://i.postimg.cc/0NvYq3b2/LOGOOFICIALWEB.png" alt="Afi Clean Logo" className="h-20 w-auto transform transition-all hover:scale-110 active:scale-95 cursor-pointer" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`text-slate-600 hover:text-primary-green font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5 ${view === link.view ? 'text-primary-green border-b-2 border-primary-green' : ''}`}
                onClick={(e) => {
                  if (link.view) {
                    e.preventDefault();
                    setView(link.view as any);
                  }
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <button onClick={onOpenAdmin} className="text-[10px] bg-primary-green text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest hover:shadow-lg shadow-green-100 transition-all hidden sm:block active:scale-95">
                Admin
              </button>
            )}
            
            <button onClick={onOpenCart} className="p-3 hover:bg-slate-100 rounded-2xl relative transition-colors group">
              <ShoppingCart className="w-6 h-6 text-slate-700 group-hover:text-primary-green transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-red text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold animate-bounce">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-700 hidden sm:block uppercase tracking-tighter">Hola, {user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-colors">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <button onClick={onOpenAuth} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                <UserIcon className="w-6 h-6 text-slate-700" />
              </button>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-3 hover:bg-slate-100 rounded-2xl transition-colors">
              {isMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden shadow-2xl"
            >
              <div className="p-6 space-y-6">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className={`block font-black text-sm uppercase tracking-widest ${view === link.view ? 'text-primary-green' : 'text-slate-700'}`}
                    onClick={(e) => {
                      if (link.view) {
                        e.preventDefault();
                        setView(link.view as any);
                      }
                      setIsMenuOpen(false);
                    }}
                  >
                    {link.name}
                  </a>
                ))}
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => { onOpenAdmin(); setIsMenuOpen(false); }} 
                    className="w-full text-left py-4 px-6 bg-primary-green text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    Panel Admin
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
