import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router";
import {
  Shield,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  MessageCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

/* ─── Discord OAuth Config ─── */
const DISCORD_CLIENT_ID = "1161062641788260403";
const DISCORD_GUILD_ID = "1158909431837376543";
const DISCORD_REDIRECT_CHANNEL_ID = "1159012204683726848";

function getDiscordOAuthUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds guilds.join",
    prompt: "consent",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/* ─── Detect if in Discord in-app browser ─── */
function isDiscordBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("discord") ||
    ua.includes("fb_iab") || // Facebook in-app
    (window as any).DiscordWebApp != null || // Discord WebApp object
    // Check for Discord-specific iframe behavior
    (window.self !== window.top && ua.includes("mobile"))
  );
}

function isInAppBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("instagram") ||
    ua.includes("fb_iab") ||
    ua.includes("fbav") ||
    ua.includes("twitter") ||
    ua.includes("line") ||
    ua.includes("snapchat") ||
    ua.includes("tiktok") ||
    isDiscordBrowser()
  );
}

/* ─── Force open in default browser ─── */
function forceOpenBrowser(url: string) {
  // Try multiple approaches

  // 1. Try intent:// URL for Android
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = ua.includes("android");
  const isIOS = /iphone|ipad|ipod/.test(ua);

  if (isAndroid) {
    // Use intent:// to force open in default browser
    const intentUrl = url.replace(/^https?:\/\//, "intent://");
    window.location.href = `${intentUrl}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;end`;
    return;
  }

  if (isIOS) {
    // On iOS, try to open in Safari using a new window
    const newWindow = window.open(url, "_system");
    if (!newWindow || newWindow.closed) {
      // Fallback: show instructions
      window.location.href = url;
    }
    return;
  }

  // Default fallback
  window.location.href = url;
}

/* ─── Verification Status Types ─── */
type VerifyStatus = "idle" | "force-browser" | "authorizing" | "processing" | "success" | "error";

/* ─── Main Verify Page ─── */
export default function Verify() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [inDiscordBrowser, setInDiscordBrowser] = useState(false);
  const [inAppBrowser, setInAppBrowser] = useState(false);

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const redirectUri = `${window.location.origin}/verify`;

  // Detect browser type on mount
  useEffect(() => {
    const isDiscord = isDiscordBrowser();
    const isInApp = isInAppBrowser();
    setInDiscordBrowser(isDiscord);
    setInAppBrowser(isInApp);

    if (isDiscord || isInApp) {
      setStatus("force-browser");
    }
  }, []);

  // Handle OAuth callback
  const exchangeMutation = trpc.verification.exchange.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setStatus("success");
        setUserData(data.user);
        setMessage(`Welcome ${data.user.username}! You have been verified and the role has been assigned.`);

        // Redirect to Discord after 4 seconds
        setTimeout(() => {
          const discordUrl = `https://discord.com/channels/${DISCORD_GUILD_ID}/${DISCORD_REDIRECT_CHANNEL_ID}`;
          window.location.href = discordUrl;
        }, 4000);
      } else {
        setStatus("error");
        setMessage(data.roleError || "Verification completed but role could not be assigned. Make sure you have joined the server.");
      }
    },
    onError: (err) => {
      setStatus("error");
      setMessage(err.message || "An error occurred during verification. Please try again.");
    },
  });

  // Process OAuth code
  useEffect(() => {
    if (code && status !== "processing" && status !== "success" && status !== "error") {
      setStatus("processing");
      setMessage("Verifying your account...");
      exchangeMutation.mutate({ code, redirectUri });
    }

    if (error && status === "idle") {
      setStatus("error");
      setMessage("Authorization was cancelled or failed. Please try again.");
    }
  }, [code, error]);

  // Start Discord OAuth
  const startOAuth = useCallback(() => {
    if (inDiscordBrowser || inAppBrowser) {
      // Show force browser screen first
      setStatus("force-browser");
      return;
    }
    setStatus("authorizing");
    const oauthUrl = getDiscordOAuthUrl(redirectUri);
    window.location.href = oauthUrl;
  }, [inDiscordBrowser, inAppBrowser, redirectUri]);

  // Force open in browser handler
  const handleForceOpen = useCallback(() => {
    const currentUrl = window.location.href;
    forceOpenBrowser(currentUrl);
  }, []);

  // Retry verification
  const handleRetry = useCallback(() => {
    setStatus("idle");
    setMessage("");
    // Clear URL params
    window.history.replaceState({}, "", "/verify");
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0010] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-pink-900/10" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-pink-500/10"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black heading-italic gradient-text">
              Perks
            </span>
          </Link>
          <p className="text-white/50 text-sm">Discord Server Verification</p>
        </div>

        {/* ─── Force Browser View ─── */}
        {status === "force-browser" && (
          <div className="glass-card rounded-2xl p-8 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Smartphone className="w-10 h-10 text-amber-400" />
            </div>

            <h2 className="text-2xl font-bold heading-italic text-white mb-3">
              Open in Browser
            </h2>
            <p className="text-white/60 mb-2 text-sm">
              For security reasons, please open this verification link in your default web browser.
            </p>
            <p className="text-white/40 text-xs mb-6">
              The in-app browser does not support Discord OAuth securely.
            </p>

            <button
              onClick={handleForceOpen}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 mb-4"
            >
              <ExternalLink className="w-5 h-5" />
              Open in Browser
            </button>

            <div className="text-xs text-white/30 space-y-1">
              <p>Tap the button above, or</p>
              <p>Tap the &quot;...&quot; menu and select &quot;Open in Browser&quot;</p>
            </div>

            {/* Alternative: Copy link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setMessage("Link copied! Paste it in your browser.");
              }}
              className="mt-4 text-xs text-pink-400 hover:text-pink-300 transition-colors underline"
            >
              Copy verification link
            </button>
          </div>
        )}

        {/* ─── Idle State ─── */}
        {status === "idle" && !inDiscordBrowser && !inAppBrowser && (
          <div className="glass-card rounded-2xl p-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Shield className="w-10 h-10 text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold heading-italic text-white mb-2">
                Verify Your Account
              </h2>
              <p className="text-white/50 text-sm">
                Click below to authenticate with Discord and gain access to the server.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-sm text-white/70">Secure Discord OAuth</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-sm text-white/70">Automatic role assignment</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-sm text-white/70">Instant access granted</span>
              </div>
            </div>

            <button
              onClick={startOAuth}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Verify with Discord
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs text-white/30 mt-4">
              By verifying, you agree to the server rules and guidelines.
            </p>
          </div>
        )}

        {/* ─── Authorizing State ─── */}
        {status === "authorizing" && (
          <div className="glass-card rounded-2xl p-8 text-center animate-scale-in">
            <Loader2 className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Redirecting...</h2>
            <p className="text-white/50 text-sm">Taking you to Discord for authorization.</p>
          </div>
        )}

        {/* ─── Processing State ─── */}
        {status === "processing" && (
          <div className="glass-card rounded-2xl p-8 text-center animate-scale-in">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-pink-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" />
              <Shield className="absolute inset-0 m-auto w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying...</h2>
            <p className="text-white/50 text-sm">{message}</p>
          </div>
        )}

        {/* ─── Success State ─── */}
        {status === "success" && (
          <div className="glass-card rounded-2xl p-8 text-center animate-scale-in status-success">
            {/* Animated success icon */}
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 animate-success-pop">
              <svg
                className="w-14 h-14 text-green-400"
                viewBox="0 0 52 52"
                fill="none"
              >
                <circle
                  cx="26"
                  cy="26"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="opacity-30"
                />
                <path
                  d="M16 26l7 7 13-13"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[checkmark_0.5s_ease-out_forwards]"
                  style={{
                    strokeDasharray: 100,
                    strokeDashoffset: 0,
                  }}
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold heading-italic text-green-400 mb-3 animate-fade-in-up">
              Verification Successful!
            </h2>

            {userData && (
              <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.username}
                    className="w-12 h-12 rounded-full border-2 border-green-400/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {userData.username?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-white font-semibold">{userData.username}</span>
              </div>
            )}

            <p className="text-white/60 text-sm mb-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              {message}
            </p>
            <p className="text-green-400/60 text-xs mb-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              The Verified role has been assigned to your account.
            </p>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <a
                href={`https://discord.com/channels/${DISCORD_GUILD_ID}/${DISCORD_REDIRECT_CHANNEL_ID}`}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Go to Discord Server
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            <p className="text-white/30 text-xs mt-4 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              Redirecting to Discord in a few seconds...
            </p>
          </div>
        )}

        {/* ─── Error State ─── */}
        {status === "error" && (
          <div className="glass-card rounded-2xl p-8 text-center animate-scale-in status-failed">
            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 animate-success-pop">
              <XCircle className="w-14 h-14 text-red-400" />
            </div>

            <h2 className="text-2xl font-bold heading-italic text-red-400 mb-3">
              Verification Failed
            </h2>

            <p className="text-white/60 text-sm mb-2">{message}</p>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs text-amber-300 font-medium mb-1">Common issues:</p>
                <ul className="text-xs text-amber-200/70 space-y-1">
                  <li>Make sure you have joined the Discord server first</li>
                  <li>The bot needs permission to assign roles</li>
                  <li>Your account might already be verified</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRetry}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <a
                href="https://discord.gg/ND726FmARQ"
                target="_blank"
                rel="noreferrer"
                className="w-full btn-glass py-3 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Join Server First
              </a>
            </div>
          </div>
        )}

        {/* ─── Footer ─── */}
        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
