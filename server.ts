import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";

// Hardcoded secret for demo - in production use env var
const JWT_SECRET = process.env.JWT_SECRET || "alisop-clean-secret-key-2024";
const DB_PATH = path.join(process.cwd(), "db.json");

async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialData = {
      users: [
        {
          id: "admin-1",
          email: "admin@aficlean.ve",
          password: await bcrypt.hash("admin123", 10),
          role: "admin",
          name: "Admin Afi Clean"
        }
      ],
      products: [
        {
          id: "1",
          name: "Detergente Premium Blue",
          description: "Detergente líquido de alta concentración para ropa blanca y de color.",
          price: 15.50,
          wholesalePrice: 12.50,
          category: "Detergentes",
          image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
          stock: 50
        }
      ],
      orders: []
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

async function getDB() {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

async function saveDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token provided" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    next();
  };

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name, role, phone, address, taxId } = req.body;
    const db = await getDB();
    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
      id: Date.now().toString(), 
      email, 
      password: hashedPassword, 
      name, 
      role: role || "user",
      phone,
      address,
      taxId
    };
    db.users.push(newUser);
    await saveDB(db);
    res.json({ message: "Usuario registrado con éxito" });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const db = await getDB();
    const user = db.users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      phone: user.phone,
      address: user.address,
      taxId: user.taxId
    }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, maxAge: 86400000 });
    res.json({ user: { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      phone: user.phone,
      address: user.address,
      taxId: user.taxId
    } });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticate, (req: any, res: any) => {
    res.json({ user: req.user });
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    const db = await getDB();
    res.json(db.products);
  });

  app.post("/api/products", authenticate, isAdmin, async (req: any, res: any) => {
    const db = await getDB();
    const newProduct = { ...req.body, id: Date.now().toString() };
    db.products.push(newProduct);
    await saveDB(db);
    res.json(newProduct);
  });

  app.put("/api/products/:id", authenticate, isAdmin, async (req: any, res: any) => {
    const { id } = req.params;
    const db = await getDB();
    const index = db.products.findIndex((p: any) => p.id === id);
    if (index === -1) return res.status(404).json({ message: "Product not found" });
    db.products[index] = { ...db.products[index], ...req.body };
    await saveDB(db);
    res.json(db.products[index]);
  });

  app.delete("/api/products/:id", authenticate, isAdmin, async (req: any, res: any) => {
    const { id } = req.params;
    const db = await getDB();
    db.products = db.products.filter((p: any) => p.id !== id);
    await saveDB(db);
    res.json({ message: "Product deleted" });
  });

  // Orders API
  app.post("/api/orders", authenticate, async (req: any, res: any) => {
    const db = await getDB();
    const { items, total, sellerId, sellerName } = req.body;
    
    const newOrder = {
      id: "ORD-" + Date.now(),
      customerId: req.user.id,
      customerName: req.user.name,
      sellerId: sellerId || null,
      sellerName: sellerName || null,
      items,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
      commission: 0.02,
      sellerEarnings: 0
    };

    db.orders.push(newOrder);
    await saveDB(db);
    res.json(newOrder);
  });

  app.get("/api/orders", authenticate, isAdmin, async (req: any, res: any) => {
    const db = await getDB();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter by current month as requested
    const filteredOrders = db.orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    res.json(filteredOrders);
  });

  app.post("/api/orders/:id/confirm", authenticate, isAdmin, async (req: any, res: any) => {
    const { id } = req.params;
    const db = await getDB();
    const index = db.orders.findIndex((o: any) => o.id === id);

    if (index === -1) return res.status(404).json({ message: "Order not found" });

    // Update status to completed
    db.orders[index].status = "completed";
    
    // Calculate commission (2% as requested)
    const commissionRate = 0.02;
    db.orders[index].sellerEarnings = db.orders[index].total * commissionRate;

    await saveDB(db);
    res.json(db.orders[index]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
