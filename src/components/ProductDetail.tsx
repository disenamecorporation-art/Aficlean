import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Product } from '../types';

export const ProductDetail = () => {
  const { selectedProduct, setSelectedProduct, addToCart, formatPrice, exchangeRate, user } = useAppContext();

  if (!selectedProduct) return null;

  const prices = formatPrice(selectedProduct.price);
  const isWholesale = user?.role === 'wholesale';
  const wholesalePrices = selectedProduct.wholesalePrice ? formatPrice(selectedProduct.wholesalePrice) : null;

  return (
    <AnimatePresence>
      {selectedProduct && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-4 md:inset-10 m-auto w-full max-w-5xl h-fit max-h-[90vh] bg-white z-[201] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row"
          >
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative bg-slate-50">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full md:hidden"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-primary-red text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] block w-fit">
                      {selectedProduct.category}
                    </span>
                    {isWholesale && wholesalePrices && (
                      <span className="bg-primary-yellow text-slate-900 px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] block w-fit shadow-md animate-pulse">
                        Mayorista
                      </span>
                    )}
                  </div>
                  <h2 className="text-5xl font-black text-slate-800 uppercase tracking-tighter leading-[0.9] mb-4">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex items-center gap-1 text-primary-yellow">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    <span className="text-xs font-black text-slate-400 ml-2 uppercase tracking-widest">(4.8 de 5)</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-3 hover:bg-slate-100 rounded-full transition-colors hidden md:block"
                >
                  <X className="w-8 h-8 text-slate-400" />
                </button>
              </div>

              <div className="py-8 border-y border-slate-100 space-y-2">
                <div className="flex flex-col">
                  {isWholesale && wholesalePrices ? (
                    <>
                      <div className="flex items-baseline gap-3 opacity-50 mb-1">
                        <span className="text-3xl font-black text-slate-400 line-through tracking-tighter">{prices.usd}</span>
                        <span className="text-sm font-black text-slate-300 uppercase tracking-widest">USD (Regular)</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-6xl font-black text-primary-yellow tracking-tighter">{wholesalePrices.usd}</span>
                        <span className="text-2xl font-black text-primary-yellow uppercase tracking-widest">USD (Mayor)</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-4">
                      <span className="text-6xl font-black text-primary-green tracking-tighter">{prices.usd}</span>
                      <span className="text-2xl font-black text-slate-300 uppercase tracking-widest">USD</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-black text-slate-400 uppercase tracking-widest">
                    {isWholesale && wholesalePrices ? wholesalePrices.vef : prices.vef}
                  </p>
                  <div className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-400 uppercase">Tasa: Bs. {exchangeRate.toFixed(2)}</div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-4 italic">Precio referencial sujeto a tasa oficial BCV</p>
              </div>

              <div className="py-8 space-y-6 flex-1">
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  {selectedProduct.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                    <ShieldCheck className="w-5 h-5 text-primary-green" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Calidad Garantizada</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                    <Truck className="w-5 h-5 text-primary-green" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Envío en Caracas</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-auto flex flex-col gap-4">
                <button 
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full premium-btn bg-primary-green text-white h-20 text-xl font-black flex items-center justify-center gap-4 hover:scale-[1.02] shadow-2xl shadow-green-100"
                >
                  <ShoppingCart className="w-8 h-8" />
                  Añadir al Pedido
                </button>
                <div className="bg-[#FFEB00] px-8 py-4 rounded-2xl flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-black uppercase tracking-widest">Paga en cuotas con</span>
                     <img src="https://i.postimg.cc/vZZr2Hv8/logocashea.jpg" alt="Cashea" className="h-6 w-auto mix-blend-multiply" />
                   </div>
                   <span className="text-black font-black text-sm uppercase">¡Disponible!</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
