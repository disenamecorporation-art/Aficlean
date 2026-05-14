import React from 'react';
import { motion } from 'motion/react';

const brands = [
  "https://i.postimg.cc/TPXRYhHm/ACE.png",
  "https://i.postimg.cc/k5dnXDhb/AJAX.png",
  "https://i.postimg.cc/wBd6T3bD/ALIVE.jpg",
  "https://i.postimg.cc/ZqhTK0D8/ARIEL.png",
  "https://i.postimg.cc/JhW14td3/AXION.jpg",
  "https://i.postimg.cc/Xv0V7XDc/BAYGON.jpg",
  "https://i.postimg.cc/PqktrNFQ/FABULOSO.jpg",
  "https://i.postimg.cc/0Nq82rHf/LAS-LLAVE.jpg",
  "https://i.postimg.cc/rpL8FzY0/PALMA-REAL.jpg",
  "https://i.postimg.cc/cJMdKZVt/PAVECA.png",
  "https://i.postimg.cc/fbhwTkgd/SARINA.jpg",
  "https://i.postimg.cc/QMkjBsRW/VENSOL.png"
];

export const BrandSlider = () => {
  return (
    <section className="py-12 bg-white border-y border-slate-100 overflow-hidden flex items-center shrink-0">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {[...brands, ...brands].map((logo, idx) => (
          <div key={idx} className="mx-12 flex items-center justify-center min-w-[150px] h-[150px]">
            <img 
              src={logo} 
              alt="Brand Logo" 
              className="max-w-[150px] max-h-[150px] w-auto h-auto object-contain grayscale hover:grayscale-0 transition-all duration-500" 
            />
          </div>
        ))}
      </div>
    </section>
  );
};
