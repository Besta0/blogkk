/**
 * File Manager Page
 * Admin page for managing uploaded files and images
 */
import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Image as ImageIcon,
  FileImage,
  X,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import type { UploadResponse } from '../../api/types';

interface UploadedFile {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format?: string;
  bytes?: number;
  uploadedAt: Date;
}

export default function FileManager() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`文件 "${file.name}" 不是有效的图片格式`);
        continue;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError(`文件 "${file.name}" 超过5MB大小限制`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await apiClient.post<{ success: boolean; data: UploadResponse }>(
          '/upload/image',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              setUploadProgress(progress);
            },
          }
        );

        if (response.data.success && response.data.data) {
          newFiles.push({
            url: response.data.data.url,
            publicId: response.data.data.publicId,
            width: response.data.data.width,
            height: response.data.data.height,
            uploadedAt: new Date(),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `上传 "${file.name}" 失败`);
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...newFiles, ...prev]);
    }

    setIsUploading(false);
    setUploadProgress(0);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (publicId: string) => {
    try {
      await apiClient.delete(`/upload/image/${encodeURIComponent(publicId)}`);
      setUploadedFiles((prev) => prev.filter((f) => f.publicId !== publicId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      setError('复制失败');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">文件管理</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          上传和管理图片文件，支持 JPG、PNG、WebP、GIF 格式
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">上传中... {uploadProgress}%</p>
            <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-800 dark:text-white">
                拖拽图片到这里上传
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                或点击选择文件 • 最大 5MB • 支持多文件上传
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files Grid */}
      {uploadedFiles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            已上传文件 ({uploadedFiles.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file) => (
              <FileCard
                key={file.publicId}
                file={file}
                onCopy={() => copyToClipboard(file.url)}
                onDelete={() => setDeleteConfirm(file.publicId)}
                isCopied={copiedUrl === file.url}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadedFiles.length === 0 && !isUploading && (
        <div className="text-center py-12">
          <FileImage className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            暂无上传的文件，开始上传您的第一张图片吧
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">确认删除</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              确定要删除这个文件吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// File Card Component
interface FileCardProps {
  file: UploadedFile;
  onCopy: () => void;
  onDelete: () => void;
  isCopied: boolean;
  formatFileSize: (bytes?: number) => string;
}

function FileCard({ file, onCopy, onDelete, isCopied, formatFileSize }: FileCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden group">
      {/* Image Preview */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
        <img
          src={file.url}
          alt="Uploaded file"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Error';
          }}
        />
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onCopy}
            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            title="复制URL"
          >
            {isCopied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-700" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            title="删除"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>

      {/* File Info */}
      <div className="p-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <ImageIcon className="w-3 h-3" />
          <span>
            {file.width}×{file.height}
          </span>
          {file.bytes && <span>• {formatFileSize(file.bytes)}</span>}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate" title={file.publicId}>
          {file.publicId}
        </p>
      </div>
    </div>
  );
}
