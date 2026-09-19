import React, { useState, useMemo } from 'react';
import {
  Armchair,
  CheckCircle2,
  AlertCircle,
  Wallet,
  QrCode,
  MapPin,
  Clock,
  Bus,
  Shield,
  X,
  ChevronRight,
  Plus,
  Ticket,
  Navigation,
  User,
  Sparkles,
} from 'lucide-react';
import { calculateRouteDistanceKm, calculateFare } from '../utils/geoUtils.js';
import { api } from '../services/api.js';

/**
 * Generate a deterministic bus seat map for any route
 * 32 seats: 8 rows of 4 (A [Window], B [Aisle] | Aisle | C [Aisle], D [Window])
 */
function generateSeatLayout(routeKey = 'default') {
  // Use routeKey characters to seed pseudo-random occupied seats
  let seed = 0;
  for (let i = 0; i < routeKey.length; i++) {
    seed = (seed * 31 + routeKey.charCodeAt(i)) % 10007;
  }

  const rows = 8;
  const cols = ['A', 'B', 'C', 'D'];
  const seats = [];

  for (let r = 1; r <= rows; r++) {
    for (const c of cols) {
      const seatNo = `${r}${c}`;
      const isWindow = c === 'A' || c === 'D';
      const isPriority = r === 1 && (c === 'A' || c === 'B');
      // deterministic occupancy: ~45% occupied
      seed = (seed * 16807) % 2147483647;
      const isOccupied = (seed % 100) < 42;

      seats.push({
        id: seatNo,
        row: r,
        col: c,
        isWindow,
        isPriority,
        isOccupied,
      });
    }
  }
  return seats;
}

