import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Flame,
  Activity,
  Shield,
  Copy,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Wrench,
  X,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { EmergencyContact, SocietyUser } from '../types/society';

interface EmergencyDashboardProps {
  contacts: EmergencyContact[];
  currentUser: SocietyUser;
  onTriggerSos: (emergencyType: string, flatNumber: string) => void;
}

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  contacts,
  currentUser,
  onTriggerSos,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState('Medical Emergency');
  const [sosSentSuccess, setSosSentSuccess] = useState(false);

  const handleCopy = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendSos = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerSos(selectedEmergency, currentUser.flatNumber || 'B-402');
    setSosSentSuccess(true);
    setTimeout(() => {
      setSosSentSuccess(false);
      setIsSosModalOpen(false);
    }, 3000);
  };

  const getCategoryIcon = (category: EmergencyContact['category']) => {
    switch (category) {
      case 'Police':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'Hospital & Ambulance':
        return <Activity className="w-5 h-5 text-rose-600" />;
      case 'Fire Brigade':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'Society Urgent Services':
        return <Wrench className="w-5 h-5 text-emerald-600" />;
      default:
        return <PhoneCall className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Emergency SOS Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/25 text-[10px] font-bold uppercase tracking-wider mb-1">
              Immediate Critical Response
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Emergency Services & 24x7 Helplines
            </h2>
            <p className="text-xs text-rose-100 max-w-xl mt-0.5">
              Verified emergency contacts for Greenwood Heights. In life-threatening emergencies, trigger the Society SOS button below to alert Security Gate 1 & Estate Management immediately.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSosModalOpen(true)}
          className="px-6 py-3 bg-white text-rose-700 hover:bg-rose-50 rounded-xl font-black text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Radio className="w-4 h-4 text-rose-600 animate-ping" />
          <span>TRIGGER SOCIETY SOS ALARM</span>
        </button>
      </div>

      {/* Grid of Emergency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {getCategoryIcon(c.category)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {c.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {c.title}
                </h3>
                <div className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
                  {c.nameOrStation}
                </div>
              </div>
            </div>

            {/* Address & distance */}
            <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{c.address}</span>
              </div>
              {c.distanceKm && (
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-[11px]">
                  <span>Distance: {c.distanceKm}</span>
                </div>
              )}
              {c.officerInCharge && (
                <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                  <strong>Officer:</strong> {c.officerInCharge}
                </div>
              )}
            </div>

            {c.notes && (
              <p className="text-[11px] text-slate-500 italic">
                {c.notes}
              </p>
            )}

            {/* Direct Dial Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`tel:${c.primaryPhone}`}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {c.primaryPhone}</span>
              </a>

              <button
                onClick={() => handleCopy(c.primaryPhone, c.id)}
                title="Copy phone number"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                {copiedId === c.id ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SOS Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-rose-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-rose-600 to-red-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-base">Society Emergency SOS Dispatch</h3>
              </div>
              <button
                onClick={() => setIsSosModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sosSentSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  SOS Alarm Dispatched to Gate 1!
                </h4>
                <p className="text-xs text-slate-600">
                  Security Supervisor Maninder Singh and Estate Manager Vikram have been alerted for{' '}
                  <strong>Flat {currentUser.flatNumber || 'B-402'}</strong>. An emergency responder is en route.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendSos} className="p-5 text-xs space-y-4">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 font-medium">
                  Broadcasting from: <strong>Flat {currentUser.flatNumber || 'B-402'}</strong> ({currentUser.name})
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-2">
                    Select Nature of Emergency:
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'Medical Emergency', label: '🚑 Medical Emergency / Cardiac / Collapse' },
                      { id: 'Fire / Smoke', label: '🔥 Fire, Gas Leakage or Smoke Detected' },
                      { id: 'Security Intruder', label: '🚨 Security Threat / Unauthorized Intruder' },
                      { id: 'Lift Entrapment', label: '🛗 Passenger Trapped Inside Elevator' },
                    ].map((em) => (
                      <label
                        key={em.id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer font-semibold transition-colors ${
                          selectedEmergency === em.id
                            ? 'border-rose-600 bg-rose-50 text-rose-900'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="emergencyType"
                          value={em.id}
                          checked={selectedEmergency === em.id}
                          onChange={() => setSelectedEmergency(em.id)}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span>{em.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl text-slate-600 text-[11px]">
                  ⚠️ False alarms are recorded in the society register. Use only in genuine emergencies.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSosModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-900/30 flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>BROADCAST PANIC ALARM</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
