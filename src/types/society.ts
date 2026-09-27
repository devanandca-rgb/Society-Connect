export type UserRole = 'committee' | 'manager' | 'resident' | 'guard';

export interface SocietyUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string; // e.g. "Chairman", "Secretary", "Treasurer", "Estate Manager", "Owner", "Tenant", "Head Guard"
  flatNumber?: string; // e.g. "B-402"
  wing?: string;
  phone: string;
  avatar?: string;
}

export interface MaintenanceInvoice {
  id: string;
  invoiceNo: string;
  flatNumber: string;
  residentName: string;
  residentType: 'Owner' | 'Tenant';
  quarter: string; // e.g. "Q1 (Apr - Jun 2026)"
  financialYear: string; // e.g. "2026-2027"
  dueDate: string;
  generatedDate: string;
  areaSqFt: number;
  breakdown: {
    serviceCharges: number;
    sinkingFund: number;
    repairAndMaintenance: number;
    waterCharges: number;
    liftAndElectricity: number;
    parkingCharges: number;
    nonOccupancyCharges?: number;
    lateFeePenalty?: number;
  };
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue';
  paymentDate?: string;
  paymentMethod?: 'UPI' | 'NetBanking' | 'Cheque' | 'CreditCard';
  transactionRef?: string;
  overdueDays?: number;
}

export interface Complaint {
  id: string;
  ticketNo: string;
  flatNumber: string;
  raisedByName: string;
  category: 'Plumbing' | 'Electrical' | 'Lift Breakdown' | 'Security' | 'Water Supply' | 'Noise & Disturbance' | 'Common Area' | 'Parking';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Open' | 'In Progress' | 'Escalated to Committee' | 'Action Taken' | 'Resolved';
  createdAt: string;
  updatedAt: string;
  assignedVendorId?: string;
  assignedVendorName?: string;
  estimatedResolutionDate?: string;
  managerNotes?: string;
  committeeAction?: {
    actionTaken: string;
    approvedBudget?: number;
    committeeMemberName: string;
    actionDate: string;
    remarks: string;
  };
  resolutionNotes?: string;
  photoUrl?: string;
}