export default function BusSeatLayoutModal({
  route,
  walletBalance = 0,
  userName = 'Commuter',
  onClose,
  onOpenWalletTopUp,
  onTicketBooked,
  onToast,
}) {
  const [seats, setSeats] = useState(() => generateSeatLayout(route?.key || route?.mode || 'wbtc'));
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  // Calculate distance & fare
  const distanceKm = useMemo(() => {
    if (route?.pathCoordinates && route.pathCoordinates.length > 1) {
      return calculateRouteDistanceKm(route.pathCoordinates);
    }
    const stopCount = route?.stops?.length || 4;
    return Math.max(3.0, Number((stopCount * 2.2).toFixed(1)));
  }, [route]);

  const isAC = Boolean(
    route?.tag?.toLowerCase().includes('ac') ||
    route?.mode?.toLowerCase().includes('ac') ||
    route?.isAC
  );

  const baseFare = useMemo(() => {
    return calculateFare(distanceKm, 'bus', isAC);
  }, [distanceKm, isAC]);

  const selectedSeat = seats.find((s) => s.id === selectedSeatId);
  const seatSurcharge = selectedSeat?.isWindow ? (isAC ? 10 : 5) : 0;
  const totalFare = baseFare + seatSurcharge;

  const availableCount = seats.filter((s) => !s.isOccupied).length;

  const handleSeatClick = (seat) => {
    if (seat.isOccupied) {
      if (onToast) onToast(`Seat ${seat.id} is already occupied.`);
      return;
    }
    if (selectedSeatId === seat.id) {
      setSelectedSeatId(null);
    } else {
      setSelectedSeatId(seat.id);
    }
  };

  const handleBookTicket = async () => {
    if (!selectedSeat) {
      if (onToast) onToast('Please select a seat first');
      return;
    }

    if (walletBalance < totalFare) {
      if (onToast) onToast(`Insufficient wallet balance. Please top up ₹${(totalFare - walletBalance).toFixed(0)}`);
      if (onOpenWalletTopUp) onOpenWalletTopUp(totalFare);
      return;
    }

    setIsBooking(true);
    try {
      const res = await api.wallet.payTicket(
        totalFare,
        route?.mode || `WBTC Route ${route?.routeNo || 'City Bus'}`,
        selectedSeat.id,
        distanceKm
      );

      if (res && res.success) {
        // Mark seat as occupied
        setSeats((prev) =>
          prev.map((s) => (s.id === selectedSeat.id ? { ...s, isOccupied: true, isBookedByMe: true } : s))
        );

        const ticketData = {
          ticketId: res.ticket?.ticketId || `TM-WBTC-${Math.floor(100000 + Math.random() * 900000)}`,
          routeLabel: route?.mode || `WBTC Bus ${route?.routeNo || 'Line'}`,
          origin: route?.stops?.[0] || route?.origin || 'Boarding Point',
          destination: route?.stops?.[route?.stops?.length - 1] || route?.destination || 'Destination',
          seatNumber: selectedSeat.id,
          seatType: selectedSeat.isWindow ? 'Window' : 'Aisle',
          farePaid: totalFare,
          distanceKm,
          bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          qrData: `TICKET:${res.ticket?.ticketId || 'WBTC'}|SEAT:${selectedSeat.id}|FARE:${totalFare}|DATE:${new Date().toISOString()}`,
        };

        setConfirmedTicket(ticketData);
        if (onTicketBooked) onTicketBooked(res.balance, ticketData);
        if (onToast) onToast(`Seat ${selectedSeat.id} successfully reserved!`);
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Ticket booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm tm-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !confirmedTicket) onClose();
      }}
    >
      <div
        className="w-full max-h-[92vh] flex flex-col rounded-t-3xl overflow-hidden tm-card shadow-2xl"
        style={{ borderTop: '1px solid var(--tm-border)', background: 'var(--tm-card)' }}
      >
        {/* Header Bar */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--tm-border)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--tm-accent-soft)' }}
            >
              <Bus size={17} style={{ color: 'var(--tm-accent)' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold truncate max-w-[200px]" style={{ color: 'var(--tm-heading)' }}>
                  {route?.mode || 'WBTC City Express'}
                </h2>
                {isAC && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    AC
                  </span>
                )}
              </div>
              <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--tm-muted)' }}>
                <MapPin size={10} />
                <span>{distanceKm} km trip</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">{availableCount} seats left</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center tm-card-alt text-gray-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        {confirmedTicket ? (
          /* Confirmed Boarding Pass View */
          <div className="p-6 flex flex-col items-center text-center overflow-y-auto">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'var(--tm-teal-soft)', border: '1px solid var(--tm-teal-border)' }}
            >
              <CheckCircle2 size={24} style={{ color: 'var(--tm-teal)' }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--tm-heading)' }}>
              Seat Confirmed & Paid!
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--tm-muted)' }}>
              Show this digital boarding QR pass to the bus conductor
            </p>

            {/* Ticket Card */}
            <div
              className="w-full mt-4 rounded-2xl p-4 text-left border relative"
              style={{ background: 'var(--tm-card-alt)', borderColor: 'var(--tm-accent-border)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--tm-border)' }}>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--tm-accent)' }}>
                    {confirmedTicket.ticketId}
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{confirmedTicket.routeLabel}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400">SEAT</span>
                  <p className="text-lg font-mono font-bold text-emerald-400">{confirmedTicket.seatNumber}</p>
                </div>
              </div>

              <div className="py-3 grid grid-cols-2 gap-2 text-xs border-b" style={{ borderColor: 'var(--tm-border)' }}>
                <div>
                  <span className="text-[10px] text-gray-400">PASSENGER</span>
                  <p className="font-medium text-gray-200 truncate">{userName || 'Commuter'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">SEAT TYPE</span>
                  <p className="font-medium text-gray-200">{confirmedTicket.seatType} Seat</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">TRIP DISTANCE</span>
                  <p className="font-medium text-gray-200">{confirmedTicket.distanceKm} km</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">FARE DEDUCTED</span>
                  <p className="font-bold text-amber-400 font-mono">₹{confirmedTicket.farePaid}.00</p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="pt-4 flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-xl shadow-inner flex items-center justify-center">
                  <QrCode size={110} className="text-slate-900" />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">Tap on conductor validation terminal</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-5 py-3 rounded-xl text-sm font-semibold transition"
              style={{ background: 'var(--tm-accent)', color: 'var(--tm-on-accent)' }}
            >
              Back to Live Bus Tracking
            </button>
          </div>
        ) : (
          /* Interactive Seat Layout View */
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
            {/* Legend */}
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl tm-card-alt text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded border border-gray-500 bg-slate-800/80" />
                <span style={{ color: 'var(--tm-body)' }}>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-amber-500 shadow-sm shadow-amber-500/50" />
                <span className="text-amber-300 font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-slate-700/60 opacity-50" />
                <span style={{ color: 'var(--tm-muted)' }}>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded border border-purple-400/60 bg-purple-950/40" />
                <span className="text-purple-300">Priority</span>
              </div>
            </div>

            {/* Bus Blueprint Layout */}
            <div
              className="rounded-2xl p-4 border relative mx-auto w-full max-w-[340px]"
              style={{
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                borderColor: 'var(--tm-border)',
              }}
            >
              {/* Bus Front Cabin */}
              <div className="pb-3 mb-3 border-b flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--tm-border)' }}>
                <div className="flex items-center gap-2 text-emerald-400/90 font-mono text-[10px]">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  FRONT ENTRY
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-gray-300 text-[10px] font-medium">
                  <Navigation size={12} className="text-sky-400 rotate-45" />
                  Driver Cabin
                </div>
              </div>

              {/* 2x2 Seating Matrix */}
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((rowNum) => {
                  const seatA = seats.find((s) => s.row === rowNum && s.col === 'A');
                  const seatB = seats.find((s) => s.row === rowNum && s.col === 'B');
                  const seatC = seats.find((s) => s.row === rowNum && s.col === 'C');
                  const seatD = seats.find((s) => s.row === rowNum && s.col === 'D');

                  return (
                    <div key={rowNum} className="flex items-center justify-between gap-1">
                      {/* Left Pair: A (Window) & B (Aisle) */}
                      <div className="flex items-center gap-1.5">
                        <SeatButton
                          seat={seatA}
                          isSelected={selectedSeatId === seatA?.id}
                          baseFare={baseFare}
                          isAC={isAC}
                          onClick={() => handleSeatClick(seatA)}
                        />
                        <SeatButton
                          seat={seatB}
                          isSelected={selectedSeatId === seatB?.id}
                          baseFare={baseFare}
                          isAC={isAC}
                          onClick={() => handleSeatClick(seatB)}
                        />
                      </div>

                      {/* Central Aisle */}
                      <div className="w-6 text-center text-[9px] font-mono text-gray-500 select-none">
                        R{rowNum}
                      </div>

                      {/* Right Pair: C (Aisle) & D (Window) */}
                      <div className="flex items-center gap-1.5">
                        <SeatButton
                          seat={seatC}
                          isSelected={selectedSeatId === seatC?.id}
                          baseFare={baseFare}
                          isAC={isAC}
                          onClick={() => handleSeatClick(seatC)}
                        />
                        <SeatButton
                          seat={seatD}
                          isSelected={selectedSeatId === seatD?.id}
                          baseFare={baseFare}
                          isAC={isAC}
                          onClick={() => handleSeatClick(seatD)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bus Rear Indicator */}
              <div className="mt-3 pt-2 border-t text-center text-[9px] font-mono text-gray-500 uppercase tracking-widest" style={{ borderColor: 'var(--tm-border)' }}>
                Bus Rear · Emergency Exit
              </div>
            </div>

            {/* Selection & Fare Breakdown */}
            <div
              className="rounded-2xl p-4 border flex flex-col gap-3"
              style={{ background: 'var(--tm-card-alt)', borderColor: 'var(--tm-border)' }}
            >
              {selectedSeat ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">Seat {selectedSeat.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                          {selectedSeat.isWindow ? 'Window View' : 'Aisle'}
                        </span>
                        {selectedSeat.isPriority && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            Priority
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {distanceKm} km trip • {route?.stops?.[0] || 'Origin'} → {route?.stops?.[route?.stops?.length - 1] || 'Destination'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400">Total Price</span>
                      <p className="text-lg font-bold font-mono text-amber-400">₹{totalFare}</p>
                    </div>
                  </div>

                  {/* Fare breakdown details */}
                  <div className="text-[11px] pt-2 border-t flex items-center justify-between text-gray-400" style={{ borderColor: 'var(--tm-border)' }}>
                    <span>Base distance fare ({distanceKm} km):</span>
                    <span className="text-gray-200 font-mono">₹{baseFare}</span>
                  </div>
                  {seatSurcharge > 0 && (
                    <div className="text-[11px] flex items-center justify-between text-gray-400">
                      <span>Window seat premium:</span>
                      <span className="text-emerald-400 font-mono">+₹{seatSurcharge}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-300 font-medium">Tap any available seat above to view its price</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Calculated for {distanceKm} km route distance (Base fare ₹{baseFare})
                  </p>
                </div>
              )}

              {/* Commuter Wallet Bar */}
              <div
                className="p-3 rounded-xl flex items-center justify-between border"
                style={{
                  background: walletBalance < totalFare && selectedSeat ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 41, 59, 0.6)',
                  borderColor: walletBalance < totalFare && selectedSeat ? 'rgba(239, 68, 68, 0.3)' : 'var(--tm-border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Wallet size={15} className={walletBalance > 0 ? 'text-emerald-400' : 'text-gray-400'} />
                  <div>
                    <p className="text-[10px] text-gray-400">Commuter Wallet Balance</p>
                    <p className="text-xs font-bold font-mono text-white">
                      ₹{Number(walletBalance).toFixed(2)}
                      {walletBalance === 0 && <span className="text-[10px] text-amber-400 ml-1.5 font-normal">(Needs Top-Up)</span>}
                    </p>
                  </div>
                </div>

                {walletBalance < totalFare && selectedSeat ? (
                  <button
                    onClick={() => {
                      if (onOpenWalletTopUp) onOpenWalletTopUp(totalFare);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 transition border border-sky-500/30"
                  >
                    <Plus size={12} />
                    Top Up
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} /> Ready to Pay
                  </span>
                )}
              </div>

              {/* Action Button */}
              {selectedSeat ? (
                walletBalance >= totalFare ? (
                  <button
                    onClick={handleBookTicket}
                    disabled={isBooking}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
                    style={{ background: 'var(--tm-accent)', color: 'var(--tm-on-accent)' }}
                  >
                    {isBooking ? (
                      'Reserving Seat & Generating Ticket...'
                    ) : (
                      <>
                        <Ticket size={15} />
                        Pay ₹{totalFare} & Reserve Seat {selectedSeat.id}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (onOpenWalletTopUp) onOpenWalletTopUp(totalFare);
                    }}
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-105 transition"
                  >
                    <Plus size={15} />
                    Add Money (₹{(totalFare - walletBalance).toFixed(0)}) & Book Seat
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed tm-card-alt text-gray-400"
                >
                  Select a Seat to Book
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SeatButton({ seat, isSelected, baseFare, isAC, onClick }) {
  if (!seat) return null;

  const seatPrice = baseFare + (seat.isWindow ? (isAC ? 10 : 5) : 0);

  if (seat.isOccupied) {
    return (
      <div
        title={`Seat ${seat.id} (Occupied)`}
        className="w-12 h-11 rounded-lg bg-slate-800/40 border border-slate-700/40 flex flex-col items-center justify-center cursor-not-allowed opacity-45 select-none"
      >
        <span className="text-[9px] font-mono text-gray-500">{seat.id}</span>
        <X size={10} className="text-gray-500 mt-0.5" />
      </div>
    );
  }

  if (isSelected) {
    return (
      <button
        onClick={onClick}
        title={`Seat ${seat.id} (Selected) - ₹${seatPrice}`}
        className="w-12 h-11 rounded-lg flex flex-col items-center justify-center font-semibold transition ring-2 ring-amber-400 shadow-md shadow-amber-500/40"
        style={{ background: 'var(--tm-accent)', color: 'var(--tm-on-accent)' }}
      >
        <span className="text-[10px] font-mono font-bold leading-none">{seat.id}</span>
        <span className="text-[9px] font-mono mt-0.5 leading-none">₹{seatPrice}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      title={`Seat ${seat.id} (${seat.isWindow ? 'Window' : 'Aisle'}) - ₹${seatPrice}`}
      className={`w-12 h-11 rounded-lg flex flex-col items-center justify-center transition hover:border-amber-400/80 hover:bg-slate-700/60 select-none ${
        seat.isPriority
          ? 'bg-purple-950/40 border border-purple-500/40 text-purple-200'
          : 'bg-slate-800/80 border border-slate-600/70 text-gray-200'
      }`}
    >
      <span className="text-[10px] font-mono font-medium leading-none">{seat.id}</span>
      <span className="text-[9px] font-mono text-amber-300/90 mt-0.5 leading-none">₹{seatPrice}</span>
    </button>
  );
}
