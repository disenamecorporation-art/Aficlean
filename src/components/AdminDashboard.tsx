import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Plus, Edit2, Trash2, Save, Image as ImageIcon, Loader2, 
  ShoppingCart, DollarSign, TrendingUp, UserCheck, CheckCircle, 
  Calendar, Briefcase
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category, Order } from '../types';

export const AdminDashboard = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'users'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'sales') fetchOrders();
      if (activeTab === 'users') fetchProfiles();
    }
  }, [isOpen, activeTab]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');
    
    if (!error) setProfiles(data || []);
  };

  const handleUpdateProfile = async (id: string, updates: any) => {
    setLoading(true);
    // Limpiar el nombre si el usuario le puso " Vendedor" manualmente
    if (updates.name) {
      updates.name = updates.name.replace(' Vendedor', '').trim();
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      let msg = error.message;
      if (error.code === '23514' || error.message.includes('profiles_role_check')) {
        msg = "ERROR DE BASE DE DATOS: Rol no permitido. Por favor, ejecuta el código SQL en Supabase para permitir los roles adecuados.";
      }
      setFeedback({ type: 'error', message: msg });
    } else {
      setFeedback({ type: 'success', message: 'Perfil actualizado correctamente' });
      fetchProfiles();
      setEditingProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

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

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (Array.isArray(data)) {
        const mappedOrders = data.map((o: any) => ({
          id: o.id,
          customerId: o.customer_id,
          customerName: o.customer_name,
          sellerId: o.seller_id,
          sellerName: o.seller_name,
          total: Number(o.total || 0),
          status: o.status,
          createdAt: o.created_at,
          commission: Number(o.commission || 0),
          sellerEarnings: Number(o.seller_earnings || 0),
          items: o.items || []
        }));
        setOrders(mappedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setLoading(true);
    try {
      // Use the commission rate set at the time of order creation (defaulting to 0.02 if not present)
      const commissionRate = order.commission || 0.02;
      const earnings = order.total * commissionRate;

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          seller_earnings: earnings
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        setFeedback({ type: 'error', message: `Error: ${error.message}` });
        return;
      }
      
      setFeedback({ type: 'success', message: '¡Pedido confirmado y comisión acreditada!' });
      fetchOrders();
    } catch (err: any) {
      console.error('Error handleConfirmOrder:', err);
      setFeedback({ type: 'error', message: 'Error al confirmar el pedido' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setLoading(true);
    setFeedback(null);

    const price = Number(editingProduct.price || 0);
    const stock = Number(editingProduct.stock || 0);
    const wholesalePrice = editingProduct.wholesalePrice ? Number(editingProduct.wholesalePrice) : null;

    const pData: any = {
      name: editingProduct.name?.trim(),
      description: editingProduct.description?.trim(),
      price: price,
      wholesale_price: wholesalePrice,
      category: editingProduct.category,
      image: editingProduct.image?.trim(),
      stock: stock
    };

    if (!pData.name || !pData.description || !pData.image) {
      setFeedback({ type: 'error', message: 'Por favor completa todos los campos obligatorios' });
      setLoading(false);
      return;
    }

    try {
      console.log('Tentando salvar producto:', pData);

      if (editingProduct.id) {
        // UPDATE
        const { error } = await supabase
          .from('products')
          .update(pData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Producto actualizado con éxito' });
      } else {
        // INSERT
        const { error } = await supabase
          .from('products')
          .insert([pData]);
        
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Producto añadido con éxito' });
      }
      
      // Limpiar y refrescar
      setTimeout(() => {
        setEditingProduct(null);
        fetchProducts();
      }, 1500);

    } catch (err: any) {
      console.error('Error saving product:', err);
      let errorMsg = err.message || 'Error al guardar el producto';
      
      if (err.code === '42501') {
        errorMsg = 'Error 42501: Permiso denegado en la base de datos. Tu usuario no tiene rol de "admin" en Supabase. Por favor, ejecuta el comando SQL en tu panel de Supabase o contacta al desarrollador.';
      }
      
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (!error) fetchProducts();
    else console.error('Error deleting product:', error);
  };

  const categories: Category[] = [
    "Detergentes",
    "Papel Higiénico",
    "Utensilios de Limpieza",
    "Bolsas para Basura",
    "Cuidado Personal",
    "Envases Plásticos"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-x-0 bottom-0 top-10 bg-clean-bg z-[301] border-t border-slate-200 rounded-t-[3rem] overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Panel de Control</h2>
                <p className="text-slate-500">Gestiona productos y comisiones de Afi Clean</p>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Briefcase className="w-4 h-4" /> Productos
                </button>
                <button 
                  onClick={() => setActiveTab('sales')}
                  className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${activeTab === 'sales' ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <TrendingUp className="w-4 h-4" /> Ventas y Comisiones
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <UserCheck className="w-4 h-4" /> Usuarios
                </button>
              </div>

              <div className="flex gap-4">
                {activeTab === 'products' ? (
                  <button 
                    onClick={() => {
                      setFeedback(null);
                      setEditingProduct({ name: '', price: 0, description: '', category: 'Detergentes', image: '', stock: 0 });
                    }}
                    className="premium-btn bg-primary-green text-white flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Nuevo Producto
                  </button>
                ) : (
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                    <Calendar className="w-4 h-4" /> Mes Actual: {new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date())}
                  </div>
                )}
                <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto space-y-8">
                {activeTab === 'users' && (
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50">
                       <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-primary-green" /> Gestión de Usuarios y Vendedores
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recomendado por</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {profiles.map((profile) => (
                            <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-6 font-bold text-slate-800">{profile.name || 'Sin nombre'}</td>
                              <td className="px-8 py-6 text-sm text-slate-500">{profile.email}</td>
                              <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  profile.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                                  profile.role === 'wholesale' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {profile.role === 'admin' ? 'Admin' : (profile.role === 'wholesale' ? 'Mayorista' : 'Cliente')}
                                </span>
                              </td>
                              <td className="px-8 py-6 font-medium text-amber-600">
                                {profile.referral_code || '—'}
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button 
                                  onClick={() => setEditingProfile(profile)}
                                  className="text-primary-green font-black text-[10px] uppercase tracking-widest hover:underline"
                                >
                                  Editar Perfil
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'sales' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Ventas</p>
                          <p className="text-3xl font-black text-slate-800 leading-none mt-1">
                            ${orders
                              .filter(o => o.status === 'completed')
                              .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
                              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                          <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comisiones (2%)</p>
                          <p className="text-3xl font-black text-slate-800 leading-none mt-1">
                            ${orders
                              .filter(o => o.status === 'completed')
                              .reduce((sum, o) => sum + (Number(o.sellerEarnings) || 0), 0)
                              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                          <UserCheck className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendedor Estrella</p>
                          <p className="text-xl font-black text-slate-800 leading-none mt-1 truncate max-w-[150px]">
                            {orders.length > 0 ? (
                              Object.entries(orders.reduce((acc: any, o) => {
                                acc[o.customerName] = (acc[o.customerName] || 0) + 1;
                                return acc;
                              }, {})).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '—'
                            ) : "Sin ventas"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-primary-green" /> Listado de Ventas
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pedido</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendedor</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Total</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Comisión (2%)</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {orders.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                                  No hay ventas registradas en este periodo.
                                </td>
                              </tr>
                            ) : (
                              orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-8 py-6 font-mono text-xs text-slate-400">{order.id}</td>
                                  <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-800">{order.customerName}</span>
                                      <span className="text-[10px] text-slate-400">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-8 py-6">
                                    <span className="font-medium text-slate-600">{order.sellerName || 'Venta Directa'}</span>
                                  </td>
                                  <td className="px-8 py-6 font-black text-slate-800">${order.total.toFixed(2)}</td>
                                  <td className="px-8 py-6 text-emerald-600 font-black">
                                    ${order.sellerEarnings ? order.sellerEarnings.toFixed(2) : (order.total * 0.02).toFixed(2)}
                                  </td>
                                  <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'
                                    }`}>
                                      {order.status === 'completed' ? 'Completado' : 'Pendiente'}
                                    </span>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                    {order.status === 'pending' && (
                                      <button 
                                        onClick={() => handleConfirmOrder(order.id)}
                                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-green transition-all"
                                      >
                                        <CheckCircle className="w-3 h-3" /> Confirmar Pago
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'products' && (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:shadow-lg transition-all">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                          <img src={product.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate">{product.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                              {product.category}
                            </span>
                            <span className="text-primary-green font-bold text-sm">Reg: ${product.price.toFixed(2)}</span>
                            {product.wholesalePrice && (
                              <span className="text-primary-yellow bg-slate-900 px-2 py-0.5 rounded-md font-bold text-xs">
                                May: ${product.wholesalePrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            setFeedback(null);
                            setEditingProduct(product);
                          }} className="p-2 text-slate-400 hover:text-primary-green transition-colors">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-primary-red transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {editingProfile && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[302] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-slate-800">Gestionar Perfil</h3>
                      <button onClick={() => setEditingProfile(null)}><X className="w-6 h-6 text-slate-400" /></button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Rol del Usuario</label>
                        <select 
                          value={editingProfile.role}
                          onChange={(e) => setEditingProfile({...editingProfile, role: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green"
                        >
                          <option value="user">Usuario / Cliente</option>
                          <option value="wholesale">Mayorista</option>
                          <option value="seller">Vendedor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Referido por (Nombre)</label>
                        <input 
                          type="text"
                          placeholder="Nombre del Vendedor"
                          value={editingProfile.referral_code || ''}
                          onChange={(e) => setEditingProfile({...editingProfile, referral_code: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green font-bold"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => handleUpdateProfile(editingProfile.id, { 
                        role: editingProfile.role, 
                        referral_code: editingProfile.referral_code || null 
                      })}
                      disabled={loading}
                      className="w-full premium-btn bg-primary-green text-white h-14 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                      Guardar Cambios
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {editingProduct && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[302] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                  >
                    <form onSubmit={handleSave} className="p-8 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-slate-800">{editingProduct.id ? 'Editar Producto' : 'Añadir Producto'}</h3>
                        <button type="button" onClick={() => setEditingProduct(null)}><X className="w-6 h-6 text-slate-400" /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-bold text-slate-400 uppercase">Nombre del Producto</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green"
                            value={editingProduct.name || ''}
                            onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-400 uppercase">Precio Normal ($)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green"
                            value={editingProduct.price !== undefined && editingProduct.price !== null ? editingProduct.price : ''}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              setEditingProduct({...editingProduct, price: isNaN(val) ? 0 : val});
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-primary-yellow uppercase flex items-center gap-2">
                            Precio Mayorista ($)
                          </label>
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-yellow"
                            value={editingProduct.wholesalePrice !== undefined && editingProduct.wholesalePrice !== null ? editingProduct.wholesalePrice : ''}
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              setEditingProduct({...editingProduct, wholesalePrice: isNaN(val) ? undefined : val});
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-400 uppercase">Categoría</label>
                          <select 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green"
                            value={editingProduct.category || 'Detergentes'}
                            onChange={e => setEditingProduct({...editingProduct, category: e.target.value as Category})}
                          >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-400 uppercase">Stock Disponible</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green"
                            value={editingProduct.stock !== undefined && editingProduct.stock !== null ? editingProduct.stock : ''}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              setEditingProduct({...editingProduct, stock: isNaN(val) ? 0 : val});
                            }}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-bold text-slate-400 uppercase">URL de la Imagen</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green"
                            value={editingProduct.image || ''}
                            onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm font-bold text-slate-400 uppercase">Descripción</label>
                          <textarea 
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary-green resize-none"
                            value={editingProduct.description || ''}
                            onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                          />
                        </div>
                      </div>

                      {feedback && (
                        <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          {feedback.message}
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full premium-btn bg-primary-green text-white shadow-lg shadow-green-200 flex items-center justify-center gap-2 h-14"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
