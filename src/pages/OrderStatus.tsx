import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Shield,
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronLeft,
  Truck,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function OrderStatus() {
  const location = useLocation();
  const initialOrderNumber = (location.state as { orderNumber?: string })?.orderNumber || "";

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [searchInput, setSearchInput] = useState(initialOrderNumber);

  const { data: order, isLoading } = trpc.order.getByNumber.useQuery(
    { orderNumber },
    { enabled: orderNumber.length > 0, retry: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderNumber(searchInput.trim());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-green-400" />;
      case "processing":
        return <RefreshCw className="w-6 h-6 text-blue-400" />;
      case "pending":
        return <Clock className="w-6 h-6 text-amber-400" />;
      case "cancelled":
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Package className="w-6 h-6 text-white/40" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "processing":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "pending":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "cancelled":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-white/40 bg-white/5 border-white/10";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "failed":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "refunded":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0010] text-white flex flex-col">
      <div className="absolute inset-0 bg-hero" />

      <div className="relative z-10 flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold heading-italic gradient-text">Perks</span>
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-sm text-white/60">Track Order</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="glass-card rounded-xl p-1 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-white/30" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter order number..."
                className="flex-1 bg-transparent border-none text-white placeholder:text-white/30 focus:outline-none py-3"
              />
            </div>
            <Button
              type="submit"
              disabled={!searchInput.trim() || isLoading}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Track"}
            </Button>
          </div>
        </form>

        {/* Results */}
        {orderNumber && !isLoading && (
          <div className="animate-fade-in-up">
            {!order ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Order Not Found</h3>
                <p className="text-white/40 text-sm">
                  We could not find an order with number <span className="text-white/60 font-mono">{orderNumber}</span>.
                </p>
                <p className="text-white/30 text-xs mt-2">
                  Double-check the order number and try again.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Order Header */}
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${getStatusColor(order.orderStatus || "pending")}`}>
                    {getStatusIcon(order.orderStatus || "pending")}
                    <span className="text-sm font-medium capitalize">{order.orderStatus}</span>
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-white mb-1">{order.orderNumber}</h3>
                  <p className="text-white/40 text-sm">
                    Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>

                {/* Product Info */}
                <div className="glass-card rounded-xl p-6">
                  <h4 className="text-sm text-white/40 mb-3">Product</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">{order.productName}</p>
                      <p className="text-white/40 text-sm capitalize">{order.productCategory}</p>
                    </div>
                    <span className="text-xl font-bold gradient-text">${order.totalAmount}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="glass-card rounded-xl p-6">
                  <h4 className="text-sm text-white/40 mb-3">Payment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Method</span>
                      <span className="text-white capitalize">{order.paymentMethod?.replace("crypto_", "")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPaymentStatusColor(order.paymentStatus || "pending")}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    {order.transactionId && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Transaction ID</span>
                        <span className="text-white font-mono text-xs">{order.transactionId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="glass-card rounded-xl p-6">
                  <h4 className="text-sm text-white/40 mb-3">Customer</h4>
                  <div className="space-y-2">
                    {order.customerName && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Name</span>
                        <span className="text-white">{order.customerName}</span>
                      </div>
                    )}
                    {order.customerEmail && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Email</span>
                        <span className="text-white">{order.customerEmail}</span>
                      </div>
                    )}
                    {order.customerDiscord && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Discord</span>
                        <span className="text-white">{order.customerDiscord}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="glass-card rounded-xl p-6">
                  <h4 className="text-sm text-white/40 mb-4">Order Progress</h4>
                  <div className="space-y-4">
                    {[
                      { label: "Order Placed", status: "completed", icon: <Package className="w-4 h-4" /> },
                      { label: "Payment Received", status: order.paymentStatus === "completed" ? "completed" : "pending", icon: <CheckCircle2 className="w-4 h-4" /> },
                      { label: "Processing", status: order.orderStatus === "processing" || order.orderStatus === "completed" ? "completed" : "pending", icon: <RefreshCw className="w-4 h-4" /> },
                      { label: "Delivered", status: order.orderStatus === "completed" ? "completed" : "pending", icon: <Truck className="w-4 h-4" /> },
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/5 text-white/30"
                        }`}>
                          {step.icon}
                        </div>
                        <span className={`text-sm ${step.status === "completed" ? "text-white" : "text-white/40"}`}>
                          {step.label}
                        </span>
                        {step.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support */}
                <div className="text-center pt-4 pb-8">
                  <p className="text-white/40 text-sm mb-3">Need help with your order?</p>
                  <a
                    href="https://discord.gg/ND726FmARQ"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Support on Discord
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back to home */}
        <div className="mt-auto pt-8 text-center">
          <Link to="/" className="text-sm text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
