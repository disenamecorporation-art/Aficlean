import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { user, formatPrice } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders where user is customer OR seller
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`customer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalSpent: orders
      .filter(o => o.customerId === user?.id)
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0),
    totalEarnings: orders
      .filter(o => o.sellerId === user?.id && o.status === 'completed')
      .reduce((acc, o) => acc + (Number(o.sellerEarnings) || 0), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-50';
      case 'pending': return 'text-orange-500 bg-orange-50';
      case 'cancelled': return 'text-red-500 bg-red-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen pt-24 px-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Mi Panel</h1>
            <p className="text-slate-500 font-medium font-mono text-sm tracking-widest">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 px-4 py-2 bg-primary-green/10 text-primary-green rounded-xl">
               <Calendar className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-widest">
                 {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
               </span>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-green/10 flex items-center justify-center text-primary-green">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pedidos</p>
              <p className="text-3xl font-black text-slate-800">{stats.totalOrders}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-yellow/10 flex items-center justify-center text-primary-yellow">
                <DollarSign className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compras Totales</p>
              <p className="text-xl font-black text-slate-800 leading-tight">
                {formatPrice(stats.totalSpent).usd}
                <br />
                <span className="text-xs text-slate-400 font-medium font-mono">{formatPrice(stats.totalSpent).vef}</span>
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-red/10 flex items-center justify-center text-primary-red">
                <TrendingUp className="w-6 h-6" />
              </div>
              <CheckCircle2 className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ganancias Ventas</p>
              <p className="text-xl font-black text-slate-800 leading-tight">
                {formatPrice(stats.totalEarnings).usd}
                <br />
                <span className="text-xs text-slate-400 font-medium font-mono">{formatPrice(stats.totalEarnings).vef}</span>
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ratio de Éxito</p>
              <p className="text-3xl font-black text-slate-800">{stats.completedOrders} <span className="text-sm text-slate-400">Finalizados</span></p>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Pedidos Recientes</h2>
            <button className="text-xs font-bold text-primary-green uppercase tracking-widest hover:underline">Ver Todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pedido</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium">No se encontraron pedidos.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6 font-mono text-xs font-bold text-slate-400">#{order.id.slice(0, 8)}</td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${order.sellerId === user?.id ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-500'}`}>
                          {order.sellerId === user?.id ? 'Vendedor' : 'Comprador'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{formatPrice(order.total).usd}</span>
                          <span className="text-[10px] font-mono text-slate-400">{formatPrice(order.total).vef}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-100 transition-all">
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
