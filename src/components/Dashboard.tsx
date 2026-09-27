import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Receipt,
  CheckCircle,
  Clock,
  Home,
  UserCheck,
  Calendar,
  Wrench,
  Megaphone,
  Shield,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import type {
  SocietyUser,
  MaintenanceInvoice,
  Complaint,
  RentalFlat,
  Visitor,
  AmcContract,
  CommonHallBooking,
  Notice,
} from '../types/society';

interface DashboardProps {
  currentUser: SocietyUser;
  invoices: MaintenanceInvoice[];
  complaints: Complaint[];
  rentals: RentalFlat[];
  visitors: Visitor[];
  amcs: AmcContract[];
  bookings: CommonHallBooking[];
  notices: Notice[];
  onNavigate: (tab: any) => void;
  onPayBillClick?: (invoice: MaintenanceInvoice) => void;
  onTakeComplaintAction?: (complaint: Complaint) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  invoices,
  complaints,
  rentals,
  visitors,
  amcs,
  bookings,
  notices,
  onNavigate,
  onPayBillClick,
  onTakeComplaintAction,
}) => {
  // Aggregate stats
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOverdue = invoices
    .filter((inv) => inv.status === 'Overdue' || inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  const openComplaints = complaints.filter(
    (c) => c.status !== 'Resolved'
  );
  const escalatedToCommittee = complaints.filter(
    (c) => c.status === 'Escalated to Committee'
  );

  const pendingNocRentals = rentals.filter(
    (r) => r.policeNocStatus === 'Pending Submission' || r.policeNocStatus === 'Expired'
  );
  const unpaidLiftRentals = rentals.filter((r) => !r.liftChargesPaid);

  const visitorsInside = visitors.filter((v) => v.status === 'Approved & In Premises');
  const visitorsWaiting = visitors.filter((v) => v.status === 'Pending Resident Approval');

  const expiringAmcs = amcs.filter((a) => a.status === 'Expiring in 30 Days');

  // Resident specific data
  const myFlatInvoices = invoices.filter(
    (i) => i.flatNumber === currentUser.flatNumber
  );
  const myPendingInvoice = myFlatInvoices.find(
    (i) => i.status === 'Unpaid' || i.status === 'Overdue'
  );
  const myComplaints = complaints.filter(
    (c) => c.flatNumber === currentUser.flatNumber
  );
  const myBookings = bookings.filter(
    (b) => b.flatNumber === currentUser.flatNumber
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-xs border border-indigo-500/30 mb-3">
            <span>Greenwood Heights ERP System</span>
            <span>•</span>
            <span className="capitalize">{currentUser.role} Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {currentUser.role === 'committee' &&
              'Managing Committee Executive Console: oversee society governance, sanction complaint repair budgets, verify rental flats, and review financial audits.'}
            {currentUser.role === 'manager' &&
              'Society Operations Command: raise quarterly invoices, monitor payment overdue aging, coordinate vendor AMCs, and track rental agreements.'}
            {currentUser.role === 'resident' &&
              `Apartment ${currentUser.flatNumber || 'B-402'} Resident Dashboard: view quarterly maintenance dues, raise maintenance requests, book common facilities, and approve visitors.`}
            {currentUser.role === 'guard' &&
              'Security Gate 1 Terminal: log visitor entry & vehicles, verify house maid passes, and monitor incoming resident approvals.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {currentUser.role === 'resident' && myPendingInvoice && (
              <button
                onClick={() => onPayBillClick?.(myPendingInvoice)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/40 transition-all hover:scale-105"
              >
                Pay Maintenance Due (₹{myPendingInvoice.totalAmount.toLocaleString('en-IN')})
              </button>
            )}

            {currentUser.role === 'manager' && (
              <button
                onClick={() => onNavigate('invoices')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Generate Invoices</span>
              </button>
            )}

            {currentUser.role === 'committee' && (
              <button
                onClick={() => onNavigate('complaints')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Review Escalations ({escalatedToCommittee.length})</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('notices')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium backdrop-blur-xs border border-white/15 transition-all flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5 text-indigo-300" />
              <span>Notice Board</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 -bottom-10 w-96 opacity-10 bg-radial from-indigo-400 to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Maintenance / Dues */}
        <div
          onClick={() => onNavigate('invoices')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentUser.role === 'resident' ? 'My Dues' : 'Total Overdue Dues'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ₹
              {currentUser.role === 'resident'
                ? (myPendingInvoice?.totalAmount || 0).toLocaleString('en-IN')
                : totalOverdue.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center text-xs text-rose-600 font-medium">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {currentUser.role === 'resident'
                ? myPendingInvoice ? 'Due date: Oct 15' : 'All clear'
                : `${invoices.filter((i) => i.status === 'Overdue').length} units in default`}
            </div>
          </div>
        </div>

        {/* Card 2: Complaints */}
        <div
          onClick={() => onNavigate('complaints')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Open Complaints
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {currentUser.role === 'resident' ? myComplaints.length : openComplaints.length}
            </div>
            <div className="mt-1 text-xs text-amber-700 font-medium">
              {escalatedToCommittee.length > 0
                ? `${escalatedToCommittee.length} escalated to Committee`
                : 'All being tracked'}
            </div>
          </div>
        </div>

        {/* Card 3: Rental Flats / Compliance */}
        <div
          onClick={() => onNavigate('rentals')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rental Flats
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {rentals.length} Flats
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              <span className="text-orange-600 font-semibold">{pendingNocRentals.length}</span> pending Police NOC
            </div>
          </div>
        </div>

        {/* Card 4: AMC Expiry & Vendors */}
        <div
          onClick={() => onNavigate('vendors')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              AMC Contracts
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {amcs.length} Active
            </div>
            <div className="mt-1 text-xs font-medium">
              {expiringAmcs.length > 0 ? (
                <span className="text-amber-600 font-semibold">
                  ⚠️ {expiringAmcs.length} expiring in 30 days
                </span>
              ) : (
                <span className="text-emerald-600">All AMCs healthy</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Live Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Urgent Attention / Action Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Managing Committee Action Box (when committee is logged in) */}
          {currentUser.role === 'committee' && (
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    MC
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Committee Action Pending: Complaint Escalations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Complaints requiring Managing Committee executive decisions & fund sanction
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {escalatedToCommittee.length} Urgent
                </span>
              </div>

              {escalatedToCommittee.map((comp) => (
                <div
                  key={comp.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[10px]">
                        {comp.category} • {comp.priority} Priority
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {comp.title}
                      </h4>
                      <p className="text-slate-600 mt-1">{comp.description}</p>
                    </div>
                    <span className="text-slate-400 shrink-0 font-mono">
                      {comp.flatNumber}
                    </span>
                  </div>

                  {comp.managerNotes && (
                    <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900">
                      <strong>Manager Note:</strong> {comp.managerNotes}
                    </div>
                  )}

                  {comp.committeeAction ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                      <div>
                        <strong>Action Approved:</strong> {comp.committeeAction.actionTaken} (Budget: ₹{comp.committeeAction.approvedBudget?.toLocaleString('en-IN')})
                        <div className="text-[11px] text-emerald-700 mt-0.5">
                          Approved by {comp.committeeAction.committeeMemberName} on {comp.committeeAction.actionDate}
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                        Sanctioned
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => onTakeComplaintAction?.(comp)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                      >
                        Sanction Budget & Take Committee Action
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Overdue Collection Aging Table (Society Manager & Committee) */}
          {(currentUser.role === 'manager' || currentUser.role === 'committee') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Maintenance Invoices & Overdue Tracker
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defaulter tracking and pending quarterly dues
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('invoices')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>View All Invoices</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Flat</th>
                      <th className="py-2.5 px-3">Resident</th>
                      <th className="py-2.5 px-3">Quarter</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Aging</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.slice(0, 5).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {inv.flatNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {inv.residentName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {inv.quarter}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          ₹{inv.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {inv.overdueDays ? `${inv.overdueDays} days` : 'On track'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resident Specific Bills & Maintenance Card */}
          {currentUser.role === 'resident' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    My Flat Maintenance Bills (Flat {currentUser.flatNumber})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quarterly maintenance breakdown and payment history
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('invoices')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Detailed Breakup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {myFlatInvoices.length > 0 ? (
                <div className="space-y-3">
                  {myFlatInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {inv.quarter}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-1">
                          Invoice #{inv.invoiceNo} • Due Date: {inv.dueDate}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">
                            ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {inv.status === 'Paid' ? `Paid via ${inv.paymentMethod}` : 'Pending payment'}
                          </div>
                        </div>

                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => onPayBillClick?.(inv)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            Pay Online
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No invoices generated for this flat yet.</p>
              )}
            </div>
          )}

          {/* Rental Flats Critical Compliance (Police NOC & Lift Charges) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Rental Flat Compliance Tracker
                </h3>
                <p className="text-xs text-slate-500">
                  Police NOC submission and shifting lift charges monitoring
                </p>
              </div>
              <button
                onClick={() => onNavigate('rentals')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Full Rental Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rentals.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      Flat {r.flatNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.policeNocStatus === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.policeNocStatus === 'Pending Submission'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      NOC: {r.policeNocStatus}
                    </span>
                  </div>

                  <div className="text-slate-600 text-[11px]">
                    <strong>Tenant:</strong> {r.tenantName} ({r.tenantPhone})
                  </div>

                  <div className="text-slate-500 text-[11px]">
                    Agreement: {r.agreementStartDate} to {r.agreementEndDate}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">Lift Shifting Fee:</span>
                    <span
                      className={`font-bold text-[11px] ${
                        r.liftChargesPaid ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {r.liftChargesPaid ? '✓ Paid (₹2,000)' : '⚠️ Unpaid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Live Operations, Gate Passes & Notices */}
        <div className="space-y-6">
          {/* Live Gate Pass & Visitors Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 text-sm">Gate 1 Live Visitors</h3>
              </div>
              <button
                onClick={() => onNavigate('visitors')}
                className="text-xs text-indigo-600 font-semibold"
              >
                Gate Log
              </button>
            </div>

            <div className="space-y-2.5">
              {visitors.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{v.visitorName}</div>
                    <div className="text-[10px] text-slate-500">
                      Visiting: <strong>Flat {v.flatNumber}</strong> • {v.purpose}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.status === 'Approved & In Premises'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.status === 'Pending Resident Approval'
                        ? 'bg-amber-100 text-amber-800'
                        : v.status === 'Denied Entry'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {v.status === 'Approved & In Premises'
                      ? 'Inside'
                      : v.status === 'Pending Resident Approval'
                      ? 'Waiting'
                      : v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AMC Contracts & Expiry Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">AMC Contract Watch</h3>
              <button
                onClick={() => onNavigate('vendors')}
                className="text-xs text-indigo-600 font-semibold"
              >
                All AMCs
              </button>
            </div>

            <div className="space-y-2.5">
              {amcs.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{a.serviceCategory}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        a.status === 'Expiring in 30 Days'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">{a.vendorName}</div>
                  <div className="text-[10px] text-slate-400">
                    Expiry: {a.endDate} • Value: ₹{a.annualValue.toLocaleString('en-IN')}/yr
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Notices & Circulars */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Latest Notices</h3>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs text-indigo-600 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  onClick={() => onNavigate('notices')}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:border-indigo-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-indigo-600">{n.category}</span>
                    <span>{n.publishedDate}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 leading-snug">{n.title}</h4>
                  <p className="text-slate-600 text-[11px] line-clamp-2 mt-1">
                    {n.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
