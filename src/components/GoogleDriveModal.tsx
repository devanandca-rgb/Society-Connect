import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ExternalLink,
  FileText,
  X,
  RefreshCw,
  LogOut,
  Folder,
} from 'lucide-react';
import { googleSignIn, googleSignOut, getAccessToken } from '../services/auth';
import { uploadToDrive, listDriveFiles, type DriveUploadResult } from '../services/drive';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDriveConnectedChange: (connected: boolean) => void;
  societyData: any;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onDriveConnectedChange,
  societyData,
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<Array<{ id: string; name: string; webViewLink?: string; createdTime?: string }>>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  useEffect(() => {
    checkToken();
  }, [isOpen]);

  const checkToken = async () => {
    const token = await getAccessToken();
    const connected = !!token;
    setIsSignedIn(connected);
    onDriveConnectedChange(connected);
    if (connected) {
      loadFiles();
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setIsSignedIn(true);
        onDriveConnectedChange(true);
        setStatusMessage('Successfully connected to Google Drive!');
        await loadFiles();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.message || 'Failed to authenticate with Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setIsSignedIn(false);
    onDriveConnectedChange(false);
    setDriveFiles([]);
    setStatusMessage('Disconnected from Google Drive.');
  };

  const handleBackupToDrive = async () => {
    setUploadProgress(true);
    setStatusMessage(null);
    try {
      const fileName = `Greenwood_Heights_Society_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const content = JSON.stringify(societyData, null, 2);
      const res = await uploadToDrive(fileName, content, 'application/json');
      setStatusMessage(`Saved "${res.name}" directly to your Google Drive!`);
      await loadFiles();
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.message || 'Failed to backup to Google Drive.');
    } finally {
      setUploadProgress(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Google Drive Workspace Integration</h3>
              <p className="text-xs text-blue-100">
                Secure cloud archive for society balance sheets, invoices, and rental agreements
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs space-y-5">
          {statusMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Connection Status Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Google Workspace Status
              </div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSignedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                  }`}
                />
                <span>{isSignedIn ? 'Google Drive Connected' : 'Not Connected'}</span>
              </div>
            </div>

            <div>
              {isSignedIn ? (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-1.5 text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                /* Official Google Sign-in button format matching guidelines */
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-300 shadow-xs hover:shadow-md text-slate-700 font-semibold text-xs transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Sync & Backup Actions */}
          {isSignedIn ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">Drive Synchronization</span>
                <button
                  onClick={handleBackupToDrive}
                  disabled={uploadProgress}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadProgress ? 'Uploading...' : 'Sync Master Data to Drive'}</span>
                </button>
              </div>

              {/* Files in Google Drive */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Recent Society Files in Drive
                  </span>
                  <button
                    onClick={loadFiles}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    title="Refresh file list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {driveFiles.length > 0 ? (
                    driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{file.name}</span>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 p-1 shrink-0"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No files uploaded yet. Click "Sync Master Data to Drive" above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-2 text-xs">
              <p className="font-semibold text-slate-800">
                Why connect Google Drive?
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px]">
                <li>Automatically save quarterly maintenance invoices and payment receipts.</li>
                <li>Archive official audited financial statements and AGM minutes.</li>
                <li>Export rental flat registry spreadsheets and AMC contract records.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
