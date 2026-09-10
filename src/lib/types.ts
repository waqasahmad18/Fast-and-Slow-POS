export type OrderType = "dine-in" | "takeaway" | "delivery";
export type OrderStatus = "open" | "paid" | "void";
export type PaymentMethod = "cash" | "card";

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  lowStockAt: number;
  active: boolean;
  image: string;
};

export type Table = {
  id: string;
  name: string;
  seats: number;
  status: "free" | "occupied";
};

export type OrderLine = {
  itemId: string;
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  billNo: string;
  type: OrderType;
  tableId: string | null;
  tableName: string | null;
  status: OrderStatus;
  lines: OrderLine[];
  note: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod | null;
  createdAt: string;
  paidAt: string | null;
};

export type StockMove = {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  reason: "sale" | "purchase" | "adjust" | "void";
  createdAt: string;
};

export type StoreData = {
  restaurantName: string;
  address: string;
  phone: string;
  taxRate: number;
  menu: MenuItem[];
  tables: Table[];
  orders: Order[];
  stockMoves: StockMove[];
};
