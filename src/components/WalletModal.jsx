import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Building2,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../services/api.js';

export default function WalletModal({
  balance = 0,
  transactions = [],
  requiredAmount = null,
  onClose,
  onBalanceUpdated,
  onToast,
}) {
  const [amount, setAmount] = useState(requiredAmount ? String(Math.max(50, Math.ceil(requiredAmount - balance))) : '100');
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const quickAmounts = [50, 100, 200, 500];

  const handleTopUp = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      if (onToast) onToast('Please enter a valid top-up amount');
      return;
    }

    setLoading(true);
    try {
      const res = await api.wallet.topUp(num, method);
      if (res && res.success) {
        setSuccessMsg(`Successfully added ₹${num} via ${method}!`);
        if (onBalanceUpdated) onBalanceUpdated(res.balance);
        if (onToast) onToast(`Wallet credited with ₹${num}`);
        setTimeout(() => {
          setSuccessMsg(null);
          if (requiredAmount && res.balance >= requiredAmount) {
            onClose();
          }
        }, 1200);
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
      <div
        className="w-full max-w-sm rounded-3xl p-6 tm-fade-in flex flex-col gap-4 shadow-2xl relative"
        style={{ background: 'var(--tm-card)', border: '1px solid var(--tm-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--tm-accent-soft)', color: 'var(--tm-accent)' }}
            >
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--tm-heading)' }}>
                TransitMate Wallet
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--tm-muted)' }}>
                Instant contactless metro & bus pass
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center tm-card-alt text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Current Balance Card */}
        <div
          className="rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(201, 164, 97, 0.18) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid var(--tm-accent-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--tm-muted)' }}>
            <span>Available Balance</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">
              Live Wallet
            </span>
          </div>
          <div className="my-2">
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--tm-heading)' }}>
              ₹{balance.toFixed(2)}
            </h2>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--tm-muted)' }}>
            Zero-balance until loaded. Used for contactless ticketing & seat reservations.
          </p>
        </div>

        {/* Insufficient Funds Warning Banner if triggered from checkout */}
        {requiredAmount && balance < requiredAmount && (
          <div
            className="px-3 py-2 rounded-xl text-xs flex items-center gap-2"
            style={{ background: 'var(--tm-amber-soft)', border: '1px solid var(--tm-amber-border)', color: 'var(--tm-amber)' }}
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>
              Ticket fare is <strong>₹{requiredAmount}</strong>. Please top up at least <strong>₹{(requiredAmount - balance).toFixed(2)}</strong>.
            </span>
          </div>
        )}

        {/* Top-up Form */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold" style={{ color: 'var(--tm-heading)' }}>
            Add Money to Wallet (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: 'var(--tm-muted)' }}>
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="10"
              className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm font-semibold tm-card-alt"
              style={{ border: '1px solid var(--tm-border)', color: 'var(--tm-heading)', outline: 'none' }}
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-1.5">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium tm-card-alt tm-hover transition"
                style={{
                  border: amount === String(q) ? '1px solid var(--tm-accent)' : '1px solid var(--tm-border)',
                  color: amount === String(q) ? 'var(--tm-accent)' : 'var(--tm-body)',
                }}
              >
                +₹{q}
              </button>
            ))}
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            <button
              type="button"
              onClick={() => setMethod('UPI')}
              className="py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition"
              style={{
                background: method === 'UPI' ? 'rgba(56, 189, 248, 0.15)' : 'var(--tm-card-alt)',
                border: method === 'UPI' ? '1px solid #38bdf8' : '1px solid var(--tm-border)',
                color: method === 'UPI' ? '#38bdf8' : 'var(--tm-muted)',
              }}
            >
              <QrCode size={14} />
              <span>UPI App</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('Card')}
              className="py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition"
              style={{
                background: method === 'Card' ? 'rgba(56, 189, 248, 0.15)' : 'var(--tm-card-alt)',
                border: method === 'Card' ? '1px solid #38bdf8' : '1px solid var(--tm-border)',
                color: method === 'Card' ? '#38bdf8' : 'var(--tm-muted)',
              }}
            >
              <CreditCard size={14} />
              <span>Debit Card</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('NetBanking')}
              className="py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition"
              style={{
                background: method === 'NetBanking' ? 'rgba(56, 189, 248, 0.15)' : 'var(--tm-card-alt)',
                border: method === 'NetBanking' ? '1px solid #38bdf8' : '1px solid var(--tm-border)',
                color: method === 'NetBanking' ? '#38bdf8' : 'var(--tm-muted)',
              }}
            >
              <Building2 size={14} />
              <span>NetBanking</span>
            </button>
          </div>

          {/* Pay Button */}
          <button
            onClick={handleTopUp}
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-2 transition"
            style={{
              background: 'var(--tm-accent)',
              color: 'var(--tm-on-accent)',
              boxShadow: '0 0 16px rgba(201, 164, 97, 0.35)',
            }}
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : successMsg ? (
              <span className="flex items-center gap-1.5 text-emerald-950">
                <CheckCircle2 size={15} /> Added!
              </span>
            ) : (
              <span>Proceed to Pay ₹{amount || 0}</span>
            )}
          </button>
        </div>

        {/* Recent Transactions List */}
        {transactions.length > 0 && (
          <div className="pt-2 border-t border-[var(--tm-border)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--tm-muted)' }}>
              Recent Transactions
            </p>
            <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-0.5">
              {transactions.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-2 rounded-xl tm-card-alt flex items-center justify-between text-xs"
                  style={{ border: '1px solid var(--tm-border)' }}
                >
                  <div className="flex items-center gap-2 truncate">
                    {t.type === 'topup' ? (
                      <ArrowDownLeft size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <ArrowUpRight size={14} className="text-amber-400 shrink-0" />
                    )}
                    <span className="truncate" style={{ color: 'var(--tm-body)' }}>
                      {t.description}
                    </span>
                  </div>
                  <span
                    className="font-mono font-semibold shrink-0"
                    style={{ color: t.type === 'topup' ? '#10b981' : '#f59e0b' }}
                  >
                    {t.type === 'topup' ? `+₹${t.amount}` : `-₹${t.amount}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
