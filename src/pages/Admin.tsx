import { useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  ChevronLeft,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Package,
  BarChart3,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

/* ─── Admin Login ─── */
function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.dashboard.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("admin_token", data.token);
        onLogin(data.token);
      } else {
        setError(data.error || "Invalid password");
      }
    },
    onError: () => setError("Login failed. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ password: password || "", type: "admin" });
  };

  return (
    <div className="min-h-screen bg-[#0a0010] text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-hero" />
      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black heading-italic gradient-text">Perks</span>
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-white/50 text-sm">Restricted access. Enter admin password.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6">
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Admin Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 pr-12"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loginMutation.isPending} className="w-full btn-primary py-3">
            {loginMutation.isPending ? (
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Lock className="w-5 h-5 mr-2" />
            )}
            Access Admin Panel
          </Button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <Link to="/dashboard" className="text-sm text-white/30 hover:text-white/60 transition-colors block">
            Go to Dashboard
          </Link>
          <Link to="/" className="text-sm text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-white/40">{title}</div>
    </div>
  );
}

type Tab = "overview" | "orders" | "verifications" | "products";

/* ─── Main Admin Panel ─── */
export default function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Verify token
  const { data: tokenValid } = trpc.dashboard.verifyToken.useQuery(
    { token: token || "", type: "admin" },
    { enabled: !!token, retry: false }
  );

  // Fetch data
  const { data: overview, isLoading: overviewLoading } = trpc.dashboard.overview.useQuery(
    undefined,
    { enabled: !!token && tokenValid?.valid, refetchInterval: 30000 }
  );
  const { data: orderList, refetch: refetchOrders } = trpc.order.list.useQuery(
    undefined,
    { enabled: !!token && tokenValid?.valid }
  );
  const { data: verificationList } = trpc.verification.list.useQuery(
    undefined,
    { enabled: !!token && tokenValid?.valid && activeTab === "verifications" }
  );
  const { data: productList, refetch: refetchProducts } = trpc.order.products.useQuery(
    undefined,
    { enabled: !!token && tokenValid?.valid && activeTab === "products" }
  );
  const seedProducts = trpc.order.seedProducts.useMutation({
    onSuccess: () => refetchProducts(),
  });
  const updateOrderStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => refetchOrders(),
  });

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  if (!token || tokenValid?.valid === false) {
    return <AdminLogin onLogin={setToken} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "verifications", label: "Verifications", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
  ];

  const filteredOrders = orderList
    ?.filter((o) => (statusFilter === "all" ? true : o.orderStatus === statusFilter))
    ?.filter((o) =>
      searchQuery
        ? o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.productName?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  return (
    <div className="min-h-screen bg-[#0a0010] text-white">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold heading-italic gradient-text hidden sm:block">Perks</span>
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm text-amber-400 font-medium">Admin Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5">
                Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {overviewLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : overview ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total Orders" value={overview.orders.total} icon={<ShoppingBag className="w-5 h-5 text-amber-400" />} color="#F59E0B" />
                  <StatCard title="Pending" value={overview.orders.pending} icon={<Clock className="w-5 h-5 text-orange-400" />} color="#F97316" />
                  <StatCard title="Completed" value={overview.orders.completed} icon={<CheckCircle2 className="w-5 h-5 text-green-400" />} color="#22C55E" />
                  <StatCard title="Revenue" value={`$${orderList?.reduce((sum, o) => sum + (parseFloat(o.totalAmount || "0") || 0), 0).toFixed(2)}`} icon={<CreditCard className="w-5 h-5 text-purple-400" />} color="#A855F7" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                      <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {overview.recentOrders.length === 0 ? (
                        <div className="p-6 text-center text-white/40">No orders yet</div>
                      ) : (
                        overview.recentOrders.slice(0, 5).map((o) => (
                          <div key={o.id} className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-white">{o.productName}</p>
                              <p className="text-xs text-white/40">{o.orderNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold gradient-text">${o.totalAmount}</p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  o.orderStatus === "completed"
                                    ? "bg-green-500/10 text-green-400"
                                    : o.orderStatus === "pending"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                {o.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-white/5">
                      <h3 className="text-lg font-bold text-white">Recent Verifications</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {overview.recentVerifications.slice(0, 5).map((v) => (
                        <div key={v.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {v.discordAvatar ? (
                              <img src={v.discordAvatar} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
                            )}
                            <span className="text-sm text-white">{v.discordUsername}</span>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              v.status === "success"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ─── Orders Tab ─── */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex gap-2">
                {["all", "pending", "processing", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === s
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-white/5 text-white/40 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-white/40">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      filteredOrders?.map((o) => (
                        <tr key={o.id}>
                          <td className="font-mono text-xs text-white/60">{o.orderNumber}</td>
                          <td>
                            <span className="text-white text-sm">{o.productName}</span>
                            <span className="text-white/40 text-xs ml-2">({o.productCategory})</span>
                          </td>
                          <td>
                            <div className="text-sm text-white">{o.customerName || "N/A"}</div>
                            <div className="text-xs text-white/40">{o.customerDiscord || "No Discord"}</div>
                          </td>
                          <td className="font-bold gradient-text">${o.totalAmount}</td>
                          <td>
                            <span className="text-xs text-white/60">{o.paymentMethod}</span>
                          </td>
                          <td>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                o.orderStatus === "completed"
                                  ? "bg-green-500/10 text-green-400"
                                  : o.orderStatus === "pending"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : o.orderStatus === "processing"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {o.orderStatus}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              {o.orderStatus === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateOrderStatus.mutate({ id: o.id, orderStatus: "processing" })}
                                    className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                    title="Mark Processing"
                                  >
                                    <Clock className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => updateOrderStatus.mutate({ id: o.id, orderStatus: "completed" })}
                                    className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                    title="Mark Complete"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                              {o.orderStatus === "processing" && (
                                <button
                                  onClick={() => updateOrderStatus.mutate({ id: o.id, orderStatus: "completed" })}
                                  className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                  title="Mark Complete"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── Verifications Tab ─── */}
        {activeTab === "verifications" && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">All Verifications</h3>
            </div>
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Discord ID</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>VPN</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationList?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-white/40">No verifications yet</td>
                    </tr>
                  ) : (
                    verificationList?.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {v.discordAvatar ? (
                              <img src={v.discordAvatar} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
                            )}
                            <span className="text-white font-medium">{v.discordUsername}</span>
                          </div>
                        </td>
                        <td className="text-white/40 font-mono text-xs">{v.discordId}</td>
                        <td>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              v.status === "success"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td>{v.roleGiven ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                        <td>{v.isVpn ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <span className="text-white/40 text-xs">No</span>}</td>
                        <td className="text-white/40 text-xs">{v.createdAt ? new Date(v.createdAt).toLocaleString() : "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Products Tab ─── */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Product Catalog</h3>
              <button
                onClick={() => seedProducts.mutate()}
                disabled={seedProducts.isPending}
                className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${seedProducts.isPending ? "animate-spin" : ""}`} />
                Seed Default Products
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productList?.length === 0 ? (
                <div className="col-span-full glass-card rounded-xl p-8 text-center text-white/40">
                  No products yet. Click "Seed Default Products" to add them.
                </div>
              ) : (
                productList?.map((p) => (
                  <div key={p.id} className="glass-card rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          p.stockStatus === "in_stock"
                            ? "bg-green-500/10 text-green-400"
                            : p.stockStatus === "low_stock"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {p.stockStatus?.replace("_", " ")}
                      </span>
                      <span className="text-xs text-white/40 uppercase">{p.category}</span>
                    </div>
                    <h4 className="text-white font-bold mb-1">{p.name}</h4>
                    <p className="text-white/50 text-xs mb-3">{p.description}</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold gradient-text">${p.price}</span>
                      {p.comparePrice && (
                        <span className="text-xs text-white/30 line-through">${p.comparePrice}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>Stock: {p.stockCount}</span>
                      <span className={p.isActive ? "text-green-400" : "text-red-400"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
