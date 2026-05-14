import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const slides = [
  {
    image: "https://i.postimg.cc/PrMdSd68/1banner-afi.jpg",
    title: "AFI CLEAN",
    subtitle: "SOLUCIONES PREMIUM",
    description: "La mejor selección de productos de limpieza para tu hogar y empresa con despacho inmediato."
  },
  {
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=2000",
    title: "ESPACIOS BRILLANTES",
    subtitle: "ALTA GAMA",
    description: "Cuidamos cada rincón con fórmulas avanzadas que garantizan higiene y frescura total."
  }
];

export const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[85vh] overflow-hidden bg-slate-900 mt-[120px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img 
            src={slides[current].image} 
            alt={slides[current].title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 shadow-inner" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl space-y-6"
            >
              <span className="bg-primary-red text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] w-fit rounded-sm">
                {slides[current].subtitle}
              </span>
              
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                {slides[current].title.split(' ')[0]} <br />
                <span className="text-primary-yellow">{slides[current].title.split(' ').slice(1).join(' ')}</span>
              </h1>
              
              <p className="text-lg text-white/80 max-w-md leading-relaxed font-medium">
                {slides[current].description}
              </p>

              <div className="flex flex-wrap gap-4 pt-6">
                <a href="#productos" className="premium-btn bg-white text-primary-green hover:scale-105 shadow-2xl">
                  Comprar Ahora
                </a>
                <a href="#productos" className="premium-btn border-2 border-white text-white backdrop-blur-sm hover:bg-white/10">
                  Ver Catálogo
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 right-10 z-20 flex gap-4">
        <button onClick={prevSlide} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

    </section>
  );
};
