'use client';

import React, { useState } from 'react';
import { QuestionAttachment } from '@/types';
import {
  FileText,
  ImageIcon,
  Download,
  Eye,
  ExternalLink,
  Paperclip,
  ZoomIn,
} from 'lucide-react';

interface QuestionAttachmentViewerProps {
  attachments?: QuestionAttachment[];
  layout?: 'compact' | 'expanded';
}

export function QuestionAttachmentViewer({
  attachments,
  layout = 'compact',
}: QuestionAttachmentViewerProps) {
  const [activeFile, setActiveFile] = useState<QuestionAttachment | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
        <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
        <span>Attachments & Reference Files ({attachments.length})</span>
      </div>

      {layout === 'expanded' ? (
        <div className="space-y-3">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
            >
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {file.category === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                  ) : file.category === 'pdf' ? (
                    <div className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black">
                      PDF
                    </div>
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="font-bold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    ({formatFileSize(file.size)})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {file.dataUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveFile(file)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Full View
                    </button>
                  )}
                  {file.dataUrl && (
                    <a
                      href={file.dataUrl}
                      download={file.name}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                </div>
              </div>

              {/* Inline preview for images */}
              {file.category === 'image' && file.dataUrl && (
                <div
                  onClick={() => setActiveFile(file)}
                  className="p-3 bg-slate-100/50 flex justify-center cursor-pointer group relative"
                  title="Click to enlarge"
                >
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="max-h-72 object-contain rounded border border-slate-200 group-hover:opacity-95 transition"
                  />
                  <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-md opacity-0 group-hover:opacity-100 transition">
                    <ZoomIn className="w-3.5 h-3.5" /> Enlarge
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Compact pills */
        <div className="flex flex-wrap gap-2">
          {attachments.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setActiveFile(file)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 transition text-xs font-semibold text-slate-800 shadow-2xs group"
            >
              {file.category === 'image' ? (
                <ImageIcon className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition shrink-0" />
              ) : file.category === 'pdf' ? (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black shrink-0">
                  PDF
                </span>
              ) : file.name.endsWith('.sql') ? (
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-black shrink-0">
                  SQL
                </span>
              ) : (
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span className="truncate max-w-[180px]">{file.name}</span>
              <span className="text-[10px] text-slate-600">({formatFileSize(file.size)})</span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Document Viewer Modal */}
      {activeFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                <h3 className="font-extrabold text-slate-900 text-sm truncate">
                  {activeFile.name}
                </h3>
                <span className="text-xs text-slate-600 font-medium shrink-0">
                  ({formatFileSize(activeFile.size)})
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeFile.dataUrl && (
                  <a
                    href={activeFile.dataUrl}
                    download={activeFile.name}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
                <button
                  onClick={() => setActiveFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-800 text-base font-bold rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 rounded-xl p-2 min-h-[350px]">
              {activeFile.category === 'image' && activeFile.dataUrl ? (
                <img
                  src={activeFile.dataUrl}
                  alt={activeFile.name}
                  className="max-h-[70vh] max-w-full object-contain rounded shadow"
                />
              ) : activeFile.category === 'pdf' && activeFile.dataUrl ? (
                <iframe
                  src={activeFile.dataUrl}
                  title={activeFile.name}
                  className="w-full h-[70vh] rounded border border-slate-300"
                />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">{activeFile.name}</p>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Document ready. Download to inspect the full file.
                  </p>
                  {activeFile.dataUrl && (
                    <a
                      href={activeFile.dataUrl}
                      download={activeFile.name}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition"
                    >
                      <Download className="w-4 h-4" /> Download {activeFile.name}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
