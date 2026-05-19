export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice?: number;
  category: Category;
  image: string;
  stock: number;
}

export type Category = 
  | "Detergentes"
  | "Papel Higiénico"
  | "Utensilios de Limpieza"
  | "Bolsas para Basura"
  | "Cuidado Personal"
  | "Envases Plásticos";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "wholesale";
  phone?: string;
  address?: string;
  taxId?: string; // RIF in Venezuela
  referralCode?: string;
  referredBy?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  sellerId?: string;
  sellerName?: string;
  items: CartItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  commission: number;
  sellerEarnings: number;
}

export interface CartItem extends Product {
  quantity: number;
}
