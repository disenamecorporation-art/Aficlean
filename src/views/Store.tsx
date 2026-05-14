import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Package, Droplets, ScrollText, Eraser as Brush, Trash2, Sparkles, ChevronRight, LayoutGrid, List as ListIcon, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { useAppContext } from '../AppContext';

const categoryMap: { name: Category; icon: any }[] = [
  { name: 'Detergentes', icon: Droplets },
  { name: 'Papel Higiénico', icon: ScrollText },
  { name: 'Utensilios de Limpieza', icon: Brush },
  { name: 'Bolsas para Basura', icon: Trash2 },
  { name: 'Cuidado Personal', icon: Sparkles },
  { name: 'Envases Plásticos', icon: Package },
];

import { supabase } from '../lib/supabase';

export const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { storeCategory, setStoreCategory, setView } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchStoreProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching store products:', error);
        return;
      }

      setProducts(data.map((p: any) => ({
        ...p,
        wholesalePrice: p.wholesale_price
      })));
    };

    fetchStoreProducts();
  }, []);

  const filteredProducts = products
    .filter(p => storeCategory === 'All' || p.category === storeCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="pt-[120px] min-h-screen bg-slate-50 flex flex-col">
      {/* Header / Breadcrumbs */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            <button onClick={() => setView('home')} className="hover:text-primary-green transition-colors">Inicio</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary-green">Tienda Afi Clean</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                Tienda
              </h1>
              <p className="text-slate-500 font-medium mt-4 max-w-md">
                Explora nuestra selección exclusiva de productos de limpieza de alta gama para hogares y empresas.
              </p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="BUSCAR EN TIENDA..."
                    className="pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:shadow-xl focus:border-primary-green transition-all outline-none font-black text-xs uppercase tracking-widest"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0 space-y-12">
          {/* Categories Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Categorías</h3>
              <div className="w-8 h-[1px] bg-slate-200" />
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setStoreCategory('All')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${storeCategory === 'All' ? 'bg-primary-green text-white shadow-xl shadow-green-100' : 'bg-white hover:bg-slate-100 text-slate-600'}`}
              >
                <div className="flex items-center gap-3">
                  <Package className={`w-5 h-5 ${storeCategory === 'All' ? 'text-white' : 'text-slate-400 group-hover:text-primary-green'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Todos</span>
                </div>
                <span className={`text-[10px] font-black ${storeCategory === 'All' ? 'text-white/50' : 'text-slate-300'}`}>
                  {products.length}
                </span>
              </button>
              {categoryMap.map(cat => (
                <button 
                  key={cat.name}
                  onClick={() => setStoreCategory(cat.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${storeCategory === cat.name ? 'bg-primary-green text-white shadow-xl shadow-green-100' : 'bg-white hover:bg-slate-100 text-slate-600'}`}
                >
                  <div className="flex items-center gap-3">
                    <cat.icon className={`w-5 h-5 ${storeCategory === cat.name ? 'text-white' : 'text-slate-400 group-hover:text-primary-green'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                  </div>
                  <span className={`text-[10px] font-black ${storeCategory === cat.name ? 'text-white/50' : 'text-slate-300'}`}>
                    {products.filter(p => p.category === cat.name).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Ordenar Por</h3>
              <div className="w-8 h-[1px] bg-slate-200" />
            </div>
            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
              <button 
                onClick={() => setSortBy('name')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${sortBy === 'name' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-500'}`}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Nombre (A-Z)</span>
              </button>
              <button 
                onClick={() => setSortBy('price-asc')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${sortBy === 'price-asc' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-500'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Precio: Bajo a Alto</span>
              </button>
              <button 
                onClick={() => setSortBy('price-desc')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${sortBy === 'price-desc' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-500'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Precio: Alto a Bajo</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Mostrando <span className="text-slate-900">{filteredProducts.length}</span> Productos
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-slate-900 text-white rounded-lg">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="p-2 border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50">
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">No se encontraron productos</h3>
              <p className="text-slate-400 font-medium max-w-xs">
                Intenta ajustar tu búsqueda o filtros para encontrar lo que necesitas.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setStoreCategory('All'); }}
                className="mt-8 text-xs font-black text-primary-green hover:underline uppercase tracking-widest"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
