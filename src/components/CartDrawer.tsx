import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Plus, Minus, Trash2, Send } from 'lucide-react';
import { useAppContext } from '../AppContext';

import { supabase } from '../lib/supabase';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { cart, updateQuantity, removeFromCart, total, formatPrice, user } = useAppContext();

  const handleWhatsApp = async () => {
    const message = `Hola Afi Clean! Me gustaría realizar el siguiente pedido:\n\n` +
      cart.map(item => `- ${item.name} (x${item.quantity}): ${formatPrice(item.price * item.quantity).usd}`).join('\n') +
      `\n\nTotal: ${formatPrice(total).usd} / ${formatPrice(total).vef}`;
    
    // Save order to database
    try {
      await supabase.from('orders').insert([{
        customer_id: user?.id || null,
        customer_name: user?.name || 'Cliente Web',
        total: total,
        status: 'pending',
        commission: 0.02,
        seller_earnings: 0
      }]);
    } catch (e) {
      console.error("Error saving order:", e);
    }

    const url = `https://wa.me/584241294220?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary-green/10 p-2 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-primary-green" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Tu Pedido</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <ShoppingCart className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Tu carrito está vacío</h3>
                    <p className="text-slate-500 text-sm">¡Agrega algunos productos para brillar!</p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 leading-tight">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-primary-red transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-primary-green font-black">{formatPrice(item.price * item.quantity).usd}</p>
                      <div className="flex items-center gap-3 pt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-slate-800 tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Total Pedido</span>
                    <span className="text-3xl font-black text-primary-green leading-none">{formatPrice(total).usd}</span>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{formatPrice(total).vef}</p>
                </div>
                <button 
                  onClick={handleWhatsApp}
                  className="w-full premium-btn bg-[#25D366] text-white flex items-center justify-center gap-3 text-lg hover:bg-[#128C7E] shadow-lg shadow-emerald-200"
                >
                  <Send className="w-5 h-5" /> Enviar por WhatsApp
                </button>
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest leading-relaxed">
                  Realiza tu pedido y te contactaremos para coordinar el pago y envío.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
