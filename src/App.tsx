import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, type ActiveTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MaintenanceInvoices } from './components/MaintenanceInvoices';
import { ComplaintsHelpdesk } from './components/ComplaintsHelpdesk';
import { MembersDirectory } from './components/MembersDirectory';
import { RentalFlatManagement } from './components/RentalFlatManagement';
import { VisitorManagement } from './components/VisitorManagement';
import { CommonHallBookingComponent } from './components/CommonHallBooking';
import { VendorAMCManagement } from './components/VendorAMCManagement';
import { NoticeBoard } from './components/NoticeBoard';
import { EmergencyDashboard } from './components/EmergencyDashboard';
import { GoogleDriveModal } from './components/GoogleDriveModal';

import type {
  SocietyUser,
  UserRole,
  MaintenanceInvoice,
  Complaint,
  RentalFlat,
  Visitor,
  HouseMaid,
  CommonHallBooking,
  AmcContract,
  WorkOrder,
  Notice,
} from './types/society';

import {
  INITIAL_MEMBERS,
  INITIAL_INVOICES,
  INITIAL_COMPLAINTS,
  INITIAL_RENTAL_FLATS,
  INITIAL_VISITORS,
  INITIAL_MAIDS,
  INITIAL_HALL_BOOKINGS,
  INITIAL_VENDORS,
  INITIAL_AMCS,
  INITIAL_WORK_ORDERS,
  INITIAL_NOTICES,
  INITIAL_EMERGENCY_CONTACTS,
} from './data/mockData';

import { DEMO_USERS, getAccessToken } from './services/auth';
import { exportMasterSocietyWorkbook } from './services/excel';
import { uploadToDrive } from './services/drive';

