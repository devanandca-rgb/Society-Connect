import React, { useState } from 'react';
import {
  Megaphone,
  Calendar,
  FileText,
  DollarSign,
  Sparkles,
  Download,
  Plus,
  Search,
  Filter,
  Pin,
  Clock,
  CheckCircle2,
  HardDrive,
  X,
  Building,
} from 'lucide-react';
import type { Notice, SocietyUser } from '../types/society';

interface NoticeBoardProps {
  notices: Notice[];
  currentUser: SocietyUser;
  onAddNotice: (notice: Omit<Notice, 'id' | 'publishedDate'>) => void;
  onSaveToDrive?: (notice: Notice) => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  notices,
  currentUser,
  onAddNotice,
  onSaveToDrive,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(notices[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Notice Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Notice['category']>('AGM & EGM');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingVenue, setNewMeetingVenue] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredNotices = notices.filter((n) => {
    const matchesCategory =
      selectedCategory === 'All' ? true : n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNotice({
      noticeNumber: `NOT-2026-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      category: newCategory,
      issuedBy: currentUser.role === 'committee' ? 'Managing Committee' : 'Estate Manager',
      summary: newSummary,
      content: newContent,
      meetingDate: newMeetingDate || undefined,
      meetingVenue: newMeetingVenue || undefined,
      isPinned,
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    showToast('New society circular published successfully to the Notice Board!');
  };

  const handleSimulateDownload = (n: Notice) => {
    // Generate text blob for attachment download
    const blob = new Blob([`${n.title}\n\n${n.content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = n.attachmentName || `${n.noticeNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded document: ${n.attachmentName || 'Notice Circular'}`);
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
            Digital Notice Board & Society Circulars
          </h2>
          <p className="text-xs text-slate-500">
            Official announcements: AGM / EGM general body meetings, audited financial statements, festival celebrations, and maintenance alerts.
          </p>
        </div>

        {(currentUser.role === 'committee' || currentUser.role === 'manager') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(
            [
              'All',
              'AGM & EGM',
              'Audited Financials',
              'Festivals & Events',
              'Maintenance & Utility',
            ] as const
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'AGM & EGM'
                ? '🏛️ AGM & EGM'
                : cat === 'Audited Financials'
                ? '📊 Audited Financials'
                : cat === 'Festivals & Events'
                ? '🎉 Festivals & Events'
                : cat === 'Maintenance & Utility'
                ? '🛠️ Maintenance'
                : 'All Notices'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search circulars, agenda, audits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Grid: Left List (1 col) + Right Detailed Viewer (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of Notices */}
        <div className="space-y-3">
          {filteredNotices.map((n) => {
            const isSelected = activeNotice?.id === n.id;
            return (
              <div
                key={n.id}
                onClick={() => setActiveNotice(n)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {n.isPinned && (
                  <span className="absolute top-3 right-3 text-indigo-600">
                    <Pin className="w-3.5 h-3.5 fill-indigo-600" />
                  </span>
                )}

                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-indigo-600">{n.category}</span>
                  <span>•</span>
                  <span>{n.publishedDate}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                  {n.title}
                </h3>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {n.summary}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>By: {n.issuedBy}</span>
                  {n.attachmentName && (
                    <span className="text-emerald-700 font-semibold">📎 Attached PDF</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detailed Notice Viewer */}
        <div className="lg:col-span-2">
          {activeNotice ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Notice Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {activeNotice.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Circular #{activeNotice.noticeNumber}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {activeNotice.title}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div>
                    Published on: <strong>{activeNotice.publishedDate}</strong>
                  </div>
                  <div>
                    Issued by: <strong>{activeNotice.issuedBy}</strong>
                  </div>
                </div>
              </div>

              {/* Special Metadata (for AGM or Audited Financials) */}
              {activeNotice.meetingDate && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>General Body Meeting Schedule</span>
                  </div>
                  <div>
                    <strong>Date & Time:</strong> {activeNotice.meetingDate}
                  </div>
                  <div>
                    <strong>Venue:</strong> {activeNotice.meetingVenue}
                  </div>
                  {activeNotice.quorumDetails && (
                    <div>
                      <strong>Quorum Rule:</strong> {activeNotice.quorumDetails}
                    </div>
                  )}
                </div>
              )}

              {activeNotice.financialYear && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Audit Certification Details</span>
                  </div>
                  <div>
                    <strong>Financial Period:</strong> {activeNotice.financialYear}
                  </div>
                  <div>
                    <strong>Auditing Firm:</strong> {activeNotice.auditorName}
                  </div>
                  <div className="text-emerald-800 font-semibold">
                    ✓ Clean Unqualified Audit Report with Grade "A" Rating
                  </div>
                </div>
              )}

              {/* Full Content */}
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-sans">
                {activeNotice.content}
              </div>

              {/* Attachments & Google Drive Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                {activeNotice.attachmentName ? (
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">
                      {activeNotice.attachmentName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({activeNotice.attachmentSize || '1.2 MB'})
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Official Society Circular</div>
                )}

                <div className="flex items-center gap-2">
                  {onSaveToDrive && (
                    <button
                      onClick={() => onSaveToDrive(activeNotice)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Save to Google Drive</span>
                    </button>
                  )}

                  {activeNotice.attachmentName && (
                    <button
                      onClick={() => handleSimulateDownload(activeNotice)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Document</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select a notice from the left to view the full circular.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Publish New Notice */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Publish Official Society Notice</h3>
                <div className="text-xs text-indigo-300">
                  Broadcast circular to all 80 member flats
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="AGM & EGM">AGM & EGM Notice</option>
                  <option value="Audited Financials">Past Audited Financials</option>
                  <option value="Festivals & Events">Festivals & Celebrations</option>
                  <option value="Maintenance & Utility">Maintenance & Utility Circular</option>
                  <option value="General Circular">General Advisory</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Circular Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Notice of Special General Body Meeting on Solar PV"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brief Summary (1-2 lines)</label>
                <input
                  type="text"
                  required
                  placeholder="Brief synopsis shown in notifications..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {newCategory === 'AGM & EGM' && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-0.5">
                      Meeting Date & Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sunday, 11th Oct at 10:30 AM"
                      value={newMeetingDate}
                      onChange={(e) => setNewMeetingDate(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 mb-0.5">
                      Meeting Venue
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Community Banquet Hall"
                      value={newMeetingVenue}
                      onChange={(e) => setNewMeetingVenue(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Circular Text / Agenda</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Official agenda, resolutions to be tabled, inspection hours, rules..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span>Pin notice to top of board</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
