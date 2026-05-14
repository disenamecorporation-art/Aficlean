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
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_EMAILS = ['corplegaint5@gmail.com', 'disenamecorporation@gmail.com'];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(45.45);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'home' | 'store'>('home');
  const [storeCategory, setStoreCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    // Immediate initialization fallback
    const safetyTimeout = setTimeout(() => {
      setIsInitialized(true);
    }, 10000);

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isHardcodedAdmin = session.user.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());
          // Initialize with basic info first
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario',
            role: isHardcodedAdmin ? 'admin' : 'user'
          });
          // Then fetch full profile in background
          fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsInitialized(true);
        clearTimeout(safetyTimeout);
      }
    };

    const fetchUserProfile = async (supabaseUser: any) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name || supabaseUser.email?.split('@')[0] || 'Usuario',
            role: (ADMIN_EMAILS.includes(profile.email.toLowerCase()) ? 'admin' : profile.role) as any,
            phone: profile.phone,
            address: profile.address,
            taxId: profile.tax_id
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    initializeAuth();

    // Supabase Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const isHardcodedAdmin = session.user.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());
        // Basic update
        if (event === 'SIGNED_IN') {
           setUser(prev => prev || {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario',
            role: isHardcodedAdmin ? 'admin' : 'user'
          });
          fetchUserProfile(session.user);
        }
      } else {
        setUser(null);
      }
      setIsInitialized(true);
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
      setStoreCategory,
      isInitialized
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
