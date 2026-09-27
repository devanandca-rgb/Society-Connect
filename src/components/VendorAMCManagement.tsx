import React, { useState } from 'react';
import {
  Wrench,
  FileText,
  AlertTriangle,
  Clock,
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  DollarSign,
  Building,
  Calendar,
  X,
  HardDrive,
} from 'lucide-react';
import type { AmcContract, WorkOrder, Vendor, SocietyUser } from '../types/society';
import { exportVendorsAndAmcToExcel } from '../services/excel';

interface VendorAMCManagementProps {
  amcs: AmcContract[];
  workOrders: WorkOrder[];
  vendors: Vendor[];
  currentUser: SocietyUser;
  onAddWorkOrder: (wo: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'issuedDate'>) => void;
  onUpdateWorkOrderStatus: (woId: string, status: WorkOrder['status']) => void;
  onRenewAmc: (amcId: string, newEndDate: string) => void;
}

export const VendorAMCManagement: React.FC<VendorAMCManagementProps> = ({
  amcs,
  workOrders,
  vendors,
  currentUser,
  onAddWorkOrder,
  onUpdateWorkOrderStatus,
  onRenewAmc,
}) => {
  const [activeTab, setActiveTab] = useState<'amc' | 'workOrders' | 'vendors'>('amc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewWoModalOpen, setIsNewWoModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedAmc, setSelectedAmc] = useState<AmcContract | null>(null);
  const [newRenewalDate, setNewRenewalDate] = useState('2027-10-14');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Work Order Form State
  const [woTitle, setWoTitle] = useState('');
  const [woVendorId, setWoVendorId] = useState(vendors[0]?.id || '');
  const [woCategory, setWoCategory] = useState('Elevator Repair');
  const [woBudget, setWoBudget] = useState(12000);
  const [woDeadline, setWoDeadline] = useState('2026-10-10');
  const [woDesc, setWoDesc] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const expiringAmcs = amcs.filter((a) => a.status === 'Expiring in 30 Days');

  const handleCreateWoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find((v) => v.id === woVendorId);

    onAddWorkOrder({
      vendorId: woVendorId,
      vendorName: vendor?.name || 'Selected Vendor',
      title: woTitle,
      description: woDesc,
      category: woCategory,
      budgetAmount: woBudget,
      completionDeadline: woDeadline,
      status: currentUser.role === 'committee' ? 'Approved by Committee' : 'Issued to Vendor',
      issuedByRole: currentUser.role === 'committee' ? 'Committee' : 'Manager',
      issuedByName: currentUser.name,
    });

    setIsNewWoModalOpen(false);
    setWoTitle('');
    setWoDesc('');
    showToast(`Work Order issued successfully to ${vendor?.name}!`);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmc) return;

    onRenewAmc(selectedAmc.id, newRenewalDate);
    setIsRenewModalOpen(false);
    setSelectedAmc(null);
    showToast(`AMC Contract #${selectedAmc.contractNumber} renewed until ${newRenewalDate}!`);
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
            Vendor & AMC Contractor Management
          </h2>
          <p className="text-xs text-slate-500">
            Issuing work orders to service contractors, tracking Annual Maintenance Contracts (AMC), and contract renewal alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportVendorsAndAmcToExcel(amcs, workOrders)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export AMC & WO (.xlsx)</span>
          </button>

          {(currentUser.role === 'manager' || currentUser.role === 'committee') && (
            <button
              onClick={() => setIsNewWoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Work Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Expiring AMC Alert Banner if any */}
      {expiringAmcs.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-900">
              Contract Renewal Alert: {expiringAmcs.length} Critical AMC Contracts Expiring in &lt; 30 Days!
            </span>
            <div className="mt-1 space-y-1">
              {expiringAmcs.map((a) => (
                <div key={a.id} className="text-[11px] text-amber-800 flex items-center justify-between">
                  <span>
                    • <strong>{a.serviceCategory}</strong> ({a.vendorName}) - Expiry: {a.endDate}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedAmc(a);
                      setIsRenewModalOpen(true);
                    }}
                    className="underline font-bold text-amber-900 hover:text-amber-950"
                  >
                    Renew Contract
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('amc')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'amc'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          AMC Contracts ({amcs.length})
        </button>
        <button
          onClick={() => setActiveTab('workOrders')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'workOrders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Issued Work Orders ({workOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'vendors'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Vendor Directory ({vendors.length})
        </button>
      </div>

      {/* TAB 1: AMC CONTRACTS */}
      {activeTab === 'amc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {amcs.map((a) => {
            const isExpiring = a.status === 'Expiring in 30 Days';

            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 transition-all ${
                  isExpiring
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {a.contractNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">
                      {a.serviceCategory}
                    </h3>
                    <div className="text-xs font-semibold text-slate-700">{a.vendorName}</div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isExpiring
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div>
                    <strong>Equipment Covered:</strong> {a.equipmentCovered}
                  </div>
                  <div className="flex justify-between">
                    <span>Routine Maintenance:</span>
                    <span className="font-semibold text-slate-800">{a.routineServiceFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Serviced:</span>
                    <span className="font-mono">{a.lastServiceDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Due Service:</span>
                    <span className="font-mono text-indigo-700 font-bold">{a.nextScheduledService}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Annual Contract Value</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ₹{a.annualValue.toLocaleString('en-IN')}/year
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">({a.paymentCycle})</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Contract Expiry</span>
                    <span
                      className={`font-semibold text-xs ${
                        isExpiring ? 'text-amber-700 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {a.endDate}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500 font-mono">
                    ☎ Helpline: {a.emergencyContact}
                  </div>

                  {(currentUser.role === 'committee' || currentUser.role === 'manager') && (
                    <button
                      onClick={() => {
                        setSelectedAmc(a);
                        setIsRenewModalOpen(true);
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      Renew
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: WORK ORDERS */}
      {activeTab === 'workOrders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">WO Number</th>
                  <th className="py-3 px-4">Work Order Title & Scope</th>
                  <th className="py-3 px-4">Assigned Vendor</th>
                  <th className="py-3 px-4">Budget Amount</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {wo.workOrderNumber}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">{wo.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{wo.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Issued by: {wo.issuedByName} ({wo.issuedByRole}) on {wo.issuedDate}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{wo.vendorName}</div>
                      <span className="text-[10px] text-slate-500">{wo.category}</span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      ₹{wo.budgetAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      {wo.completionDeadline}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          wo.status === 'Completed & Inspected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : wo.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : wo.status === 'Approved by Committee'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {wo.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {wo.status !== 'Completed & Inspected' &&
                        (currentUser.role === 'manager' || currentUser.role === 'committee') && (
                          <button
                            onClick={() =>
                              onUpdateWorkOrderStatus(wo.id, 'Completed & Inspected')
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VENDOR DIRECTORY */}
      {activeTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {v.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">{v.name}</h3>
                </div>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                  ★ {v.rating}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Contact:</span>
                  <strong>{v.contactPerson}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${v.phone}`} className="hover:underline">
                    {v.phone}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${v.email}`} className="hover:underline truncate">
                    {v.email}
                  </a>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">GST: {v.gstNumber}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Issue New Work Order */}
      {isNewWoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Issue Official Work Order</h3>
                <div className="text-xs text-indigo-300">
                  Greenwood Heights Maintenance Division
                </div>
              </div>
              <button
                onClick={() => setIsNewWoModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWoSubmit} className="p-5 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Vendor</label>
                <select
                  value={woVendorId}
                  onChange={(e) => setWoVendorId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Lift Rope Testing & Motor Oiling"
                  value={woTitle}
                  onChange={(e) => setWoTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sanctioned Budget (₹)</label>
                  <input
                    type="number"
                    required
                    value={woBudget}
                    onChange={(e) => setWoBudget(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Completion Deadline</label>
                  <input
                    type="date"
                    required
                    value={woDeadline}
                    onChange={(e) => setWoDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope of Work & Terms</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed breakdown of required spares, labor obligations, safety testing standards, and payment release terms..."
                  value={woDesc}
                  onChange={(e) => setWoDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewWoModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Renew AMC Contract */}
      {isRenewModalOpen && selectedAmc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Renew AMC Contract</h3>
                <div className="text-xs text-amber-200">{selectedAmc.serviceCategory}</div>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="p-5 text-xs space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                <div className="font-bold">{selectedAmc.vendorName}</div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  Current Expiry Date: {selectedAmc.endDate}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Contract Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newRenewalDate}
                  onChange={(e) => setNewRenewalDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
