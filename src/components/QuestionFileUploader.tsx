'use client';

import React, { useRef, useState } from 'react';
import { QuestionAttachment } from '@/types';
import {
  Upload,
  FileText,
  FileCode,
  Image as ImageIcon,
  X,
  File,
  Eye,
  Sparkles,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface QuestionFileUploaderProps {
  attachments: QuestionAttachment[];
  onAttachmentsChange: (attachments: QuestionAttachment[]) => void;
  onAutoFillFromContent?: (extracted: {
    title?: string;
    problem_statement?: string;
    schema_ddl?: string;
    seed_data_sql?: string;
    reference_query?: string;
  }) => void;
}

export function QuestionFileUploader({
  attachments,
  onAttachmentsChange,
  onAutoFillFromContent,
}: QuestionFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreview, setActivePreview] = useState<QuestionAttachment | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategory = (file: File): 'pdf' | 'image' | 'document' | 'other' => {
    if (file.type.includes('pdf') || file.name.endsWith('.pdf')) return 'pdf';
    if (file.type.startsWith('image/')) return 'image';
    if (
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.sql') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.json')
    ) {
      return 'document';
    }
    return 'other';
  };

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const newAttachments: QuestionAttachment[] = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const category = getCategory(file);

      // Read as Data URL for storage & instant client preview
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      let extractedText = '';

      // If text/sql/md, also extract text
      if (
        file.name.endsWith('.sql') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.json')
      ) {
        extractedText = await new Promise<string>((resolve) => {
          const textReader = new FileReader();
          textReader.onload = () => resolve(textReader.result as string);
          textReader.onerror = () => resolve('');
          textReader.readAsText(file);
        });

        // Trigger intelligent auto-fill if callback provided
        if (onAutoFillFromContent && extractedText) {
          if (file.name.endsWith('.sql')) {
            const ddlMatch = extractedText.match(/CREATE\s+TABLE[\s\S]*?;/gi);
            const insertMatch = extractedText.match(/INSERT\s+INTO[\s\S]*?;/gi);
            const selectMatch = extractedText.match(/SELECT[\s\S]*?;/gi);

            onAutoFillFromContent({
              title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
              schema_ddl: ddlMatch ? ddlMatch.join('\n\n') : undefined,
              seed_data_sql: insertMatch ? insertMatch.join('\n\n') : undefined,
              reference_query: selectMatch ? selectMatch[0] : undefined,
            });
          } else {
            onAutoFillFromContent({
              title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
              problem_statement: extractedText.slice(0, 1500),
            });
          }
        }
      } else if (category === 'pdf' || category === 'image') {
        // If uploading a PDF or Image and user has auto-fill hook
        if (onAutoFillFromContent) {
          onAutoFillFromContent({
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            problem_statement: `Refer to attached ${category.toUpperCase()} document (${file.name}) for the complete question specifications and table schemas.`,
          });
        }
      }

      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        category,
        uploaded_at: new Date().toISOString(),
        extractedText,
      });
    }

    onAttachmentsChange(newAttachments);
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
    if (activePreview?.id === id) {
      setActivePreview(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-800 text-xs sm:text-sm">
          Question Attachments & Documents
        </label>
        <span className="text-[11px] font-semibold text-slate-500">
          PDFs, ER Diagrams (PNG/JPG), Word/Doc, SQL & Text
        </span>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50/80 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.doc,.docx,.txt,.md,.sql,.csv,.json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFiles(e.target.files);
            }
          }}
        />

        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
          <Upload className="w-5 h-5" />
        </div>

        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Click to upload or drag & drop files here
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Attach assignment PDFs, ER diagrams, schema screenshots, or .SQL files (Max 25MB)
          </p>
        </div>

        {isProcessing && (
          <div className="text-xs font-bold text-indigo-600 animate-pulse flex items-center gap-1.5 mt-1">
            <Sparkles className="w-3.5 h-3.5" /> Processing and embedding files...
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Attached Files ({attachments.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition shadow-xs text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {file.category === 'image' ? (
                    file.dataUrl ? (
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-8 h-8 rounded object-cover border border-slate-300 shrink-0"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                    )
                  ) : file.category === 'pdf' ? (
                    <div className="w-8 h-8 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-black text-[10px] shrink-0 border border-rose-200">
                      PDF
                    </div>
                  ) : file.name.endsWith('.sql') ? (
                    <div className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-black text-[10px] shrink-0 border border-purple-200">
                      SQL
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-black text-[10px] shrink-0 border border-blue-200">
                      DOC
                    </div>
                  )}

                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-600 font-medium">
                      {formatFileSize(file.size)} • {file.category.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {file.dataUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreview(file);
                      }}
                      className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="View file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttachment(file.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-md">
                  {activePreview.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {activePreview.dataUrl && (
                  <a
                    href={activePreview.dataUrl}
                    download={activePreview.name}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
                <button
                  onClick={() => setActivePreview(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 rounded-xl p-2 min-h-[300px]">
              {activePreview.category === 'image' && activePreview.dataUrl ? (
                <img
                  src={activePreview.dataUrl}
                  alt={activePreview.name}
                  className="max-h-[60vh] max-w-full object-contain rounded shadow-sm"
                />
              ) : activePreview.category === 'pdf' && activePreview.dataUrl ? (
                <iframe
                  src={activePreview.dataUrl}
                  title={activePreview.name}
                  className="w-full h-[60vh] rounded border border-slate-300"
                />
              ) : (
                <div className="p-6 text-center space-y-2">
                  <File className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">{activePreview.name}</p>
                  <p className="text-xs text-slate-500">
                    Document ready. Download to view complete contents.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
