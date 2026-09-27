import * as XLSX from 'xlsx';
import type {
  MaintenanceInvoice,
  RentalFlat,
  AmcContract,
  WorkOrder,
  Visitor,
  SocietyMember,
  Complaint,
} from '../types/society';

/**
 * Downloads a worksheet or workbook as a real .xlsx file
 */
export function downloadWorkbook(wb: XLSX.WorkBook, fileName: string) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Maintenance Invoices to Excel
 */
export function exportInvoicesToExcel(invoices: MaintenanceInvoice[], fileName = 'Society_Maintenance_Invoices.xlsx') {
  const rows = invoices.map((inv) => ({
    'Invoice No': inv.invoiceNo,
    'Flat Number': inv.flatNumber,
    'Resident Name': inv.residentName,
    'Resident Type': inv.residentType,
    'Quarter': inv.quarter,
    'Financial Year': inv.financialYear,
    'Due Date': inv.dueDate,
    'Area (Sq.Ft)': inv.areaSqFt,
    'Service Charges (₹)': inv.breakdown.serviceCharges,
    'Sinking Fund (₹)': inv.breakdown.sinkingFund,
    'Repair & Maint (₹)': inv.breakdown.repairAndMaintenance,
    'Water Charges (₹)': inv.breakdown.waterCharges,
    'Lift & Common Elect (₹)': inv.breakdown.liftAndElectricity,
    'Parking (₹)': inv.breakdown.parkingCharges,
    'Late Fee Penalty (₹)': inv.breakdown.lateFeePenalty || 0,
    'Total Amount (₹)': inv.totalAmount,
    'Paid Amount (₹)': inv.paidAmount,
    'Balance Due (₹)': inv.totalAmount - inv.paidAmount,
    'Status': inv.status,
    'Payment Date': inv.paymentDate || 'N/A',
    'Payment Mode': inv.paymentMethod || 'N/A',
    'Txn Ref': inv.transactionRef || 'N/A',
    'Overdue Days': inv.overdueDays || 0,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Dues');
  downloadWorkbook(wb, fileName);
}

/**
 * Export Rental Flat Management Registry to Excel
 */
export function exportRentalFlatsToExcel(rentals: RentalFlat[], fileName = 'Society_Rental_Flat_Registry.xlsx') {
  const rows = rentals.map((r) => ({
    'Flat No': r.flatNumber,
    'Wing': r.wing,
    'Owner Name': r.ownerName,
    'Owner Phone': r.ownerPhone,
    'Owner Email': r.ownerEmail,
    'Tenant Name': r.tenantName,
    'Tenant Phone': r.tenantPhone,
    'Tenant Email': r.tenantEmail,
    'Family Members': r.tenantFamilyMembers,
    'Agreement From': r.agreementStartDate,
    'Agreement To': r.agreementEndDate,
    'Monthly Rent (₹)': r.monthlyRent,
    'Security Deposit (₹)': r.depositAmount,
    'Lift Charges Paid': r.liftChargesPaid ? 'YES - Paid' : 'NO - Unpaid',
    'Lift Fee Amount (₹)': r.liftChargesAmount,
    'Lift Fee Paid Date': r.liftChargesPaymentDate || 'N/A',
    'Police NOC Status': r.policeNocStatus,
    'Police NOC Ref No': r.policeNocRefNumber || 'Pending',
    'Police Station': r.policeStationName,
    'Lease Status': r.status,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rental Flat Tracker');
  downloadWorkbook(wb, fileName);
}

/**
 * Export AMC Contracts and Work Orders to Excel
 */
export function exportVendorsAndAmcToExcel(
  amcs: AmcContract[],
  workOrders: WorkOrder[],
  fileName = 'Society_AMC_and_WorkOrders.xlsx'
) {
  const wb = XLSX.utils.book_new();

  const amcRows = amcs.map((a) => ({
    'Contract No': a.contractNumber,
    'Vendor Name': a.vendorName,
    'Service Category': a.serviceCategory,
    'Equipment Covered': a.equipmentCovered,
    'Start Date': a.startDate,
    'Expiry Date': a.endDate,
    'Annual Value (₹)': a.annualValue,
    'Payment Frequency': a.paymentCycle,
    'Service Frequency': a.routineServiceFrequency,
    'Next Service Due': a.nextScheduledService,
    'Emergency Helpline': a.emergencyContact,
    'Status': a.status,
  }));
  const wsAmc = XLSX.utils.json_to_sheet(amcRows);
  XLSX.utils.book_append_sheet(wb, wsAmc, 'AMC Contracts');

  const woRows = workOrders.map((w) => ({
    'Work Order No': w.workOrderNumber,
    'Vendor Name': w.vendorName,
    'Title': w.title,
    'Category': w.category,
    'Budget (₹)': w.budgetAmount,
    'Issued Date': w.issuedDate,
    'Target Completion': w.completionDeadline,
    'Status': w.status,
    'Issued By': `${w.issuedByName} (${w.issuedByRole})`,
  }));
  const wsWo = XLSX.utils.json_to_sheet(woRows);
  XLSX.utils.book_append_sheet(wb, wsWo, 'Work Orders');

  downloadWorkbook(wb, fileName);
}

/**
 * Export Visitor Log to Excel
 */
export function exportVisitorsToExcel(visitors: Visitor[], fileName = 'Society_Visitor_Gate_Log.xlsx') {
  const rows = visitors.map((v) => ({
    'Pass No': v.passNumber,
    'Visitor Name': v.visitorName,
    'Contact Phone': v.phone,
    'Visiting Flat': v.flatNumber,
    'Purpose': v.purpose,
    'Platform/Org': v.companyOrPlatform || 'Personal',
    'Vehicle Number': v.vehicleNumber || 'Walk-in',
    'Check In': v.checkInTime,
    'Check Out': v.checkOutTime || 'Inside Premises',
    'Resident Approval Status': v.status,
    'Approved At': v.approvedByResidentAt || 'N/A',
    'Gate Guard': v.gateGuardName,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Visitor Log');
  downloadWorkbook(wb, fileName);
}

/**
 * Export Complete Master Society Workbook (All in One)
 */
export function exportMasterSocietyWorkbook(data: {
  invoices: MaintenanceInvoice[];
  rentals: RentalFlat[];
  amcs: AmcContract[];
  workOrders: WorkOrder[];
  visitors: Visitor[];
  members: SocietyMember[];
  complaints: Complaint[];
}) {
  const wb = XLSX.utils.book_new();

  // 1. Members
  const memberRows = data.members.map((m) => ({
    'Flat No': m.flatNumber,
    'Wing': m.wing,
    'Floor': m.floor,
    'Owner Name': m.ownerName,
    'Owner Phone': m.ownerPhone,
    'Resident Type': m.residentType,
    'Resident Name': m.residentName,
    'Intercom': m.intercomNumber,
    'Parking Slot': m.parkingSlot,
    'Area (SqFt)': m.areaSqFt,
    'Committee Role': m.committeeRole || 'Member',
    'Pending Dues (₹)': m.pendingDues,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(memberRows), 'Members Directory');

  // 2. Invoices
  const invRows = data.invoices.map((inv) => ({
    'Invoice No': inv.invoiceNo,
    'Flat No': inv.flatNumber,
    'Resident': inv.residentName,
    'Quarter': inv.quarter,
    'Total (₹)': inv.totalAmount,
    'Paid (₹)': inv.paidAmount,
    'Status': inv.status,
    'Due Date': inv.dueDate,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invRows), 'Invoices & Dues');

  // 3. Rental Flats
  const rentRows = data.rentals.map((r) => ({
    'Flat No': r.flatNumber,
    'Tenant Name': r.tenantName,
    'Tenant Contact': r.tenantPhone,
    'Agreement Start': r.agreementStartDate,
    'Agreement End': r.agreementEndDate,
    'Lift Charges Paid': r.liftChargesPaid ? 'Yes' : 'No',
    'Police NOC Status': r.policeNocStatus,
    'NOC Ref': r.policeNocRefNumber || 'Pending',
    'Status': r.status,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rentRows), 'Rental Flat Registry');

  // 4. AMC Contracts
  const amcRows = data.amcs.map((a) => ({
    'Contract': a.contractNumber,
    'Vendor': a.vendorName,
    'Service': a.serviceCategory,
    'Expiry Date': a.endDate,
    'Annual Value': a.annualValue,
    'Status': a.status,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(amcRows), 'AMC Contracts');

  // 5. Complaints
  const compRows = data.complaints.map((c) => ({
    'Ticket No': c.ticketNo,
    'Flat No': c.flatNumber,
    'Category': c.category,
    'Title': c.title,
    'Priority': c.priority,
    'Status': c.status,
    'Raised Date': c.createdAt,
    'Assigned Vendor': c.assignedVendorName || 'Unassigned',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(compRows), 'Complaints');

  downloadWorkbook(wb, 'Greenwood_Heights_Society_Master_ERP.xlsx');
}