export default function App() {
  // Active User / Role
  const [currentUser, setCurrentUser] = useState<SocietyUser>(DEMO_USERS.committee);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Core Data Collections
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [invoices, setInvoices] = useState<MaintenanceInvoice[]>(INITIAL_INVOICES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [rentals, setRentals] = useState<RentalFlat[]>(INITIAL_RENTAL_FLATS);
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [maids, setMaids] = useState<HouseMaid[]>(INITIAL_MAIDS);
  const [bookings, setBookings] = useState<CommonHallBooking[]>(INITIAL_HALL_BOOKINGS);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [amcs, setAmcs] = useState<AmcContract[]>(INITIAL_AMCS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [emergencyContacts, setEmergencyContacts] = useState(INITIAL_EMERGENCY_CONTACTS);

  // Drive Modal & Connection
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  useEffect(() => {
    getAccessToken().then((token) => {
      setIsDriveConnected(!!token);
    });
  }, []);

  const triggerToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 4000);
  };

  // 1. Role Change Handler
  const handleRoleChange = (role: UserRole) => {
    setCurrentUser(DEMO_USERS[role]);
    triggerToast(`Switched active persona to ${DEMO_USERS[role].name} (${role})`);
  };

  // 2. Invoices Handlers
  const handlePayInvoice = (
    invoiceId: string,
    paymentMethod: 'UPI' | 'NetBanking' | 'CreditCard'
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const txnRef = `${paymentMethod}/TXN/${Date.now().toString().slice(-8)}`;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'Paid',
            paidAmount: inv.totalAmount,
            paymentDate: today,
            paymentMethod,
            transactionRef: txnRef,
            overdueDays: 0,
          };
        }
        return inv;
      })
    );
  };

  const handleGenerateInvoice = (newInvoice: Omit<MaintenanceInvoice, 'id'>) => {
    const created: MaintenanceInvoice = {
      ...newInvoice,
      id: `inv_${Date.now()}`,
    };
    setInvoices((prev) => [created, ...prev]);
  };

  // 3. Complaints Handlers
  const handleRaiseComplaint = (
    newComplaint: Omit<Complaint, 'id' | 'ticketNo' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
    const created: Complaint = {
      ...newComplaint,
      id: `comp_${Date.now()}`,
      ticketNo: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: dateStr,
      updatedAt: dateStr,
    };
    setComplaints((prev) => [created, ...prev]);
    triggerToast(`Grievance #${created.ticketNo} submitted to Society Helpdesk!`);
  };

  const handleUpdateComplaintStatus = (
    complaintId: string,
    status: Complaint['status'],
    notes?: string
  ) => {
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            updatedAt: dateStr,
            resolutionNotes: notes || c.resolutionNotes,
          };
        }
        return c;
      })
    );
    triggerToast(`Complaint status updated to "${status}"`);
  };

  const handleCommitteeTakeAction = (
    complaintId: string,
    action: {
      actionTaken: string;
      approvedBudget: number;
      committeeMemberName: string;
      remarks: string;
    }
  ) => {
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Action Taken',
            updatedAt: dateStr,
            committeeAction: {
              ...action,
              actionDate: dateStr,
            },
          };
        }
        return c;
      })
    );
    triggerToast('Managing Committee executive action & budget sanction recorded!');
  };

  const handleManagerAssignVendor = (
    complaintId: string,
    vendorId: string,
    vendorName: string,
    estimatedDate: string,
    notes: string
  ) => {
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'In Progress',
            assignedVendorId: vendorId,
            assignedVendorName: vendorName,
            estimatedResolutionDate: estimatedDate,
            managerNotes: notes,
            updatedAt: dateStr,
          };
        }
        return c;
      })
    );
    triggerToast(`Vendor ${vendorName} dispatched to resolve complaint!`);
  };

  // 4. Rental Flat Handlers
  const handleAddRentalFlat = (flat: Omit<RentalFlat, 'id'>) => {
    const created: RentalFlat = {
      ...flat,
      id: `rent_${Date.now()}`,
    };
    setRentals((prev) => [created, ...prev]);
  };

  const handleUpdateRentalFlat = (id: string, updates: Partial<RentalFlat>) => {
    setRentals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  // 5. Visitor & Maid Handlers
  const handleAddVisitor = (
    visitor: Omit<Visitor, 'id' | 'passNumber' | 'checkInTime' | 'status'>
  ) => {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').slice(0, 16);
    const passNo = `PASS-2026-${Date.now().toString().slice(-6)}`;

    const newVisitor: Visitor = {
      ...visitor,
      id: `vis_${Date.now()}`,
      passNumber: passNo,
      checkInTime: timeStr,
      status: visitor.isPreApproved ? 'Approved & In Premises' : 'Pending Resident Approval',
      approvedByResidentAt: visitor.isPreApproved ? timeStr : undefined,
    };

    setVisitors((prev) => [newVisitor, ...prev]);
  };

  const handleApproveVisitor = (visitorId: string, approved: boolean) => {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').slice(0, 16);

    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === visitorId) {
          return {
            ...v,
            status: approved ? 'Approved & In Premises' : 'Denied Entry',
            approvedByResidentAt: approved ? timeStr : undefined,
          };
        }
        return v;
      })
    );

    triggerToast(
      approved
        ? 'Visitor allowed! Security barrier opened.'
        : 'Visitor entry denied. Gate notified.'
    );
  };

  const handleCheckOutVisitor = (visitorId: string) => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, status: 'Checked Out', checkOutTime: timeStr } : v))
    );
    triggerToast('Visitor check-out timestamp recorded.');
  };

  const handleToggleMaidApproval = (maidId: string, flatNumber: string, approved: boolean) => {
    setMaids((prev) =>
      prev.map((m) => {
        if (m.id === maidId) {
          return {
            ...m,
            residentApprovalStatus: {
              ...m.residentApprovalStatus,
              [flatNumber]: approved,
            },
          };
        }
        return m;
      })
    );
    triggerToast(
      `Maid pass for Flat ${flatNumber} ${approved ? 'AUTHORIZED' : 'REVOKED'}`
    );
  };

  const handleLogMaidAttendance = (maidId: string, status: 'Inside Premises' | 'Exited') => {
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setMaids((prev) =>
      prev.map((m) => {
        if (m.id === maidId) {
          return {
            ...m,
            entryStatusToday: status,
            lastEntryTime: status === 'Inside Premises' ? timeStr : m.lastEntryTime,
            lastExitTime: status === 'Exited' ? timeStr : m.lastExitTime,
          };
        }
        return m;
      })
    );
  };

  // 6. Common Hall Booking Handlers
  const handleAddBooking = (booking: Omit<CommonHallBooking, 'id' | 'bookingRef'>) => {
    const created: CommonHallBooking = {
      ...booking,
      id: `bk_${Date.now()}`,
      bookingRef: `HB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setBookings((prev) => [created, ...prev]);
  };

  const handleApproveBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Confirmed' } : b))
    );
    triggerToast('Amenity booking approved by Committee!');
  };

  // 7. AMC & Work Orders
  const handleAddWorkOrder = (wo: Omit<WorkOrder, 'id' | 'workOrderNumber' | 'issuedDate'>) => {
    const created: WorkOrder = {
      ...wo,
      id: `wo_${Date.now()}`,
      workOrderNumber: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
      issuedDate: new Date().toISOString().split('T')[0],
    };
    setWorkOrders((prev) => [created, ...prev]);
  };

  const handleUpdateWorkOrderStatus = (woId: string, status: WorkOrder['status']) => {
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === woId ? { ...w, status } : w))
    );
    triggerToast(`Work order marked as: ${status}`);
  };

  const handleRenewAmc = (amcId: string, newEndDate: string) => {
    setAmcs((prev) =>
      prev.map((a) => (a.id === amcId ? { ...a, endDate: newEndDate, status: 'Active' } : a))
    );
  };

  // 8. Notices
  const handleAddNotice = (notice: Omit<Notice, 'id' | 'publishedDate'>) => {
    const created: Notice = {
      ...notice,
      id: `not_${Date.now()}`,
      publishedDate: new Date().toISOString().split('T')[0],
    };
    setNotices((prev) => [created, ...prev]);
  };

  // 9. Emergency SOS Broadcast
  const handleTriggerSos = (emergencyType: string, flatNumber: string) => {
    triggerToast(`🚨 SOS Broadcasted for Flat ${flatNumber}: ${emergencyType}! Security alerted.`);
  };

  // 10. Master Excel Export
  const handleExportMasterExcel = () => {
    exportMasterSocietyWorkbook({
      invoices,
      rentals,
      amcs,
      workOrders,
      visitors,
      members,
      complaints,
    });
    triggerToast('Greenwood_Heights_Society_Master_ERP.xlsx exported successfully!');
  };

  // 11. Save individual items to Google Drive
  const handleSaveToDrive = async (item: any) => {
    const token = await getAccessToken();
    if (!token) {
      setIsDriveModalOpen(true);
      return;
    }

    try {
      const fileName = `Greenwood_Doc_${item.invoiceNo || item.ticketNo || item.flatNumber || item.noticeNumber || 'Item'}.json`;
      await uploadToDrive(fileName, JSON.stringify(item, null, 2), 'application/json');
      triggerToast(`Saved "${fileName}" directly to your Google Drive!`);
    } catch (e: any) {
      triggerToast(`Google Drive sync error: ${e.message}`);
    }
  };

  // Pending items counts for Sidebar Badges
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;
  const openComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const pendingVisitorsCount = visitors.filter((v) => v.status === 'Pending Resident Approval').length;
  const expiringRentalsCount = rentals.filter((r) => r.status === 'Expiring Soon').length;
  const expiringAmcsCount = amcs.filter((a) => a.status === 'Expiring in 30 Days').length;
  const pendingNocCount = rentals.filter((r) => r.policeNocStatus === 'Pending Submission').length;

  // Real-time visitor waiting for resident flat (e.g. B-402)
  const pendingResidentApprovalVisitor = visitors.find(
    (v) =>
      v.status === 'Pending Resident Approval' &&
      v.flatNumber === (currentUser.flatNumber || 'B-402')
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        pendingVisitorsCount={pendingVisitorsCount}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        isDriveConnected={isDriveConnected}
        onOpenSosModal={() => setActiveTab('emergency')}
        onExportMasterExcel={handleExportMasterExcel}
        pendingResidentApprovalVisitor={pendingResidentApprovalVisitor}
        onQuickApproveVisitor={handleApproveVisitor}
      />

      {/* Global Toast */}
      {globalToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <span>{globalToast}</span>
        </div>
      )}

      {/* App Body: Sidebar + Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={currentUser.role}
          counts={{
            overdueInvoices: overdueCount,
            openComplaints: openComplaintsCount,
            pendingVisitors: pendingVisitorsCount,
            expiringRentals: expiringRentalsCount,
            expiringAmcs: expiringAmcsCount,
            pendingNoc: pendingNocCount,
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              invoices={invoices}
              complaints={complaints}
              rentals={rentals}
              visitors={visitors}
              amcs={amcs}
              bookings={bookings}
              notices={notices}
              onNavigate={(tab) => setActiveTab(tab)}
              onPayBillClick={() => setActiveTab('invoices')}
              onTakeComplaintAction={() => setActiveTab('complaints')}
            />
          )}

          {activeTab === 'invoices' && (
            <MaintenanceInvoices
              invoices={invoices}
              currentUser={currentUser}
              onPayInvoice={handlePayInvoice}
              onGenerateInvoice={handleGenerateInvoice}
              onSaveToDrive={handleSaveToDrive}
            />
          )}

          {activeTab === 'complaints' && (
            <ComplaintsHelpdesk
              complaints={complaints}
              currentUser={currentUser}
              vendors={vendors}
              onRaiseComplaint={handleRaiseComplaint}
              onUpdateComplaintStatus={handleUpdateComplaintStatus}
              onCommitteeTakeAction={handleCommitteeTakeAction}
              onManagerAssignVendor={handleManagerAssignVendor}
            />
          )}

          {activeTab === 'members' && (
            <MembersDirectory members={members} />
          )}

          {activeTab === 'rentals' && (
            <RentalFlatManagement
              rentals={rentals}
              currentUser={currentUser}
              onAddRentalFlat={handleAddRentalFlat}
              onUpdateRentalFlat={handleUpdateRentalFlat}
              onSaveToDrive={handleSaveToDrive}
            />
          )}

          {activeTab === 'visitors' && (
            <VisitorManagement
              visitors={visitors}
              maids={maids}
              currentUser={currentUser}
              onAddVisitor={handleAddVisitor}
              onApproveVisitor={handleApproveVisitor}
              onCheckOutVisitor={handleCheckOutVisitor}
              onToggleMaidApproval={handleToggleMaidApproval}
              onLogMaidAttendance={handleLogMaidAttendance}
            />
          )}

          {activeTab === 'hall' && (
            <CommonHallBookingComponent
              bookings={bookings}
              currentUser={currentUser}
              onAddBooking={handleAddBooking}
              onApproveBooking={handleApproveBooking}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorAMCManagement
              amcs={amcs}
              workOrders={workOrders}
              vendors={vendors}
              currentUser={currentUser}
              onAddWorkOrder={handleAddWorkOrder}
              onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
              onRenewAmc={handleRenewAmc}
            />
          )}

          {activeTab === 'notices' && (
            <NoticeBoard
              notices={notices}
              currentUser={currentUser}
              onAddNotice={handleAddNotice}
              onSaveToDrive={handleSaveToDrive}
            />
          )}

          {activeTab === 'emergency' && (
            <EmergencyDashboard
              contacts={emergencyContacts}
              currentUser={currentUser}
              onTriggerSos={handleTriggerSos}
            />
          )}
        </main>
      </div>

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onDriveConnectedChange={(conn) => setIsDriveConnected(conn)}
        societyData={{
          societyName: 'Greenwood Heights CHS Ltd.',
          exportedAt: new Date().toISOString(),
          invoices,
          rentals,
          amcs,
          workOrders,
          visitors,
          members,
          complaints,
        }}
      />
    </div>
  );
}
