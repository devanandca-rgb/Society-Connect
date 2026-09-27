import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Plus,
  Search,
  Filter,
  Download,
  Phone,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserX,
  Sparkles,
  BadgeCheck,
  DoorOpen,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import type { Visitor, HouseMaid, SocietyUser } from '../types/society';
import { exportVisitorsToExcel } from '../services/excel';

interface VisitorManagementProps {
  visitors: Visitor[];
  maids: HouseMaid[];
  currentUser: SocietyUser;
  onAddVisitor: (visitor: Omit<Visitor, 'id' | 'passNumber' | 'checkInTime' | 'status'>) => void;
  onApproveVisitor: (visitorId: string, approved: boolean) => void;
  onCheckOutVisitor: (visitorId: string) => void;
  onToggleMaidApproval: (maidId: string, flatNumber: string, approved: boolean) => void;
  onLogMaidAttendance: (maidId: string, status: 'Inside Premises' | 'Exited') => void;
}

export const VisitorManagement: React.FC<VisitorManagementProps> = ({
  visitors,
  maids,
  currentUser,
  onAddVisitor,
  onApproveVisitor,
  onCheckOutVisitor,
  onToggleMaidApproval,
  onLogMaidAttendance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visitors' | 'maids'>('visitors');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isNewVisitorModalOpen, setIsNewVisitorModalOpen] = useState(false);
  const [isPreApproveModalOpen, setIsPreApproveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Visitor Form (Gate Entry by Guard or Manager)
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [flatNumber, setFlatNumber] = useState('B-402');
  const [purpose, setPurpose] = useState<Visitor['purpose']>('Guest');
  const [company, setCompany] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [guardRemarks, setGuardRemarks] = useState('');

  // Pre-approve Visitor Form (By Resident)
  const [preVisitorName, setPreVisitorName] = useState('');
  const [prePhone, setPrePhone] = useState('');
  const [prePurpose, setPrePurpose] = useState<Visitor['purpose']>('Guest');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredVisitors = visitors.filter((v) => {
    // If resident, they can see all or specifically their flat
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone.includes(searchTerm) ||
      v.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.passNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGateEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVisitor({
      visitorName,
      phone,
      flatNumber,
      purpose,
      companyOrPlatform: company || undefined,
      vehicleNumber: vehicleNo || undefined,
      gateGuardName: currentUser.role === 'guard' ? currentUser.name : 'Gate 1 Guard',
      guardRemarks,
    });

    setIsNewVisitorModalOpen(false);
    setVisitorName('');
    setPhone('');
    setVehicleNo('');
    showToast(`Visitor ${visitorName} registered at gate. Approval alert dispatched to Flat ${flatNumber}!`);
  };

  const handlePreApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVisitor({
      visitorName: preVisitorName,
      phone: prePhone,
      flatNumber: currentUser.flatNumber || 'B-402',
      purpose: prePurpose,
      gateGuardName: 'Pre-approved Pass',
      isPreApproved: true,
    });

    setIsPreApproveModalOpen(false);
    setPreVisitorName('');
    setPrePhone('');
    showToast(`Pre-approved guest pass created for ${preVisitorName}. Gate guard notified.`);
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
            Visitor & House Help (Maid) Gate Management
          </h2>
          <p className="text-xs text-slate-500">
            Real-time tracking of visitor names, phone numbers, vehicle logs, and resident permission approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={() => exportVisitorsToExcel(visitors)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Gate Log (.xlsx)</span>
          </button>

          {/* Resident: Pre-approve Visitor */}
          {currentUser.role === 'resident' && (
            <button
              onClick={() => setIsPreApproveModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pre-Approve Guest Pass</span>
            </button>
          )}

          {/* Guard or Manager: Log Visitor Entry */}
          {(currentUser.role === 'guard' || currentUser.role === 'manager' || currentUser.role === 'committee') && (
            <button
              onClick={() => setIsNewVisitorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Visitor Gate Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs: Visitors vs House Maids */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('visitors')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeSubTab === 'visitors'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daily Visitors & Deliveries ({visitors.length})
        </button>
        <button
          onClick={() => setActiveSubTab('maids')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeSubTab === 'maids'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          House Maid / Domestic Help Approvals ({maids.length})
        </button>
      </div>

      {/* TAB 1: VISITORS */}
      {activeSubTab === 'visitors' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search visitor name, phone, flat, pass..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {(['All', 'Pending Resident Approval', 'Approved & In Premises', 'Checked Out', 'Denied Entry'] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'Pending Resident Approval'
                      ? 'Pending Approval'
                      : st === 'Approved & In Premises'
                      ? 'Inside'
                      : st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Visitors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Pass No</th>
                    <th className="py-3 px-4">Visitor Name & Phone</th>
                    <th className="py-3 px-4">Visiting Flat</th>
                    <th className="py-3 px-4">Purpose / Vehicle</th>
                    <th className="py-3 px-4">Check-In / Out</th>
                    <th className="py-3 px-4">Resident Approval Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisitors.length > 0 ? (
                    filteredVisitors.map((v) => {
                      const isPending = v.status === 'Pending Resident Approval';
                      const isInside = v.status === 'Approved & In Premises';
                      const isDenied = v.status === 'Denied Entry';

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            {v.passNumber}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{v.visitorName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{v.phone}</div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-900 text-xs px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                              Flat {v.flatNumber}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{v.purpose}</div>
                            {v.vehicleNumber && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                🚗 {v.vehicleNumber}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            <div>In: {v.checkInTime}</div>
                            {v.checkOutTime && (
                              <div className="text-[10px] text-slate-400">Out: {v.checkOutTime}</div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isInside
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : isDenied
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isInside && <CheckCircle2 className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {isDenied && <XCircle className="w-3 h-3" />}
                              {v.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {/* Resident Approval / Denial Controls */}
                            {isPending && (
                              <>
                                <button
                                  onClick={() => onApproveVisitor(v.id, false)}
                                  className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold"
                                >
                                  Deny
                                </button>
                                <button
                                  onClick={() => onApproveVisitor(v.id, true)}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                                >
                                  Allow In
                                </button>
                              </>
                            )}

                            {/* Guard Check-out button */}
                            {isInside && (
                              <button
                                onClick={() => onCheckOutVisitor(v.id)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200"
                              >
                                Mark Check-out
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No visitors matching search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOUSE MAIDS & DOMESTIC HELPS */}
      {activeSubTab === 'maids' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Resident Domestic Help & Maid Authorization</div>
              <p className="text-indigo-800 mt-0.5">
                All domestic workers possess police verified credentials and RFID pass cards. Residents can approve or revoke access for their specific flat below. Security gate monitors live daily inside/exit status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maids.map((maid) => {
              const currentFlat = currentUser.flatNumber || 'B-402';
              const isAssignedToMe = maid.assignedFlats.includes(currentFlat);
              const isApprovedByMe = maid.residentApprovalStatus[currentFlat] ?? false;

              return (
                <div
                  key={maid.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        maid.photoUrl ||
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120'
                      }
                      alt={maid.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{maid.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{maid.phone}</div>
                      <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {maid.rfidPassNumber}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      <strong>Services:</strong> {maid.services.join(', ')}
                    </div>
                    <div>
                      <strong>Assigned Units:</strong>{' '}
                      {maid.assignedFlats.map((f) => (
                        <span
                          key={f}
                          className="inline-block px-1.5 py-0.2 mr-1 rounded bg-slate-100 font-bold text-[10px]"
                        >
                          Flat {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Today */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Gate Entry Today:</div>
                      <div className="font-semibold text-slate-800">
                        {maid.entryStatusToday === 'Inside Premises'
                          ? `In: ${maid.lastEntryTime || '07:30 AM'}`
                          : maid.entryStatusToday === 'Exited'
                          ? `Exited at ${maid.lastExitTime}`
                          : 'Not entered yet'}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        maid.entryStatusToday === 'Inside Premises'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {maid.entryStatusToday}
                    </span>
                  </div>

                  {/* Resident Approval Switch */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      My Flat ({currentFlat}) Pass:
                    </span>

                    <button
                      onClick={() => onToggleMaidApproval(maid.id, currentFlat, !isApprovedByMe)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        isApprovedByMe
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isApprovedByMe ? '✓ Approved' : 'Revoked / Off'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Gate Entry Form (Guard/Manager) */}
      {isNewVisitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Gate 1: Register Incoming Visitor</h3>
                <div className="text-xs text-indigo-300">Security Gate Terminal</div>
              </div>
              <button
                onClick={() => setIsNewVisitorModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGateEntrySubmit} className="p-5 text-xs space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flat to Visit</label>
                  <input
                    type="text"
                    required
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Guest">Personal Guest</option>
                    <option value="Delivery">Courier / Delivery</option>
                    <option value="Cab / Taxi">Cab / Taxi</option>
                    <option value="Home Service">Technician / Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vehicle Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH-02-CB-1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                ⚡ Upon clicking Dispatch, the resident will receive an immediate mobile gate authorization prompt. Entry will be held until allowed.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewVisitorModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Dispatch for Resident Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pre-Approve Guest (Resident) */}
      {isPreApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Generate Pre-Approved Gate Pass</h3>
                <div className="text-xs text-indigo-100">
                  Flat {currentUser.flatNumber || 'B-402'}
                </div>
              </div>
              <button
                onClick={() => setIsPreApproveModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePreApproveSubmit} className="p-5 text-xs space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expected Guest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uncle Vinod & Family"
                  value={preVisitorName}
                  onChange={(e) => setPreVisitorName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guest Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98210 55443"
                  value={prePhone}
                  onChange={(e) => setPrePhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visit Type</label>
                <select
                  value={prePurpose}
                  onChange={(e) => setPrePurpose(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Guest">Social Guest / Relative</option>
                  <option value="Home Service">Contractor / Technician</option>
                  <option value="Delivery">Scheduled Delivery</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                ✓ Pre-approved guests will be waved through Gate 1 without disturbing you for phone approval.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPreApproveModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Issue Pre-Approved Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
