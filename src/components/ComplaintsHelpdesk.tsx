import React, { useState } from 'react';
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Wrench,
  DollarSign,
  User,
  X,
  Building,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import type { Complaint, SocietyUser, Vendor } from '../types/society';

interface ComplaintsHelpdeskProps {
  complaints: Complaint[];
  currentUser: SocietyUser;
  vendors: Vendor[];
  onRaiseComplaint: (complaint: Omit<Complaint, 'id' | 'ticketNo' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateComplaintStatus: (complaintId: string, status: Complaint['status'], notes?: string) => void;
  onCommitteeTakeAction: (
    complaintId: string,
    action: {
      actionTaken: string;
      approvedBudget: number;
      committeeMemberName: string;
      remarks: string;
    }
  ) => void;
  onManagerAssignVendor: (
    complaintId: string,
    vendorId: string,
    vendorName: string,
    estimatedDate: string,
    notes: string
  ) => void;
}

export const ComplaintsHelpdesk: React.FC<ComplaintsHelpdeskProps> = ({
  complaints,
  currentUser,
  vendors,
  onRaiseComplaint,
  onUpdateComplaintStatus,
  onCommitteeTakeAction,
  onManagerAssignVendor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Committee Action Modal
  const [isCommitteeActionModalOpen, setIsCommitteeActionModalOpen] = useState(false);
  const [committeeActionText, setCommitteeActionText] = useState('Emergency Budget Sanction & Expedited Vendor Repair');
  const [committeeBudget, setCommitteeBudget] = useState(15000);
  const [committeeRemarks, setCommitteeRemarks] = useState('');

  // Manager Assign Modal
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [managerEstDate, setManagerEstDate] = useState('2026-09-29');
  const [managerNotes, setManagerNotes] = useState('');

  // Raise Complaint Form State
  const [newCategory, setNewCategory] = useState<Complaint['category']>('Plumbing');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Complaint['priority']>('Medium');

  const filteredComplaints = complaints.filter((c) => {
    // If resident, prioritize their complaints or allow viewing society common issues
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' ? true : c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRaiseComplaint({
      flatNumber: currentUser.flatNumber || 'B-402',
      raisedByName: currentUser.name,
      category: newCategory,
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      status: 'Open',
    });
    setIsRaiseModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleCommitteeActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    onCommitteeTakeAction(selectedComplaint.id, {
      actionTaken: committeeActionText,
      approvedBudget: committeeBudget,
      committeeMemberName: `${currentUser.name} (${currentUser.designation || 'Chairman'})`,
      remarks: committeeRemarks || 'Approved per Society Bye-Laws for immediate maintenance restoration.',
    });

    setIsCommitteeActionModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleManagerAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    const vendor = vendors.find((v) => v.id === selectedVendorId);

    onManagerAssignVendor(
      selectedComplaint.id,
      selectedVendorId,
      vendor?.name || 'Assigned Vendor',
      managerEstDate,
      managerNotes
    );

    setIsManagerModalOpen(false);
    setSelectedComplaint(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Society Complaints & Grievance Helpdesk
          </h2>
          <p className="text-xs text-slate-500">
            {currentUser.role === 'committee' &&
              'Managing Committee Executive Action: review escalated tickets, sanction repair funds, and audit resolutions.'}
            {currentUser.role === 'manager' &&
              'Society Manager Operations: dispatch vendors, set resolution deadlines, and coordinate field technicians.'}
            {currentUser.role === 'resident' &&
              'Resident Portal: raise new complaints, attach issues, and track live resolution milestones.'}
            {currentUser.role === 'guard' && 'Security Helpdesk: report common area security concerns.'}
          </p>
        </div>

        <button
          onClick={() => setIsRaiseModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Complaint</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket #, title, flat, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Escalated to Committee">Escalated to Committee</option>
              <option value="Action Taken">Action Taken</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Lift Breakdown">Lift Breakdown</option>
              <option value="Security">Security</option>
              <option value="Common Area">Common Area</option>
              <option value="Parking">Parking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List Cards */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((comp) => {
            const isEscalated = comp.status === 'Escalated to Committee';
            const isResolved = comp.status === 'Resolved';

            return (
              <div
                key={comp.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                  isEscalated
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Ticket Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {comp.ticketNo}
                    </span>
                    <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      Flat {comp.flatNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      Raised by <strong>{comp.raisedByName}</strong> on {comp.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        comp.priority === 'Emergency'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : comp.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : comp.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {comp.priority} Priority
                    </span>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        comp.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.status === 'Escalated to Committee'
                          ? 'bg-amber-100 text-amber-900 font-extrabold'
                          : comp.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="py-3 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{comp.title}</h3>
                      <p className="text-slate-600 mt-1 leading-relaxed">{comp.description}</p>
                    </div>
                  </div>

                  {/* Manager Tracking Section */}
                  {comp.managerNotes && (
                    <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Society Manager Operations Update:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{comp.managerNotes}</p>
                      {comp.assignedVendorName && (
                        <div className="mt-1 text-[11px] text-blue-800 font-semibold">
                          Assigned Vendor: {comp.assignedVendorName} • Target Resolution: {comp.estimatedResolutionDate || 'ASAP'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Committee Executive Action Section */}
                  {comp.committeeAction && (
                    <div className="mt-2 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl text-emerald-950">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span>Managing Committee Action Executed: {comp.committeeAction.actionTaken}</span>
                        </div>
                        {comp.committeeAction.approvedBudget && (
                          <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[11px] font-mono">
                            Sanctioned: ₹{comp.committeeAction.approvedBudget.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-1">
                        <strong>Remarks:</strong> {comp.committeeAction.remarks}
                      </p>
                      <div className="text-[10px] text-emerald-700 mt-1">
                        Authorized by: {comp.committeeAction.committeeMemberName} on {comp.committeeAction.actionDate}
                      </div>
                    </div>
                  )}

                  {/* Resolution Notes */}
                  {comp.resolutionNotes && (
                    <div className="mt-2 p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-800">
                      <strong>Resolution Sign-Off:</strong> {comp.resolutionNotes}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons (Role specific) */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Category: <strong className="text-slate-700">{comp.category}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Managing Committee Action Button */}
                    {currentUser.role === 'committee' && !comp.committeeAction && !isResolved && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(comp);
                          setIsCommitteeActionModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Take Committee Action & Approve Budget</span>
                      </button>
                    )}

                    {/* Society Manager Track / Assign Vendor Button */}
                    {(currentUser.role === 'manager' || currentUser.role === 'committee') && !isResolved && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(comp);
                          setIsManagerModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 flex items-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Assign Vendor / Update Notes</span>
                      </button>
                    )}

                    {/* Mark Resolved */}
                    {(currentUser.role === 'manager' || currentUser.role === 'committee') && !isResolved && (
                      <button
                        onClick={() => onUpdateComplaintStatus(comp.id, 'Resolved', 'Issue inspected and verified resolved by maintenance supervisor.')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No complaints found matching your search.
          </div>
        )}
      </div>

      {/* Modal: Raise Complaint */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Raise Society Grievance / Ticket</h3>
                <div className="text-xs text-indigo-300">
                  Flat {currentUser.flatNumber || 'B-402'} • {currentUser.name}
                </div>
              </div>
              <button
                onClick={() => setIsRaiseModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseSubmit} className="p-5 text-xs space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Plumbing">Plumbing & Water Supply</option>
                  <option value="Electrical">Electrical & Power Outage</option>
                  <option value="Lift Breakdown">Lift & Elevator Malfunction</option>
                  <option value="Security">Security & Unauthorized Access</option>
                  <option value="Common Area">Common Area & Podium Garden</option>
                  <option value="Noise & Disturbance">Noise & Pet Disturbance</option>
                  <option value="Parking">Parking Slot Dispute</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <label
                      key={p}
                      className={`text-center p-2 rounded-lg border font-semibold cursor-pointer transition-colors ${
                        newPriority === p
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={newPriority === p}
                        onChange={() => setNewPriority(p)}
                        className="sr-only"
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Subject / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water leak in balcony pipe, elevator grinding sound"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe location, timing, severity, and any previous attempts to resolve..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                ℹ️ Once submitted, Estate Manager Vikram will inspect and dispatch the relevant AMC technician. Tickets requiring emergency capital replacement are auto-escalated to the Managing Committee.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Managing Committee Action & Budget Sanction */}
      {isCommitteeActionModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-5 text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-200">
                  Managing Committee Executive Authority
                </div>
                <h3 className="font-bold text-base">Sanction Action & Budget</h3>
                <div className="text-xs text-amber-100">
                  Ticket #{selectedComplaint.ticketNo} • Flat {selectedComplaint.flatNumber}
                </div>
              </div>
              <button
                onClick={() => setIsCommitteeActionModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCommitteeActionSubmit} className="p-5 text-xs space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
                <div className="font-bold">{selectedComplaint.title}</div>
                <div className="text-[11px] text-amber-800 mt-1">{selectedComplaint.description}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Executive Action</label>
                <input
                  type="text"
                  required
                  value={committeeActionText}
                  onChange={(e) => setCommitteeActionText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Approved Expenditure / Budget (₹)
                </label>
                <input
                  type="number"
                  required
                  value={committeeBudget}
                  onChange={(e) => setCommitteeBudget(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-base font-bold focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Debited from Sinking & Repair pool per Bye-Law Rule 14(b).
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Committee Remarks / Directives</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Directives to Society Manager and AMC Vendor, fitness testing deadline..."
                  value={committeeRemarks}
                  onChange={(e) => setCommitteeRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCommitteeActionModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-900/30"
                >
                  Confirm Executive Sanction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Society Manager Assign Vendor */}
      {isManagerModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Assign Vendor & Resolution Target</h3>
                <div className="text-xs text-blue-200">
                  Ticket #{selectedComplaint.ticketNo}
                </div>
              </div>
              <button
                onClick={() => setIsManagerModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManagerAssignSubmit} className="p-5 text-xs space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Service Vendor</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Completion Target</label>
                <input
                  type="date"
                  required
                  value={managerEstDate}
                  onChange={(e) => setManagerEstDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manager Site Inspection Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Notes from initial inspection, technician assigned, parts quote..."
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManagerModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save Dispatch & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
