"use client";

import { useState } from "react";
import { X, FileText, Download, ExternalLink, Image, File } from "lucide-react";

interface FilePreviewProps {
  url: string;
  fileName?: string;
  mimeType?: string;
}

export default function FilePreview({ url, fileName, mimeType }: FilePreviewProps) {
  const [open, setOpen] = useState(false);

  const isImage = mimeType?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isPdf = mimeType === "application/pdf" || url.endsWith(".pdf");

  const Icon = isImage ? Image : isPdf ? FileText : File;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
      >
        <Icon className="w-4 h-4" />
        {fileName || "View file"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 truncate">{fileName || "File Preview"}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href={url}
                  download
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50 flex items-center justify-center min-h-[300px]">
              {isImage ? (
                <img src={url} alt={fileName || "Preview"} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : isPdf ? (
                <iframe src={url} className="w-full h-[70vh] rounded-lg" title="PDF Preview" />
              ) : (
                <div className="text-center text-gray-500">
                  <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Preview not available for this file type.</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    <Download className="w-4 h-4" />
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
