import React, { useState } from 'react';
import {
  Receipt,
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  CreditCard,
  Building,
  Calendar,
  FileSpreadsheet,
  X,
  HardDrive,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { MaintenanceInvoice, SocietyUser, UserRole } from '../types/society';
import { exportInvoicesToExcel } from '../services/excel';

interface MaintenanceInvoicesProps {
  invoices: MaintenanceInvoice[];
  currentUser: SocietyUser;
  onPayInvoice: (invoiceId: string, paymentMethod: 'UPI' | 'NetBanking' | 'CreditCard') => void;
  onGenerateInvoice: (newInvoice: Omit<MaintenanceInvoice, 'id'>) => void;
  onSaveToDrive?: (invoice: MaintenanceInvoice) => void;
}

export const MaintenanceInvoices: React.FC<MaintenanceInvoicesProps> = ({
  invoices,
  currentUser,
  onPayInvoice,
  onGenerateInvoice,
  onSaveToDrive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Overdue'>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<MaintenanceInvoice | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NetBanking' | 'CreditCard'>('UPI');
  const [isGeneratingModalOpen, setIsGeneratingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Invoice Form State for Society Manager
  const [newInvFlat, setNewInvFlat] = useState('B-402');
  const [newInvResident, setNewInvResident] = useState('Dr. Ananya Iyer');
  const [newInvType, setNewInvType] = useState<'Owner' | 'Tenant'>('Owner');
  const [newInvQuarter, setNewInvQuarter] = useState('Q3 (Oct - Dec 2026)');
  const [newInvDueDate, setNewInvDueDate] = useState('2026-10-25');
  const [newInvArea, setNewInvArea] = useState(1250);
  const [serviceCharges, setServiceCharges] = useState(3500);
  const [sinkingFund, setSinkingFund] = useState(1500);
  const [repairMaint, setRepairMaint] = useState(1800);
  const [waterCharges, setWaterCharges] = useState(800);
  const [liftElectricity, setLiftElectricity] = useState(1275);
  const [parkingCharges, setParkingCharges] = useState(500);
  const [nonOccupancy, setNonOccupancy] = useState(0);

  const calculatedTotal =
    serviceCharges + sinkingFund + repairMaint + waterCharges + liftElectricity + parkingCharges + nonOccupancy;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    // If resident, only show their flat unless they want to see all
    if (currentUser.role === 'resident' && inv.flatNumber !== currentUser.flatNumber) {
      return false;
    }

    const matchesSearch =
      inv.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Overdue calculations
  const totalOverdueAmount = invoices
    .filter((i) => i.status === 'Overdue')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  const overdueInvoicesCount = invoices.filter((i) => i.status === 'Overdue').length;

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    onPayInvoice(selectedInvoice.id, paymentMethod);
    setIsPaymentModalOpen(false);

    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast(`Payment of ₹${selectedInvoice.totalAmount.toLocaleString('en-IN')} successful for ${selectedInvoice.flatNumber}! Receipt generated.`);
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv: Omit<MaintenanceInvoice, 'id'> = {
      invoiceNo: `INV-2026-Q3-${newInvFlat.replace('-', '')}`,
      flatNumber: newInvFlat,
      residentName: newInvResident,
      residentType: newInvType,
      quarter: newInvQuarter,
      financialYear: '2026-2027',
      dueDate: newInvDueDate,
      generatedDate: new Date().toISOString().split('T')[0],
      areaSqFt: newInvArea,
      breakdown: {
        serviceCharges,
        sinkingFund,
        repairAndMaintenance: repairMaint,
        waterCharges,
        liftAndElectricity: liftElectricity,
        parkingCharges,
        nonOccupancyCharges: nonOccupancy > 0 ? nonOccupancy : undefined,
        lateFeePenalty: 0,
      },
      totalAmount: calculatedTotal,
      paidAmount: 0,
      status: 'Unpaid',
      overdueDays: 0,
    };

    onGenerateInvoice(newInv);
    setIsGeneratingModalOpen(false);
    showToast(`Quarterly Maintenance Invoice generated for ${newInvFlat}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {currentUser.role === 'resident'
              ? 'My Maintenance Bills & Receipts'
              : 'Maintenance Invoicing & Overdue Management'}
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'resident'
              ? 'View quarterly breakdown of society charges, sinking fund, and pay dues online.'
              : 'Society Manager bill generator, overdue aging tracking, and payment ledger.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={() => exportInvoicesToExcel(invoices)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Invoices (.xlsx)</span>
          </button>

          {/* Society Manager Invoice Generator */}
          {(currentUser.role === 'manager' || currentUser.role === 'committee') && (
            <button
              onClick={() => setIsGeneratingModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Raise New Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards for Manager / Committee */}
      {currentUser.role !== 'resident' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Invoices Dispatched
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {invoices.length} Bills
            </div>
            <div className="text-xs text-slate-500 mt-0.5">FY 2026-2027 Active Cycle</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Overdue Amount
            </span>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              ₹{totalOverdueAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-rose-600 font-medium mt-0.5">
              ⚠️ {overdueInvoicesCount} flats currently defaulting
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Collection Efficiency
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {(
                (invoices.reduce((acc, i) => acc + i.paidAmount, 0) /
                  invoices.reduce((acc, i) => acc + i.totalAmount, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
            <div className="text-xs text-emerald-700 mt-0.5">Target: 95%+ by AGM</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search flat number, resident, invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['All', 'Paid', 'Unpaid', 'Overdue'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Flat No</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Quarter</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {inv.flatNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{inv.residentName}</div>
                      <div className="text-[10px] text-slate-400">{inv.residentType}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.quarter}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{inv.dueDate}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status === 'Paid' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {inv.status}
                        {inv.overdueDays ? ` (${inv.overdueDays}d)` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* View Breakdown */}
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
                      >
                        Breakdown
                      </button>

                      {/* Pay Online Button (Resident or Manager testing) */}
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          Pay Now
                        </button>
                      )}

                      {/* Save to Drive */}
                      {onSaveToDrive && (
                        <button
                          onClick={() => onSaveToDrive(inv)}
                          title="Save Invoice PDF to Google Drive"
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <HardDrive className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No invoices matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Breakdown Modal */}
      {selectedInvoice && !isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
                  Official Maintenance Bill
                </div>
                <h3 className="text-base font-bold">{selectedInvoice.invoiceNo}</h3>
                <div className="text-xs text-slate-300">
                  Flat {selectedInvoice.flatNumber} • {selectedInvoice.residentName}
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 text-xs space-y-4">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-slate-600">
                <div>
                  <span className="text-slate-400">Quarter:</span> {selectedInvoice.quarter}
                </div>
                <div>
                  <span className="text-slate-400">Due Date:</span> {selectedInvoice.dueDate}
                </div>
                <div>
                  <span className="text-slate-400">Area:</span> {selectedInvoice.areaSqFt} Sq.Ft
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{' '}
                  <strong className={selectedInvoice.status === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}>
                    {selectedInvoice.status}
                  </strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">Itemized Charges Breakdown</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex justify-between p-2.5">
                    <span>Service Charges (Housekeeping, Security, Garden)</span>
                    <span className="font-mono font-semibold">
                      ₹{selectedInvoice.breakdown.serviceCharges.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span>Sinking Fund (Statutory Reserve Pool)</span>
                    <span className="font-mono font-semibold">
                      ₹{selectedInvoice.breakdown.sinkingFund.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span>Repair & Building Maintenance Fund</span>
                    <span className="font-mono font-semibold">
                      ₹{selectedInvoice.breakdown.repairAndMaintenance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span>Water Utility Charges</span>
                    <span className="font-mono font-semibold">
                      ₹{selectedInvoice.breakdown.waterCharges.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span>Lift Maintenance & Common Electricity</span>
                    <span className="font-mono font-semibold">
                      ₹{selectedInvoice.breakdown.liftAndElectricity.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span>Parking Slot Charges</span>
                    <span className="font-mono font-semibold">
                      ₹{selectedInvoice.breakdown.parkingCharges.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedInvoice.breakdown.nonOccupancyCharges && (
                    <div className="flex justify-between p-2.5 text-amber-800 bg-amber-50/50">
                      <span>Non-Occupancy Charges (10% Service Fee)</span>
                      <span className="font-mono font-semibold">
                        ₹{selectedInvoice.breakdown.nonOccupancyCharges.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.breakdown.lateFeePenalty ? (
                    <div className="flex justify-between p-2.5 text-rose-700 bg-rose-50/50">
                      <span>Late Payment Interest / Penalty</span>
                      <span className="font-mono font-semibold">
                        ₹{selectedInvoice.breakdown.lateFeePenalty.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between p-3 bg-slate-50 text-slate-900 font-bold text-sm">
                    <span>Total Quarterly Dues Payable</span>
                    <span className="font-mono">
                      ₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {selectedInvoice.status === 'Paid' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between">
                  <div>
                    <div className="font-bold">Payment Settled</div>
                    <div className="text-[11px] text-emerald-700">
                      Paid on {selectedInvoice.paymentDate} via {selectedInvoice.paymentMethod}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Ref: {selectedInvoice.transactionRef}
                    </div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {onSaveToDrive && (
                  <button
                    onClick={() => onSaveToDrive(selectedInvoice)}
                    className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold flex items-center gap-1.5"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Save to Google Drive</span>
                  </button>
                )}

                {selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Proceed to Pay (₹{selectedInvoice.totalAmount.toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Payment Simulator Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Society Bill Payment Gateway</h3>
                <div className="text-xs text-emerald-100">
                  Flat {selectedInvoice.flatNumber} • {selectedInvoice.quarter}
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="p-5 text-xs space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500">Payable to Greenwood Heights CHS</div>
                  <div className="text-xl font-bold text-slate-900">
                    ₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  Bill No: {selectedInvoice.invoiceNo}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-2">Select Payment Method</label>
                <div className="space-y-2">
                  {[
                    { id: 'UPI', label: 'Instant UPI (Google Pay / PhonePe / Paytm / BHIM)', desc: 'Zero surcharge' },
                    { id: 'NetBanking', label: 'Net Banking (HDFC, ICICI, SBI, Axis)', desc: 'Direct bank transfer' },
                    { id: 'CreditCard', label: 'Debit / Credit Card', desc: 'Visa, Mastercard, RuPay' },
                  ].map((m) => (
                    <label
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        paymentMethod === m.id
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === m.id}
                        onChange={() => {}}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">{m.label}</div>
                        <div className="text-[10px] text-slate-500">{m.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                🔒 256-bit encrypted simulated transaction. Instant official society receipt will be stamped and issued.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Authorize ₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Society Manager: Raise Invoice Modal */}
      {isGeneratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Generate Quarterly Maintenance Bill</h3>
                <div className="text-xs text-indigo-100">
                  Society Manager Billing Tool
                </div>
              </div>
              <button
                onClick={() => setIsGeneratingModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="p-5 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Flat Number</label>
                  <input
                    type="text"
                    required
                    value={newInvFlat}
                    onChange={(e) => setNewInvFlat(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Resident Type</label>
                  <select
                    value={newInvType}
                    onChange={(e) => setNewInvType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Owner">Owner Occupied</option>
                    <option value="Tenant">Tenant Occupied</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Resident Full Name</label>
                  <input
                    type="text"
                    required
                    value={newInvResident}
                    onChange={(e) => setNewInvResident(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Billing Quarter</label>
                  <select
                    value={newInvQuarter}
                    onChange={(e) => setNewInvQuarter(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Q3 (Oct - Dec 2026)">Q3 (Oct - Dec 2026)</option>
                    <option value="Q4 (Jan - Mar 2027)">Q4 (Jan - Mar 2027)</option>
                    <option value="Q1 (Apr - Jun 2027)">Q1 (Apr - Jun 2027)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newInvDueDate}
                    onChange={(e) => setNewInvDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Flat Area (Sq.Ft)</label>
                  <input
                    type="number"
                    value={newInvArea}
                    onChange={(e) => setNewInvArea(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Breakdown Fields */}
              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-900 mb-2">Itemized Charges (₹)</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-500 text-[11px]">Service Charges</label>
                    <input
                      type="number"
                      value={serviceCharges}
                      onChange={(e) => setServiceCharges(Number(e.target.value))}
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px]">Sinking Fund Pool</label>
                    <input
                      type="number"
                      value={sinkingFund}
                      onChange={(e) => setSinkingFund(Number(e.target.value))}
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px]">Repair & Maintenance</label>
                    <input
                      type="number"
                      value={repairMaint}
                      onChange={(e) => setRepairMaint(Number(e.target.value))}
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px]">Water Charges</label>
                    <input
                      type="number"
                      value={waterCharges}
                      onChange={(e) => setWaterCharges(Number(e.target.value))}
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px]">Lift & Common Electric</label>
                    <input
                      type="number"
                      value={liftElectricity}
                      onChange={(e) => setLiftElectricity(Number(e.target.value))}
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px]">Parking Slot Fee</label>
                    <input
                      type="number"
                      value={parkingCharges}
                      onChange={(e) => setParkingCharges(Number(e.target.value))}
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  {newInvType === 'Tenant' && (
                    <div className="col-span-2">
                      <label className="block text-amber-700 text-[11px] font-bold">Non-Occupancy Charges (10%)</label>
                      <input
                        type="number"
                        value={nonOccupancy}
                        onChange={(e) => setNonOccupancy(Number(e.target.value))}
                        className="w-full px-2.5 py-1 border border-amber-300 rounded-lg font-mono bg-amber-50/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between font-bold text-sm text-slate-900">
                <span>Calculated Total Amount:</span>
                <span className="font-mono text-indigo-700">₹{calculatedTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGeneratingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Publish & Issue Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
