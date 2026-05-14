import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Plus } from 'lucide-react';
import { Product } from '../types';
import { useAppContext } from '../AppContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, formatPrice, setSelectedProduct, user } = useAppContext();
  const prices = formatPrice(product.price);
  const isWholesale = user?.role === 'wholesale';
  const wholesalePrices = product.wholesalePrice ? formatPrice(product.wholesalePrice) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 card-hover cursor-pointer"
      onClick={(e) => {
        // Only open detail if we didn't click the "Add to Cart" button
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          setSelectedProduct(product);
        }
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-primary-red text-white px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest">
            {product.category}
          </span>
        </div>
        {isWholesale && wholesalePrices && (
          <div className="absolute top-4 right-4 animate-bounce">
            <span className="bg-primary-yellow text-slate-900 px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg">
              Precio Mayorista
            </span>
          </div>
        )}
        <button 
          onClick={() => addToCart(product)}
          className="absolute bottom-4 right-4 bg-primary-green text-white p-3 rounded-xl shadow-lg shadow-green-200 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-5 space-y-2">
        <h3 className="text-2xl font-black text-slate-900 line-clamp-1 uppercase tracking-tighter leading-none mb-1">{product.name}</h3>
        <p className="text-slate-500 text-xs line-clamp-2 h-8 leading-relaxed">{product.description}</p>
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className={`font-black ${isWholesale && wholesalePrices ? 'text-2xl text-slate-400 line-through' : 'text-4xl text-primary-green'}`}>
                {prices.usd}
              </span>
              {isWholesale && wholesalePrices && (
                <span className="text-3xl font-black text-primary-yellow leading-none">
                  {wholesalePrices.usd}
                </span>
              )}
            </div>
            <button 
              onClick={() => addToCart(product)}
              className="flex items-center gap-1 text-[10px] font-black text-primary-red hover:underline uppercase tracking-tighter"
            >
              Añadir Pedido
            </button>
          </div>
          <p className="text-xs font-black text-slate-400 mt-1 uppercase tracking-widest">
            {isWholesale && wholesalePrices ? wholesalePrices.vef : prices.vef}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
