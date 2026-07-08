import { useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  CheckCircle2,
  XCircle,
  LogOut,
  BarChart3,
  Key,
  Server,
  RefreshCw,
  Search,
  ChevronLeft,
  Eye,
  EyeOff,
  Activity,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

/* ─── Login Component ─── */
function DashboardLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.dashboard.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("dashboard_token", data.token);
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
    loginMutation.mutate({ password: password || "", type: "dashboard" });
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
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard Login</h1>
          <p className="text-white/50 text-sm">Enter your dashboard password to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6">
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 pr-12"
                placeholder="Enter password"
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

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full btn-primary py-3"
          >
            {loginMutation.isPending ? (
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Shield className="w-5 h-5 mr-2" />
            )}
            Login
          </Button>
        </form>

        <div className="text-center mt-6">
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
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-5 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          {icon}
        </div>
        <span className="text-xs text-white/40">{subtitle}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-white/40">{title}</div>
    </div>
  );
}

/* ─── Tab Types ─── */
type Tab = "overview" | "verifications" | "guilds" | "tokens";

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("dashboard_token"));
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Verify token
  const { data: tokenValid } = trpc.dashboard.verifyToken.useQuery(
    { token: token || "", type: "dashboard" },
    { enabled: !!token, retry: false }
  );

  // Fetch data
  const { data: overview, isLoading: overviewLoading } = trpc.dashboard.overview.useQuery(
    undefined,
    { enabled: !!token && tokenValid?.valid, refetchInterval: 30000 }
  );
  const { data: guildInfo, isLoading: guildLoading, refetch: refetchGuild } = trpc.guild.info.useQuery(
    undefined,
    { enabled: !!token && tokenValid?.valid }
  );
  const { data: tokenList, isLoading: tokensLoading, refetch: refetchTokens } = trpc.token.list.useQuery(
    undefined,
    { enabled: !!token && tokenValid?.valid && activeTab === "tokens" }
  );
  const { data: verificationList } = trpc.verification.list.useQuery(
    undefined,
    { enabled: !!token && tokenValid?.valid && activeTab === "verifications" }
  );

  const logout = () => {
    localStorage.removeItem("dashboard_token");
    setToken(null);
  };

  // Redirect to login if token invalid
  if (!token || tokenValid?.valid === false) {
    return <DashboardLogin onLogin={setToken} />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "verifications", label: "Verifications", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "guilds", label: "Guild", icon: <Server className="w-4 h-4" /> },
    { id: "tokens", label: "Tokens", icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0010] text-white">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold heading-italic gradient-text hidden sm:block">Perks</span>
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm text-white/60">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5">
                Admin Panel
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
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25"
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
                <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
              </div>
            ) : overview ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Verifications"
                    value={overview.verifications.total}
                    subtitle="All time"
                    icon={<Activity className="w-5 h-5 text-blue-400" />}
                    color="#3B82F6"
                  />
                  <StatCard
                    title="Successful"
                    value={overview.verifications.successful}
                    subtitle={`${Math.round((overview.verifications.successful / Math.max(overview.verifications.total, 1)) * 100)}% rate`}
                    icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
                    color="#22C55E"
                  />
                  <StatCard
                    title="Roles Given"
                    value={overview.verifications.rolesGiven}
                    subtitle="Verified users"
                    icon={<Award className="w-5 h-5 text-pink-400" />}
                    color="#EC4899"
                  />
                  <StatCard
                    title="Last 24h"
                    value={overview.verifications.last24h}
                    subtitle="Recent activity"
                    icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                    color="#A855F7"
                  />
                </div>

                {/* Recent Verifications */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">Recent Verifications</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Status</th>
                          <th>Role</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.recentVerifications.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8 text-white/40">
                              No verifications yet
                            </td>
                          </tr>
                        ) : (
                          overview.recentVerifications.map((v) => (
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
                              <td>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    v.status === "success"
                                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                      : v.status === "failed"
                                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  }`}
                                >
                                  {v.status}
                                </span>
                              </td>
                              <td>
                                {v.roleGiven ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                              </td>
                              <td className="text-white/40">
                                {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "N/A"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Orders Summary */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">Orders Summary</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-5">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{overview.orders.total}</div>
                      <div className="text-xs text-white/40 mt-1">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-400">{overview.orders.pending}</div>
                      <div className="text-xs text-white/40 mt-1">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{overview.orders.completed}</div>
                      <div className="text-xs text-white/40 mt-1">Completed</div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ─── Verifications Tab ─── */}
        {activeTab === "verifications" && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">All Verifications</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Discord ID</th>
                    <th>Status</th>
                    <th>Role Given</th>
                    <th>IP</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationList?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-white/40">
                        No verifications yet
                      </td>
                    </tr>
                  ) : (
                    verificationList
                      ?.filter((v) =>
                        searchQuery
                          ? v.discordUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.discordId?.includes(searchQuery)
                          : true
                      )
                      .map((v) => (
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
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                v.status === "success"
                                  ? "bg-green-500/10 text-green-400"
                                  : v.status === "failed"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td>
                            {v.roleGiven ? (
                              <span className="text-green-400 text-xs">Yes</span>
                            ) : (
                              <span className="text-red-400 text-xs">No</span>
                            )}
                          </td>
                          <td className="text-white/40 text-xs">{v.ipAddress}</td>
                          <td className="text-white/40 text-xs">
                            {v.createdAt ? new Date(v.createdAt).toLocaleString() : "N/A"}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Guild Tab ─── */}
        {activeTab === "guilds" && (
          <div className="space-y-6">
            {guildLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
              </div>
            ) : guildInfo ? (
              <>
                {/* Guild Info Card */}
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Guild Information</h3>
                    <button
                      onClick={() => refetchGuild()}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    {(guildInfo.guild as any)?.icon || (guildInfo.guild as any)?.guildIcon ? (
                      <img
                        src={(guildInfo.guild as any)?.icon || (guildInfo.guild as any)?.guildIcon}
                        alt=""
                        className="w-16 h-16 rounded-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                        <Server className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-white">{(guildInfo.guild as any)?.name || (guildInfo.guild as any)?.guildName}</h4>
                      <p className="text-sm text-white/50">ID: {(guildInfo.guild as any)?.id || (guildInfo.guild as any)?.guildId}</p>
                      <p className="text-sm text-white/50">
                        Members: {(guildInfo.guild as any)?.memberCount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {guildInfo.verifiedRole && (
                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <p className="text-sm text-green-400 font-medium mb-1">Verified Role</p>
                      <p className="text-white">{guildInfo.verifiedRole.name}</p>
                    </div>
                  )}
                </div>

                {/* Roles List */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">Roles ({guildInfo.roles?.length})</h3>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>ID</th>
                          <th>Color</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guildInfo.roles
                          ?.sort((a: any, b: any) => b.position - a.position)
                          .map((role: any) => (
                            <tr key={role.id}>
                              <td className="font-medium text-white">{role.name}</td>
                              <td className="text-white/40 font-mono text-xs">{role.id}</td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{
                                      backgroundColor: role.color
                                        ? `#${role.color.toString(16).padStart(6, "0")}`
                                        : "#99AAB5",
                                    }}
                                  />
                                  <span className="text-white/40 text-xs">
                                    {role.color ? `#${role.color.toString(16).padStart(6, "0")}` : "Default"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Members List */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white">Members ({guildInfo.members?.length})</h3>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Roles</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guildInfo.members?.map((member: any) => (
                          <tr key={member.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                {member.avatar ? (
                                  <img src={member.avatar} alt="" className="w-8 h-8 rounded-full" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
                                )}
                                <span className="text-white font-medium">{member.username}</span>
                              </div>
                            </td>
                            <td className="text-white/40 text-xs">
                              {member.roles?.length} roles
                            </td>
                            <td className="text-white/40 text-xs">
                              {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-white/40">Failed to load guild info. Make sure the bot is in the server.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Tokens Tab ─── */}
        {activeTab === "tokens" && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">OAuth Tokens</h3>
              <button
                onClick={() => refetchTokens()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Guild</th>
                    <th>Scopes</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tokensLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 text-pink-400 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : tokenList?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-white/40">
                        No tokens stored
                      </td>
                    </tr>
                  ) : (
                    tokenList?.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div className="text-white font-medium">{t.discordUsername}</div>
                          <div className="text-white/40 text-xs font-mono">{t.discordId}</div>
                        </td>
                        <td className="text-white/40 text-xs font-mono">{t.guildId}</td>
                        <td className="text-white/40 text-xs">{t.scopes}</td>
                        <td className="text-white/40 text-xs">
                          {t.expiresAt ? new Date(t.expiresAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td>
                          {t.isRevoked ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-400">Revoked</span>
                          ) : t.expiresAt && new Date(t.expiresAt) < new Date() ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400">Expired</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">Active</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