export interface RentalFlat {
  id: string;
  flatNumber: string;
  wing: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  tenantFamilyMembers: number;
  tenantOccupation: string;
  agreementStartDate: string;
  agreementEndDate: string;
  monthlyRent: number;
  depositAmount: number;
  liftChargesPaid: boolean; // Shifting / lift usage charges
  liftChargesAmount: number;
  liftChargesPaymentDate?: string;
  policeNocStatus: 'Verified' | 'Pending Submission' | 'Under Review' | 'Expired';
  policeNocRefNumber?: string;
  policeNocDate?: string;
  policeStationName: string;
  notes?: string;
  agreementDocumentName?: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export interface Visitor {
  id: string;
  passNumber: string;
  visitorName: string;
  phone: string;
  flatNumber: string;
  purpose: 'Guest' | 'Delivery' | 'Cab / Taxi' | 'Home Service' | 'Prospective Buyer' | 'Other';
  companyOrPlatform?: string; // e.g., Amazon, Swiggy, Uber, Urban Company
  vehicleNumber?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Pending Resident Approval' | 'Approved & In Premises' | 'Denied Entry' | 'Checked Out';
  approvedByResidentAt?: string;
  gateGuardName: string;
  guardRemarks?: string;
  isPreApproved?: boolean;
}

export interface HouseMaid {
  id: string;
  maidId: string;
  name: string;
  phone: string;
  photoUrl?: string;
  services: string[]; // e.g. ['Cooking', 'Cleaning', 'Babysitting']
  assignedFlats: string[]; // e.g. ['A-102', 'B-402', 'C-301']
  policeVerificationStatus: 'Verified' | 'Pending' | 'In Process';
  rfidPassNumber: string;
  entryStatusToday: 'Inside Premises' | 'Exited' | 'Not Entered';
  lastEntryTime?: string;
  lastExitTime?: string;
  residentApprovalStatus: Record<string, boolean>; // flatNumber -> approved
}

export interface CommonHallBooking {
  id: string;
  bookingRef: string;
  facility: 'Community Banquet Hall' | 'Rooftop Terrace Garden' | 'Clubhouse Lounge' | 'Society Guest Room';
  flatNumber: string;
  bookedByName: string;
  contactPhone: string;
  eventDate: string;
  slot: 'Morning (09:00 - 14:00)' | 'Evening (16:00 - 23:00)' | 'Full Day (09:00 - 23:00)';
  eventType: 'Birthday Party' | 'Anniversary' | 'Festival Gathering' | 'Meeting' | 'Puja / Religious' | 'Other';
  attendeeCount: number;
  hallRent: number;
  cleaningFee: number;
  refundableDeposit: number;
  totalAmount: number;
  status: 'Confirmed' | 'Pending Committee Approval' | 'Cancelled' | 'Completed';
  paymentStatus: 'Paid' | 'Pending';
  rulesAgreed: boolean;
  remarks?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'Lift AMC' | 'DG Set AMC' | 'CCTV & Security' | 'Fire Safety' | 'Pest Control' | 'Water Treatment & RO' | 'Swimming Pool' | 'Gardening' | 'Housekeeping';
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  rating: number; // 1-5
}

export interface AmcContract {
  id: string;
  contractNumber: string;
  vendorId: string;
  vendorName: string;
  serviceCategory: string;
  equipmentCovered: string; // e.g. "4 Passenger Elevators (Otis 8-Pax)"
  startDate: string;
  endDate: string;
  annualValue: number;
  paymentCycle: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annually';
  emergencyContact: string;
  routineServiceFrequency: 'Monthly' | 'Bi-Monthly' | 'Quarterly';
  lastServiceDate: string;
  nextScheduledService: string;
  status: 'Active' | 'Expiring in 30 Days' | 'Expired';
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description: string;
  category: string;
  budgetAmount: number;
  issuedDate: string;
  completionDeadline: string;
  status: 'Draft' | 'Approved by Committee' | 'Issued to Vendor' | 'In Progress' | 'Completed & Inspected' | 'Paid';
  issuedByRole: 'Manager' | 'Committee';
  issuedByName: string;
  completionReportNotes?: string;
}

export interface Notice {
  id: string;
  noticeNumber: string;
  title: string;
  category: 'AGM & EGM' | 'Audited Financials' | 'Festivals & Events' | 'Maintenance & Utility' | 'General Circular';
  publishedDate: string;
  issuedBy: string; // e.g. "Managing Committee"
  summary: string;
  content: string;
  meetingDate?: string;
  meetingVenue?: string;
  quorumDetails?: string;
  financialYear?: string;
  auditorName?: string;
  attachmentName?: string;
  attachmentSize?: string;
  driveFileUrl?: string;
  isPinned?: boolean;
}

export interface EmergencyContact {
  id: string;
  category: 'Police' | 'Hospital & Ambulance' | 'Fire Brigade' | 'Society Urgent Services' | 'Disaster Helpline';
  title: string;
  nameOrStation: string;
  primaryPhone: string;
  secondaryPhone?: string;
  address: string;
  distanceKm?: string;
  is24x7: boolean;
  notes?: string;
  officerInCharge?: string;
}

export interface SocietyMember {
  id: string;
  flatNumber: string;
  wing: 'A' | 'B' | 'C' | 'D';
  floor: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  residentType: 'Owner' | 'Tenant';
  residentName: string;
  residentPhone: string;
  intercomNumber: string;
  parkingSlot: string;
  areaSqFt: number;
  committeeRole?: string; // "Chairman" | "Secretary" | "Treasurer" | "Member"
  pendingDues: number;
}
