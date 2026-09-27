import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  AlertCircle,
  Users,
  Home,
  UserCheck,
  CalendarDays,
  Wrench,
  Megaphone,
  PhoneCall,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import type { UserRole } from '../types/society';

export type ActiveTab =
  | 'dashboard'
  | 'invoices'
  | 'complaints'
  | 'members'
  | 'rentals'
  | 'visitors'
  | 'hall'
  | 'vendors'
  | 'notices'
  | 'emergency';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  counts: {
    overdueInvoices: number;
    openComplaints: number;
    pendingVisitors: number;
    expiringRentals: number;
    expiringAmcs: number;
    pendingNoc: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  counts,
}) => {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    sublabel?: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    allowedRoles?: UserRole[];
  }> = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      sublabel: 'Summary & Metrics',
      icon: LayoutDashboard,
    },
    {
      id: 'invoices',
      label: userRole === 'resident' ? 'My Maintenance Bills' : 'Invoices & Overdue',
      sublabel: userRole === 'resident' ? 'Quarterly Dues & Pay' : 'Billing & Collections',
      icon: Receipt,
      badge: counts.overdueInvoices > 0 ? counts.overdueInvoices : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'complaints',
      label: 'Complaints & Helpdesk',
      sublabel: userRole === 'committee' ? 'Take Action & Approve' : 'Raise & Track Tickets',
      icon: AlertCircle,
      badge: counts.openComplaints > 0 ? counts.openComplaints : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'members',
      label: 'Members Directory',
      sublabel: 'Flats & Residents',
      icon: Users,
    },
    {
      id: 'rentals',
      label: 'Rental Flat Registry',
      sublabel: 'Agreements, NOC & Lift',
      icon: Home,
      badge: counts.pendingNoc > 0 ? counts.pendingNoc : undefined,
      badgeColor: 'bg-orange-500 text-white',
    },
    {
      id: 'visitors',
      label: 'Visitor & Maid Gate',
      sublabel: 'Approval & Gate Logs',
      icon: UserCheck,
      badge: counts.pendingVisitors > 0 ? counts.pendingVisitors : undefined,
      badgeColor: 'bg-indigo-600 text-white animate-pulse',
    },
    {
      id: 'hall',
      label: 'Common Hall Booking',
      sublabel: 'Banquet & Clubhouse',
      icon: CalendarDays,
    },
    {
      id: 'vendors',
      label: 'Vendors & AMC',
      sublabel: 'Work Orders & Contracts',
      icon: Wrench,
      badge: counts.expiringAmcs > 0 ? counts.expiringAmcs : undefined,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'notices',
      label: 'Notice Board',
      sublabel: 'AGM, Audit & Festivals',
      icon: Megaphone,
    },
    {
      id: 'emergency',
      label: 'Emergency Directory',
      sublabel: 'Police, Hospital, Fire',
      icon: PhoneCall,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 shrink-0 flex flex-col justify-between select-none">
      <div className="p-3 sm:p-4">
        {/* Role contextual badge */}
        <div className="mb-4 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Active Mode
          </div>
          <div className="font-bold text-white capitalize flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {userRole === 'committee' && 'Managing Committee (Admin)'}
              {userRole === 'manager' && 'Society Manager (Operations)'}
              {userRole === 'resident' && 'Resident Member (Self Service)'}
              {userRole === 'guard' && 'Security Gate Desk'}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className="truncate">{item.label}</div>
                    {item.sublabel && (
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-indigo-200' : 'text-slate-500'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    )}
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor || 'bg-slate-700 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Society Quick Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">Society Status</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
        <p className="text-slate-500 text-[10px] leading-tight">
          Audit Grade A • Solar Net Metering • CCTV 24x7
        </p>
      </div>
    </aside>
  );
};
