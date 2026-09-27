import React, { useState } from 'react';
import {
  Home,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Search,
  Filter,
  CreditCard,
  User,
  Phone,
  Calendar,
  X,
  Send,
  HardDrive,
} from 'lucide-react';
import type { RentalFlat, SocietyUser } from '../types/society';
import { exportRentalFlatsToExcel } from '../services/excel';

interface RentalFlatManagementProps {
  rentals: RentalFlat[];
  currentUser: SocietyUser;
  onAddRentalFlat: (flat: Omit<RentalFlat, 'id'>) => void;
  onUpdateRentalFlat: (id: string, updates: Partial<RentalFlat>) => void;
  onSaveToDrive?: (flat: RentalFlat) => void;
}

export const RentalFlatManagement: React.FC<RentalFlatManagementProps> = ({
  rentals,
  currentUser,
  onAddRentalFlat,
  onUpdateRentalFlat,
  onSaveToDrive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nocFilter, setNocFilter] = useState<string>('All');
  const [liftFilter, setLiftFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<RentalFlat | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [flatNumber, setFlatNumber] = useState('C-302');
  const [wing, setWing] = useState('C');
  const [ownerName, setOwnerName] = useState('Rameshwar Kulkarni');
  const [ownerPhone, setOwnerPhone] = useState('+91 98201 99881');
  const [ownerEmail, setOwnerEmail] = useState('kulkarni.r@gmail.com');
  const [tenantName, setTenantName] = useState('Abhishek Bansal');
  const [tenantPhone, setTenantPhone] = useState('+91 97690 55412');
  const [tenantEmail, setTenantEmail] = useState('abhishek.b@techfirm.com');
  const [familyMembers, setFamilyMembers] = useState(2);
  const [occupation, setOccupation] = useState('Software Engineer');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2027-09-30');
  const [monthlyRent, setMonthlyRent] = useState(45000);
  const [deposit, setDeposit] = useState(150000);
  const [liftChargesPaid, setLiftChargesPaid] = useState(false);
  const [policeNocStatus, setPoliceNocStatus] = useState<RentalFlat['policeNocStatus']>('Pending Submission');
  const [policeStation, setPoliceStation] = useState('Bandra West Police Station');
  const [policeNocRef, setPoliceNocRef] = useState('');
  const [notes, setNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRentals = rentals.filter((r) => {
    const matchesSearch =
      r.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.policeStationName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNoc = nocFilter === 'All' ? true : r.policeNocStatus === nocFilter;
    const matchesLift =
      liftFilter === 'All'
        ? true
        : liftFilter === 'Paid'
        ? r.liftChargesPaid
        : !r.liftChargesPaid;

    return matchesSearch && matchesNoc && matchesLift;
  });

  const totalFlats = rentals.length;
  const verifiedNocCount = rentals.filter((r) => r.policeNocStatus === 'Verified').length;
  const pendingNocCount = rentals.filter((r) => r.policeNocStatus === 'Pending Submission').length;
  const unpaidLiftCount = rentals.filter((r) => !r.liftChargesPaid).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRental: Omit<RentalFlat, 'id'> = {
      flatNumber,
      wing,
      ownerName,
      ownerPhone,
      ownerEmail,
      tenantName,
      tenantPhone,
      tenantEmail,
      tenantFamilyMembers: familyMembers,
      tenantOccupation: occupation,
      agreementStartDate: startDate,
      agreementEndDate: endDate,
      monthlyRent,
      depositAmount: deposit,
      liftChargesPaid,
      liftChargesAmount: 2000,
      liftChargesPaymentDate: liftChargesPaid ? new Date().toISOString().split('T')[0] : undefined,
      policeNocStatus,
      policeNocRefNumber: policeNocRef || undefined,
      policeStationName: policeStation,
      notes,
      status: 'Active',
    };

    onAddRentalFlat(newRental);
    setIsAddModalOpen(false);
    showToast(`Rental flat ${flatNumber} registered successfully!`);
  };

  const handleToggleLiftPaid = (flat: RentalFlat) => {
    const newPaidStatus = !flat.liftChargesPaid;
    onUpdateRentalFlat(flat.id, {
      liftChargesPaid: newPaidStatus,
      liftChargesPaymentDate: newPaidStatus ? new Date().toISOString().split('T')[0] : undefined,
    });
    showToast(
      `Lift usage charge for Flat ${flat.flatNumber} marked as ${
        newPaidStatus ? 'PAID (₹2,000)' : 'UNPAID'
      }`
    );
  };

  const handleUpdateNocStatus = (flat: RentalFlat, newStatus: RentalFlat['policeNocStatus']) => {
    const ref = newStatus === 'Verified' ? `POL-MUM-SR-${Date.now().toString().slice(-4)}` : flat.policeNocRefNumber;
    onUpdateRentalFlat(flat.id, {
      policeNocStatus: newStatus,
      policeNocRefNumber: ref,
      policeNocDate: newStatus === 'Verified' ? new Date().toISOString().split('T')[0] : flat.policeNocDate,
    });
    showToast(`Police NOC status for Flat ${flat.flatNumber} updated to: ${newStatus}`);
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Rental Flat Management & Lease Registry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              {currentUser.role === 'committee' ? 'MC Oversight' : 'Manager Operations'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Agreement period tracking (From - To), shifting lift charges compliance (₹2,000), and Police NOC verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportRentalFlatsToExcel(rentals)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Registry (.xlsx)</span>
          </button>

          {(currentUser.role === 'manager' || currentUser.role === 'committee') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Rental Agreement</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Rented Flats
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalFlats}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {((totalFlats / 80) * 100).toFixed(0)}% of total society units
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Police NOC Verified
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{verifiedNocCount}</div>
          <div className="text-xs text-emerald-700 font-medium mt-0.5">
            ✓ Full Police clearance on record
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Police NOC Pending
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingNocCount}</div>
          <div className="text-xs text-amber-700 font-medium mt-0.5">
            ⚠️ Notice sent to flat owners
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Unpaid Shifting Lift Charges
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{unpaidLiftCount}</div>
          <div className="text-xs text-rose-600 font-medium mt-0.5">
            ₹{(unpaidLiftCount * 2000).toLocaleString('en-IN')} uncollected fee
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search flat, tenant, owner, police station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* NOC Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Police NOC:</span>
            <select
              value={nocFilter}
              onChange={(e) => setNocFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All</option>
              <option value="Verified">Verified</option>
              <option value="Pending Submission">Pending Submission</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Lift Charges Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Lift Fee:</span>
            <select
              value={liftFilter}
              onChange={(e) => setLiftFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All</option>
              <option value="Paid">Paid (₹2,000)</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rental Flats Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Flat No</th>
                <th className="py-3 px-4">Tenant Information</th>
                <th className="py-3 px-4">Flat Owner</th>
                <th className="py-3 px-4">Agreement Period</th>
                <th className="py-3 px-4">Lift Shifting Fee</th>
                <th className="py-3 px-4">Police NOC Status</th>
                <th className="py-3 px-4 text-right">Actions / Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRentals.length > 0 ? (
                filteredRentals.map((r) => {
                  const isExpiringSoon = r.status === 'Expiring Soon';
                  const isExpired = r.status === 'Expired';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          Flat {r.flatNumber}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Wing {r.wing}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.tenantName}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.tenantPhone} • {r.tenantFamilyMembers} occupants
                        </div>
                        <div className="text-[10px] text-slate-400">{r.tenantOccupation}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{r.ownerName}</div>
                        <div className="text-[11px] text-slate-500">{r.ownerPhone}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {r.agreementStartDate} to {r.agreementEndDate}
                        </div>
                        <div className="mt-0.5">
                          {isExpiringSoon && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                              Expiring Soon (&lt;30d)
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              Expired
                            </span>
                          )}
                          {!isExpiringSoon && !isExpired && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                              Active Lease
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleLiftPaid(r)}
                          title="Click to toggle Paid/Unpaid"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            r.liftChargesPaid
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 ring-1 ring-rose-300'
                          }`}
                        >
                          {r.liftChargesPaid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid (₹2,000)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Unpaid (₹2,000)</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              r.policeNocStatus === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.policeNocStatus === 'Pending Submission'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{r.policeNocStatus}</span>
                          </span>

                          <div className="text-[10px] text-slate-500">
                            {r.policeStationName}
                            {r.policeNocRefNumber && (
                              <div className="font-mono text-slate-400">Ref: {r.policeNocRefNumber}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Quick Police NOC Toggle for Society Manager */}
                        {r.policeNocStatus !== 'Verified' && (
                          <button
                            onClick={() => handleUpdateNocStatus(r, 'Verified')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Approve NOC
                          </button>
                        )}

                        {r.policeNocStatus === 'Verified' && (
                          <button
                            onClick={() => handleUpdateNocStatus(r, 'Pending Submission')}
                            className="px-2 py-1 text-slate-500 hover:text-slate-700 rounded-lg text-xs"
                            title="Reset to Pending"
                          >
                            Mark Pending
                          </button>
                        )}

                        {onSaveToDrive && (
                          <button
                            onClick={() => onSaveToDrive(r)}
                            title="Backup Agreement to Google Drive"
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <HardDrive className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No rental flats matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Rental Flat Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Register Rental Flat Agreement</h3>
                <div className="text-xs text-blue-200">Society Manager Lease Registry</div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Flat Number</label>
                  <input
                    type="text"
                    required
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Wing</label>
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="A">Wing A</option>
                    <option value="B">Wing B</option>
                    <option value="C">Wing C</option>
                    <option value="D">Wing D</option>
                  </select>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2">
                    Flat Owner Details
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Owner Full Name"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Owner Phone Number"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2">
                    Tenant Information
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Tenant Full Name"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Tenant Contact Phone"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Occupants Count"
                      value={familyMembers}
                      onChange={(e) => setFamilyMembers(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Occupation"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2">
                    Agreement Period & Shifting Charges
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 text-[10px] block">Agreement From Date</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 text-[10px] block">Agreement To Date</label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="font-bold text-slate-800">Lift Shifting Fee (₹2,000)</div>
                    <div className="text-[10px] text-slate-500">
                      Mandatory one-time fee for lift protective padding and wear
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-indigo-700">
                    <input
                      type="checkbox"
                      checked={liftChargesPaid}
                      onChange={(e) => setLiftChargesPaid(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Paid</span>
                  </label>
                </div>

                <div className="col-span-2 border-t border-slate-100 pt-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-2">
                    Police Verification / NOC Details
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 text-[10px] block">Police NOC Status</label>
                      <select
                        value={policeNocStatus}
                        onChange={(e) => setPoliceNocStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      >
                        <option value="Verified">Verified & Valid</option>
                        <option value="Pending Submission">Pending Submission</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-500 text-[10px] block">Police Station Name</label>
                      <input
                        type="text"
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-slate-500 text-[10px] block">Police NOC Reference Number</label>
                      <input
                        type="text"
                        placeholder="e.g. POL-MUM-SR-2026-9921"
                        value={policeNocRef}
                        onChange={(e) => setPoliceNocRef(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save & Register Flat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
