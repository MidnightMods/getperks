import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-status" element={<OrderStatus />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
