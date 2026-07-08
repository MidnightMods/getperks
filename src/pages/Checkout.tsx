import { useState } from "react";
import { useLocation, Link } from "react-router";
import {
  Shield,
  ChevronLeft,
  CreditCard,
  Wallet,
  QrCode,
  Bitcoin,
  Copy,
  Check,
  ShoppingCart,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

type PaymentMethod = "paypal" | "upi" | "crypto_ltc" | "crypto_usdt";

const PAYMENT_METHODS = [
  { id: "paypal" as PaymentMethod, label: "PayPal", icon: <CreditCard className="w-5 h-5" /> },
  { id: "upi" as PaymentMethod, label: "UPI", icon: <QrCode className="w-5 h-5" /> },
  { id: "crypto_ltc" as PaymentMethod, label: "Litecoin", icon: <Bitcoin className="w-5 h-5" /> },
  { id: "crypto_usdt" as PaymentMethod, label: "USDT (TRC20)", icon: <Wallet className="w-5 h-5" /> },
];

export default function Checkout() {
  const location = useLocation();
  const { cart, total } = (location.state as { cart: any[]; total: number }) || { cart: [], total: 0 };

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("paypal");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerDiscord, setCustomerDiscord] = useState("");
  const [paymentProof, setPaymentProof] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      setOrderNumber(data.orderNumber);
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;

    // Create order for each cart item
    cart.forEach((item) => {
      createOrder.mutate({
        customerName,
        customerEmail,
        customerDiscord,
        productName: `${item.name} - ${item.description}`,
        productCategory: item.category,
        quantity: 1,
        totalAmount: item.price.toFixed(2),
        currency: "USD",
        paymentMethod: selectedMethod,
        paymentProof,
        notes: `Payment method: ${selectedMethod}`,
      });
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cart?.length) {
    return (
      <div className="min-h-screen bg-[#0a0010] text-white flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-white/40 mb-6">Add some products before checkout.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (submitted && orderNumber) {
    return (
      <div className="min-h-screen bg-[#0a0010] text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-hero" />
        <div className="relative z-10 w-full max-w-md mx-auto px-4">
          <div className="glass-card rounded-2xl p-8 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 animate-success-pop">
              <Check className="w-10 h-10 text-green-400" />
            </div>

            <h2 className="text-2xl font-bold heading-italic text-green-400 mb-3">
              Order Placed!
            </h2>
            <p className="text-white/60 mb-2">Your order has been received.</p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <p className="text-xs text-white/40 mb-1">Order Number</p>
              <p className="text-lg font-bold font-mono text-white">{orderNumber}</p>
            </div>

            <div className="space-y-3 mb-6 text-left">
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs text-amber-400 font-medium mb-1">Next Steps:</p>
                <ol className="text-xs text-white/60 space-y-1 list-decimal list-inside">
                  <li>Complete your payment using the selected method</li>
                  <li>Save your order number for tracking</li>
                  <li>Join our Discord for updates</li>
                  <li>Your order will be processed within 24 hours</li>
                </ol>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/order-status"
                state={{ orderNumber }}
                className="btn-primary py-3 flex items-center justify-center gap-2"
              >
                Track Order
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://discord.gg/ND726FmARQ"
                target="_blank"
                rel="noreferrer"
                className="btn-glass py-3 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Join Discord for Updates
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0010] text-white">
      <div className="absolute inset-0 bg-hero" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold heading-italic gradient-text">Perks</span>
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-sm text-white/60">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-xl p-5 sticky top-6">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    {item.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <p className="text-xs text-white/40">{item.description}</p>
                    </div>
                    <span className="text-sm font-bold gradient-text">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Total</span>
                  <span className="text-2xl font-bold gradient-text">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Payment Details</h3>

              {/* Customer Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Name (optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Discord Username <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerDiscord}
                    onChange={(e) => setCustomerDiscord(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50"
                    placeholder="username#0000"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-3">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        selectedMethod === method.id
                          ? "border-pink-500/50 bg-pink-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className={selectedMethod === method.id ? "text-pink-400" : "text-white/40"}>
                        {method.icon}
                      </span>
                      <span className={`text-sm font-medium ${selectedMethod === method.id ? "text-white" : "text-white/60"}`}>
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                {selectedMethod === "paypal" && (
                  <div>
                    <p className="text-sm text-white/60 mb-2">PayPal Email:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm text-white bg-black/30 px-3 py-2 rounded-lg font-mono">
                        survivalprotocolgaming-1@oksbi
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("survivalprotocolgaming-1@oksbi")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                      </button>
                    </div>
                    <p className="text-xs text-white/40 mt-2">Send ${total.toFixed(2)} via PayPal</p>
                  </div>
                )}
                {selectedMethod === "upi" && (
                  <div>
                    <p className="text-sm text-white/60 mb-2">UPI ID:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm text-white bg-black/30 px-3 py-2 rounded-lg font-mono">
                        survivalprotocolgaming-1@oksbi
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("survivalprotocolgaming-1@oksbi")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                      </button>
                    </div>
                    <p className="text-xs text-white/40 mt-2">Send ${total.toFixed(2)} via UPI</p>
                  </div>
                )}
                {selectedMethod === "crypto_ltc" && (
                  <div>
                    <p className="text-sm text-white/60 mb-2">Litecoin Address:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-white bg-black/30 px-3 py-2 rounded-lg font-mono break-all">
                        LfKuQkCSRAfzUUwiSAq6VetE79juXx49RF
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("LfKuQkCSRAfzUUwiSAq6VetE79juXx49RF")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                      </button>
                    </div>
                  </div>
                )}
                {selectedMethod === "crypto_usdt" && (
                  <div>
                    <p className="text-sm text-white/60 mb-2">USDT (TRC20) Address:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-white bg-black/30 px-3 py-2 rounded-lg font-mono break-all">
                        TVwo78ou92kCkLVpzsNB2BhbacaFTHYaWU
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("TVwo78ou92kCkLVpzsNB2BhbacaFTHYaWU")}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Proof */}
              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">
                  Transaction ID / Payment Proof <span className="text-pink-400">*</span>
                </label>
                <textarea
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 h-24 resize-none"
                  placeholder="Paste your transaction ID or payment screenshot link here"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={createOrder.isPending || !customerDiscord || !paymentProof}
                className="w-full btn-primary py-4 text-lg"
              >
                {createOrder.isPending ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    Complete Order - ${total.toFixed(2)}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-white/30 mt-4">
                By placing this order, you agree to our terms of service.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
