import { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  HardDrive,
  Download,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  PhoneCall,
} from 'lucide-react';
import type { SocietyUser, UserRole, Visitor } from '../types/society';
import { DEMO_USERS } from '../services/auth';

interface NavbarProps {
  currentUser: SocietyUser;
  onRoleChange: (role: UserRole) => void;
  pendingVisitorsCount: number;
  onOpenDriveModal: () => void;
  isDriveConnected: boolean;
  onOpenSosModal: () => void;
  onExportMasterExcel: () => void;
  pendingResidentApprovalVisitor?: Visitor;
  onQuickApproveVisitor?: (visitorId: string, approved: boolean) => void;
}

export const Navbar = ({
  currentUser,
  onRoleChange,
  pendingVisitorsCount,
  onOpenDriveModal,
  isDriveConnected,
  onOpenSosModal,
  onExportMasterExcel,
  pendingResidentApprovalVisitor,
  onQuickApproveVisitor,
}: NavbarProps) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(true);

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    committee: {
      label: 'Managing Committee',
      badge: 'MC Admin / Chairman',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    manager: {
      label: 'Society Manager',
      badge: 'Operations & Estate Mgr',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    resident: {
      label: 'Resident Member',
      badge: 'Flat B-402 (Owner)',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    guard: {
      label: 'Security Guard',
      badge: 'Gate 1 Terminal',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Society Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  Greenwood Heights
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  CHS Ltd.
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Reg: MUM/MH-2018-948 • 80 Units • Bandra West
              </p>
            </div>
          </div>

          {/* Action Center & Profile Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Master Excel Export */}
            <button
              onClick={onExportMasterExcel}
              title="Download Society Master Workbook (Excel .xlsx)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export Excel</span>
            </button>

            {/* Google Drive Status Button */}
            <button
              onClick={onOpenDriveModal}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isDriveConnected
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <HardDrive className={`w-3.5 h-3.5 ${isDriveConnected ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">
                {isDriveConnected ? 'Drive Connected' : 'Google Drive'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isDriveConnected ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSosModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-200 transition-all hover:scale-105 active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/80 transition-colors text-left"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {roleLabels[currentUser.role]?.badge}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Role / Demo Persona
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Test access permissions across society modules
                      </p>
                    </div>

                    <div className="mt-1 space-y-1">
                      {(Object.keys(DEMO_USERS) as UserRole[]).map((role) => {
                        const user = DEMO_USERS[role];
                        const isSelected = currentUser.role === role;
                        return (
                          <button
                            key={role}
                            onClick={() => {
                              onRoleChange(role);
                              setShowRoleMenu(false);
                            }}
                            className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                              isSelected
                                ? 'bg-indigo-50 text-indigo-900 font-medium'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover mt-0.5 ring-1 ring-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900 truncate">
                                  {user.name}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {user.designation} {user.flatNumber ? `(${user.flatNumber})` : ''}
                              </div>
                              <span
                                className={`inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded font-semibold border ${roleLabels[role].color}`}
                              >
                                {roleLabels[role].label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50 rounded-lg">
                      💡 Switching roles immediately updates permissions and accessible management features.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Resident Visitor Approval Alert Banner (Shown to Resident when visitor is waiting) */}
        {currentUser.role === 'resident' &&
          pendingResidentApprovalVisitor &&
          showNotificationToast && (
            <div className="my-2 p-3 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Gate 1 Alert: Visitor Waiting for Your Flat ({pendingResidentApprovalVisitor.flatNumber})</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[10px]">
                      {pendingResidentApprovalVisitor.purpose}
                    </span>
                  </div>
                  <div className="text-amber-800 mt-0.5">
                    <strong>{pendingResidentApprovalVisitor.visitorName}</strong> ({pendingResidentApprovalVisitor.phone})
                    {pendingResidentApprovalVisitor.vehicleNumber ? ` • Vehicle: ${pendingResidentApprovalVisitor.vehicleNumber}` : ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onQuickApproveVisitor?.(pendingResidentApprovalVisitor.id, false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-700 font-semibold hover:bg-rose-50 transition-colors"
                >
                  Deny Entry
                </button>
                <button
                  onClick={() => onQuickApproveVisitor?.(pendingResidentApprovalVisitor.id, true)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                >
                  Approve & Allow In
                </button>
                <button
                  onClick={() => setShowNotificationToast(false)}
                  className="text-slate-400 hover:text-slate-600 px-1"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
      </div>
    </header>
  );
};
