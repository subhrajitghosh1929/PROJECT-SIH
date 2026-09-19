import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'transitmate-sih-2026-secret-key';

// Middleware to extract user if available (fallback to first user for guest demo)
function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.id;
    } catch {}
  }
  return 'u1'; // Fallback demo commuter
}

// GET /api/wallet/balance - Retrieve current wallet balance & recent transactions
router.get('/balance', (req, res) => {
  try {
    const userId = getUserId(req);
    const wallet = db.getWallet(userId);
    res.json({
      success: true,
      balance: wallet.balance || 0,
      transactions: wallet.transactions || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wallet', error: err.message });
  }
});

// POST /api/wallet/topup - Mock payment / Add money to wallet
router.post('/topup', (req, res) => {
  try {
    const userId = getUserId(req);
    const { amount, method = 'UPI' } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid top-up amount' });
    }

    const result = db.topUpWallet(userId, amount, method);
    res.json({
      success: true,
      message: `Successfully added ₹${amount} via ${method}`,
      balance: result.balance,
      transaction: result.transaction,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wallet/pay-ticket - Deduct fare and issue digital boarding ticket
router.post('/pay-ticket', (req, res) => {
  try {
    const userId = getUserId(req);
    const { amount, routeLabel, seatNumber, distanceKm } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid ticket amount' });
    }

    const result = db.deductWallet(userId, amount, {
      routeLabel,
      seatNumber,
      distanceKm,
    });

    res.json({
      success: true,
      message: `Paid ₹${amount} for ${routeLabel || 'Transit Ticket'}`,
      balance: result.balance,
      transaction: result.transaction,
      ticket: result.ticket,
    });
  } catch (err) {
    if (err.code === 'INSUFFICIENT_FUNDS') {
      return res.status(402).json({
        success: false,
        code: 'INSUFFICIENT_FUNDS',
        message: err.message,
        currentBalance: err.currentBalance,
        requiredAmount: err.requiredAmount,
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
