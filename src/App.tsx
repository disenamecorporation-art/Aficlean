import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { BrandSlider } from './components/BrandSlider';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { UserProfile } from './components/UserProfile';
import { Store } from './views/Store';
import { supabase } from './lib/supabase';
import { Product, Category } from './types';
import { motion } from 'motion/react';
import { Sparkles, Trash2, Edit2, Search, Filter, Droplets, ScrollText, Eraser as Brush, Package, Loader2 } from 'lucide-react';

const categoryMap: { name: Category; icon: any }[] = [
  { name: 'Detergentes', icon: Droplets },
  { name: 'Papel Higiénico', icon: ScrollText },
  { name: 'Utensilios de Limpieza', icon: Brush },
  { name: 'Bolsas para Basura', icon: Trash2 },
  { name: 'Cuidado Personal', icon: Sparkles },
  { name: 'Envases Plásticos', icon: Package },
];

function MainContent() {
  const { view, setView, storeCategory, setStoreCategory, isInitialized } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [isAdminOpen]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    const mappedProducts = data.map((p: any) => ({
      ...p,
      wholesalePrice: p.wholesale_price
    }));

    setProducts(mappedProducts);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = storeCategory === 'All' || p.category === storeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <img src="https://i.postimg.cc/0NvYq3b2/LOGOOFICIALWEB.png" alt="Logo" className="h-16 w-auto animate-pulse" />
          <Loader2 className="w-8 h-8 text-primary-green animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
      
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <Hero />

            {/* Categories Section */}
            <section id="categorias" className="py-20 max-w-7xl mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                  <span className="bg-primary-red text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] w-fit rounded-sm mb-4 block">
                    Nuestras Líneas
                  </span>
                  <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Productos Destacados</h2>
                </div>
                
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="BUSCAR PRODUCTO..."
                    className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl w-full md:w-80 shadow-sm focus:shadow-xl focus:border-primary-green transition-all outline-none font-bold text-xs uppercase tracking-widest"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Promotion Banners Small */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="h-48 rounded-[2rem] bg-primary-green overflow-hidden relative group cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=800" alt="Promo" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-center">
                    <p className="text-primary-yellow font-black text-xs uppercase tracking-widest mb-1">Oferta Especial</p>
                    <h4 className="text-2xl font-black text-white uppercase leading-tight">20% OFF <br />DETERGENTES</h4>
                  </div>
                </div>
                <div className="h-48 rounded-[2rem] bg-[#FFEB00] overflow-hidden relative group cursor-pointer flex flex-col items-center justify-center p-8">
                  <img src="https://i.postimg.cc/vZZr2Hv8/logocashea.jpg" alt="Cashea" className="h-20 w-auto mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  <div className="mt-2 text-center">
                    <p className="text-black font-black text-[10px] uppercase tracking-[0.2em]">Paga en cuotas</p>
                  </div>
                </div>
                <div className="h-48 rounded-[2rem] bg-slate-900 overflow-hidden relative group cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=800" alt="Promo" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-center">
                    <p className="text-primary-yellow font-black text-xs uppercase tracking-widest mb-1">Nuevo Ingreso</p>
                    <h4 className="text-2xl font-black text-white uppercase leading-tight">FRAGANCIAS <br />PREMIUM</h4>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-20">
                <button 
                  onClick={() => {
                    setStoreCategory('All');
                    setView('store');
                    window.scrollTo(0, 0);
                  }}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all group ${storeCategory === 'All' ? 'bg-primary-green border-primary-green text-white shadow-xl shadow-green-100' : 'bg-white border-slate-100 text-slate-400 hover:border-primary-green hover:text-primary-green'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${storeCategory === 'All' ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-primary-green/10'}`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <span className="font-black text-[10px] uppercase tracking-widest text-center">Todos</span>
                </button>

                {categoryMap.map((cat) => (
                  <button 
                    key={cat.name}
                    onClick={() => {
                      setStoreCategory(cat.name);
                      setView('store');
                      window.scrollTo(0, 0);
                    }}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all group ${storeCategory === cat.name ? 'bg-primary-green border-primary-green text-white shadow-xl shadow-green-100' : 'bg-white border-slate-100 text-slate-400 hover:border-primary-green hover:text-primary-green'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${storeCategory === cat.name ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-primary-green/10'}`}>
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest text-center">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div id="productos" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 mt-8">
                  <p className="text-slate-400 font-medium">No encontramos productos que coincidan con tu búsqueda.</p>
                </div>
              )}
            </section>

            <section className="py-12 max-w-7xl mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full rounded-[3rem] overflow-hidden relative shadow-2xl"
              >
                <img 
                  src="https://i.postimg.cc/MKPMT0yf/IMAGEN-BOLSAS-Y-DESCARTABLES.png" 
                  alt="Bolsas y Descartables" 
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors duration-500" />
              </motion.div>
            </section>
            
            {/* About Section */}
            <section id="nosotros" className="py-20 bg-slate-50">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                <div className="relative">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="aspect-square rounded-[3rem] overflow-hidden rotate-3 shadow-2xl relative z-10"
                  >
                    <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200" alt="About Afi Clean" className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="absolute top-10 left-10 w-full h-full bg-primary-yellow/20 rounded-[3rem] -rotate-6" />
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-slate-800 leading-tight">Expertos en Higiene de <br /><span className="text-primary-green italic serif">Alta Gama</span></h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      En Afi Clean nos comprometemos con la excelencia. Seleccionamos los mejores ingredientes y materiales para garantizar que tu espacio no solo esté limpio, sino que brille con distinción.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <span className="text-3xl font-bold text-primary-red">+100</span>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Productos</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-3xl font-bold text-primary-yellow">100%</span>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Satisfacción</p>
                    </div>
                  </div>

                  <button className="premium-btn bg-slate-900 text-white hover:bg-black">
                    Nuestra Historia
                  </button>
                </div>
              </div>
            </section>

            <BrandSlider />
          </>
        )}
        {view === 'store' && <Store />}
        {view === 'dashboard' && <UserDashboard />}
        {view === 'profile' && <UserProfile />}
      </main>

      <Footer />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      <ProductDetail />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
