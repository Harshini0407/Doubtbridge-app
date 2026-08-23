import React from 'react';
import { InteractionLogEntry } from '../types';
import { Download, X, FileText, CheckCircle2, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';

interface SessionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: InteractionLogEntry[];
}

export const SessionLogModal: React.FC<SessionLogModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `doubtbridge-session-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1330]/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF6E9] w-full max-w-2xl rounded-3xl border border-[#E3D6BC] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="bg-[#221631] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FFB937]" />
            <h2 className="font-display font-bold text-base">Student Session Interaction Log</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#FFF6E9] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-[#8A7A5C]">
            Every doubt resolved in this session is recorded below with syllabus metadata and feedback metrics.
          </p>

          {logs.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#8A7A5C]">
              No doubts asked yet in this session. Ask a question to see it appear here!
            </div>
          ) : (
            logs.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className="bg-white p-4 rounded-2xl border border-[#E3D6BC] shadow-xs space-y-1.5 text-xs"
              >
                <div className="font-bold text-sm text-[#1B1330]">"{entry.question}"</div>
                <div className="text-[#8A7A5C] flex flex-wrap items-center gap-2">
                  <span className="bg-[#F3ECDD] px-2 py-0.5 rounded font-semibold text-[#5A4E38]">
                    {entry.board} · {entry.subject} · {entry.grade}
                  </span>
                  <span>{entry.topic}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8A7A5C] pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span>
                    {entry.helpful === true ? (
                      <span className="text-[#2E8B6F] font-bold flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> Helpful
                      </span>
                    ) : entry.helpful === false ? (
                      <span className="text-[#FF5F4E] font-bold flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3" /> Needs Improvement
                      </span>
                    ) : (
                      '— No feedback recorded'
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-[#E3D6BC] flex items-center justify-between">
          <span className="text-xs text-[#8A7A5C]">Total Entries: <b>{logs.length}</b></span>
          <button
            type="button"
            disabled={logs.length === 0}
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl bg-[#1B1330] hover:bg-[#221631] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-40 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Log (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
