import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  Car,
  Home,
  ShieldCheck,
  Building2,
  PhoneCall,
  CheckCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { SocietyMember } from '../types/society';
import { downloadWorkbook } from '../services/excel';

interface MembersDirectoryProps {
  members: SocietyMember[];
}

export const MembersDirectory: React.FC<MembersDirectoryProps> = ({ members }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wingFilter, setWingFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedMember, setSelectedMember] = useState<SocietyMember | null>(null);
  const [intercomToast, setIntercomToast] = useState<string | null>(null);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.residentPhone.includes(searchTerm) ||
      m.intercomNumber.includes(searchTerm);

    const matchesWing = wingFilter === 'All' ? true : m.wing === wingFilter;
    const matchesType = typeFilter === 'All' ? true : m.residentType === typeFilter;

    return matchesSearch && matchesWing && matchesType;
  });

  const handleExportExcel = () => {
    const rows = members.map((m) => ({
      'Flat No': m.flatNumber,
      'Wing': m.wing,
      'Floor': m.floor,
      'Resident Name': m.residentName,
      'Resident Type': m.residentType,
      'Contact Phone': m.residentPhone,
      'Owner Name': m.ownerName,
      'Owner Phone': m.ownerPhone,
      'Intercom Extension': m.intercomNumber,
      'Parking Slot': m.parkingSlot,
      'Carpet Area (Sq.Ft)': m.areaSqFt,
      'Committee Office': m.committeeRole || 'General Member',
      'Outstanding Dues (₹)': m.pendingDues,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Society Members Directory');
    downloadWorkbook(wb, 'Greenwood_Heights_Members_Directory.xlsx');
  };

  const handleSimulateIntercom = (m: SocietyMember) => {
    setIntercomToast(`Dialing Intercom Ext #${m.intercomNumber} (Flat ${m.flatNumber})... Connected!`);
    setTimeout(() => setIntercomToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {intercomToast && (
        <div className="fixed top-20 right-5 z-50 bg-indigo-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
          <span>{intercomToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Society Members & Flats Directory</h2>
          <p className="text-xs text-slate-500">
            Resident registry across Wings A, B, C & D with parking slots and intercom extensions.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Directory (.xlsx)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search flat number, resident name, phone, intercom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Wing:</span>
            {(['All', 'A', 'B', 'C', 'D'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setWingFilter(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  wingFilter === w
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Owner">Owner Occupied</option>
              <option value="Tenant">Tenant Occupied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900">
                    Flat {member.flatNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      member.residentType === 'Owner'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {member.residentType}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {member.residentName}
                </div>
              </div>

              {member.committeeRole && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>{member.committeeRole}</span>
                </span>
              )}
            </div>

            {member.residentType === 'Tenant' && (
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                <strong>Flat Owner:</strong> {member.ownerName} ({member.ownerPhone})
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Wing {member.wing}, Floor {member.floor}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{member.parkingSlot}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Intercom: <strong>{member.intercomNumber}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{member.areaSqFt} Sq.Ft</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center justify-between">
              <a
                href={`tel:${member.residentPhone}`}
                className="text-[11px] font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{member.residentPhone}</span>
              </a>

              <button
                onClick={() => handleSimulateIntercom(member)}
                className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Ring Intercom</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
