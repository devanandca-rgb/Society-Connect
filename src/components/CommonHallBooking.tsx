import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  CreditCard,
  Building,
  Info,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CommonHallBooking, SocietyUser } from '../types/society';

interface CommonHallBookingProps {
  bookings: CommonHallBooking[];
  currentUser: SocietyUser;
  onAddBooking: (booking: Omit<CommonHallBooking, 'id' | 'bookingRef'>) => void;
  onApproveBooking: (bookingId: string) => void;
}

export const CommonHallBookingComponent: React.FC<CommonHallBookingProps> = ({
  bookings,
  currentUser,
  onAddBooking,
  onApproveBooking,
}) => {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [facility, setFacility] = useState<CommonHallBooking['facility']>('Community Banquet Hall');
  const [eventDate, setEventDate] = useState('2026-11-15');
  const [slot, setSlot] = useState<CommonHallBooking['slot']>('Evening (16:00 - 23:00)');
  const [eventType, setEventType] = useState<CommonHallBooking['eventType']>('Birthday Party');
  const [attendees, setAttendees] = useState(60);
  const [remarks, setRemarks] = useState('');
  const [agreedRules, setAgreedRules] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pricing matrix
  const getPricing = (fac: CommonHallBooking['facility'], slt: CommonHallBooking['slot']) => {
    let baseRent = 8000;
    let cleaning = 1500;
    let deposit = 5000;

    if (fac === 'Rooftop Terrace Garden') {
      baseRent = 6000;
      cleaning = 2000;
      deposit = 5000;
    } else if (fac === 'Clubhouse Lounge') {
      baseRent = 4000;
      cleaning = 1000;
      deposit = 3000;
    } else if (fac === 'Society Guest Room') {
      baseRent = 2500;
      cleaning = 500;
      deposit = 2000;
    }

    if (slt === 'Full Day (09:00 - 23:00)') {
      baseRent = Math.round(baseRent * 1.6);
      cleaning = Math.round(cleaning * 1.3);
    }

    return {
      rent: baseRent,
      cleaning,
      deposit,
      total: baseRent + cleaning + deposit,
    };
  };

  const currentPricing = getPricing(facility, slot);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedRules) {
      alert('Please agree to the society amenity usage rules and code of conduct.');
      return;
    }

    onAddBooking({
      facility,
      flatNumber: currentUser.flatNumber || 'B-402',
      bookedByName: currentUser.name,
      contactPhone: currentUser.phone,
      eventDate,
      slot,
      eventType,
      attendeeCount: attendees,
      hallRent: currentPricing.rent,
      cleaningFee: currentPricing.cleaning,
      refundableDeposit: currentPricing.deposit,
      totalAmount: currentPricing.total,
      status: currentUser.role === 'committee' ? 'Confirmed' : 'Pending Committee Approval',
      paymentStatus: 'Paid',
      rulesAgreed: true,
      remarks,
    });

    setIsBookModalOpen(false);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    showToast(`Booking request submitted for ${facility} on ${eventDate}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Common Hall & Amenity Booking Portal
          </h2>
          <p className="text-xs text-slate-500">
            Reserve Community Banquet Hall, Rooftop Terrace Garden, Clubhouse, and Society Guest Suites.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Facility Now</span>
        </button>
      </div>

      {/* Available Facilities Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 bg-gradient-to-tr from-amber-600 to-indigo-700 p-4 text-white flex flex-col justify-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">
              Ground Floor
            </span>
            <h3 className="font-bold text-base">Community Banquet Hall</h3>
          </div>
          <div className="p-4 text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Capacity:</span>
              <strong className="text-slate-900">Up to 200 Guests</strong>
            </div>
            <div className="flex justify-between">
              <span>Features:</span>
              <span>Central AC, Stage, Buffet Pantry</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
              <span>Standard Rent:</span>
              <span>₹8,000 / Slot</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 bg-gradient-to-tr from-emerald-600 to-teal-800 p-4 text-white flex flex-col justify-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
              Podium Top
            </span>
            <h3 className="font-bold text-base">Rooftop Terrace Garden</h3>
          </div>
          <div className="p-4 text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Capacity:</span>
              <strong className="text-slate-900">Up to 120 Guests</strong>
            </div>
            <div className="flex justify-between">
              <span>Features:</span>
              <span>Open Sky, Fairy Lights, Pergola</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
              <span>Standard Rent:</span>
              <span>₹6,000 / Slot</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 bg-gradient-to-tr from-blue-600 to-indigo-900 p-4 text-white flex flex-col justify-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
              Clubhouse 1st Floor
            </span>
            <h3 className="font-bold text-base">Clubhouse Lounge</h3>
          </div>
          <div className="p-4 text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Capacity:</span>
              <strong className="text-slate-900">Up to 50 Guests</strong>
            </div>
            <div className="flex justify-between">
              <span>Features:</span>
              <span>Sofa Seating, Audio System, Projector</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
              <span>Standard Rent:</span>
              <span>₹4,000 / Slot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table / Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Scheduled Event Bookings & Requests</h3>
          <span className="text-xs text-slate-500">{bookings.length} reservations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Event Date & Slot</th>
                <th className="py-3 px-4">Booked By</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {b.bookingRef}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{b.facility}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{b.eventDate}</div>
                    <div className="text-[10px] text-slate-500">{b.slot}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{b.bookedByName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Flat {b.flatNumber} • {b.contactPhone}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700 text-[10px]">
                      {b.eventType} ({b.attendeeCount} pax)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ₹{b.totalAmount.toLocaleString('en-IN')}
                    <div className="text-[9px] text-slate-400 font-normal">
                      Incl. ₹{b.refundableDeposit.toLocaleString('en-IN')} deposit
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'Pending Committee Approval'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {b.status === 'Pending Committee Approval' &&
                      (currentUser.role === 'committee' || currentUser.role === 'manager') && (
                        <button
                          onClick={() => onApproveBooking(b.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Approve Booking
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Book Common Hall */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Book Common Amenity</h3>
                <div className="text-xs text-indigo-300">
                  Flat {currentUser.flatNumber || 'B-402'} • {currentUser.name}
                </div>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-5 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Facility</label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Community Banquet Hall">Community Banquet Hall (Cap: 200)</option>
                  <option value="Rooftop Terrace Garden">Rooftop Terrace Garden (Cap: 120)</option>
                  <option value="Clubhouse Lounge">Clubhouse Lounge (Cap: 50)</option>
                  <option value="Society Guest Room">Society Guest Room (AC Suite)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Morning (09:00 - 14:00)">Morning (09:00 - 14:00)</option>
                    <option value="Evening (16:00 - 23:00)">Evening (16:00 - 23:00)</option>
                    <option value="Full Day (09:00 - 23:00)">Full Day (09:00 - 23:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  >
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Anniversary">Anniversary Celebration</option>
                    <option value="Festival Gathering">Festival / Cultural Gathering</option>
                    <option value="Puja / Religious">Puja / Religious Ceremony</option>
                    <option value="Meeting">Meeting / Seminar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Attendees</label>
                  <input
                    type="number"
                    value={attendees}
                    onChange={(e) => setAttendees(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Notes / Catering Setup</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Vegetarian buffet setup, projector required..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Pricing Breakdown Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Facility Base Rent:</span>
                  <span className="font-mono">₹{currentPricing.rent.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Mandatory Cleaning & Sanitization:</span>
                  <span className="font-mono">₹{currentPricing.cleaning.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-mono">₹{currentPricing.deposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-sm text-slate-900">
                  <span>Total Payable:</span>
                  <span className="font-mono text-indigo-700">₹{currentPricing.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms and conditions */}
              <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-950 text-[11px]">
                <input
                  type="checkbox"
                  required
                  checked={agreedRules}
                  onChange={(e) => setAgreedRules(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600"
                />
                <span>
                  I agree to the Greenwood Heights Bye-laws: Music / amplified sound must cease by 10:00 PM; no smoking on premises; caterer responsible for proper wet/dry waste segregation. Refundable deposit released within 48h after inspection.
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Pay & Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
