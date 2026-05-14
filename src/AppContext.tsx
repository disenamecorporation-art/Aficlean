import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem, Product, Category } from './types';
import { supabase } from './lib/supabase';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  formatPrice: (usd: number) => { usd: string; vef: string };
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  view: 'home' | 'store';
  setView: (view: 'home' | 'store') => void;
  storeCategory: Category | 'All';
  setStoreCategory: (cat: Category | 'All') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(45.45);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'home' | 'store'>('home');
  const [storeCategory, setStoreCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    // Supabase Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name || session.user.email?.split('@')[0] || 'Usuario',
            role: profile.role as any,
            phone: profile.phone,
            address: profile.address,
            taxId: profile.tax_id
          });
        }
      } else {
        setUser(null);
      }
    });

    // Fetch real-time BCV rate
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      .then(res => res.json())
      .then(data => {
        if (data && data.promedio) {
          setExchangeRate(data.promedio);
        }
      })
      .catch((err) => console.error('Error fetching BCV rate:', err));

    return () => subscription.unsubscribe();
  }, []);

  const formatPrice = (usd: number) => {
    const vef = usd * exchangeRate;
    return {
      usd: `$${usd.toFixed(2)}`,
      vef: `Bs. ${vef.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AppContext.Provider value={{ 
      user, 
      setUser, 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      total,
      exchangeRate,
      setExchangeRate,
      formatPrice,
      selectedProduct,
      setSelectedProduct,
      view,
      setView,
      storeCategory,
      setStoreCategory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
