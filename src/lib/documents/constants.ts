export const DOCUMENT_CATEGORIES = [
  "Contract",
  "Invoice",
  "Quotation",
  "Company Registration",
  "PACRA Documents",
  "ZRA Documents",
  "Tax Clearance",
  "Report",
  "Certificate",
  "Technical Documentation",
  "Design Files",
  "Source Code",
  "Backup",
  "Other",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".zip",
  ".rar",
  ".png",
  ".jpg",
  ".jpeg",
  ".txt",
];

export const ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.rar",
  "application/x-rar-compressed",
  "image/png",
  "image/jpeg",
  "text/plain",
];

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB
export const STORAGE_BUCKET = "project-documents";

export const PREVIEWABLE_TYPES = ["application/pdf", "image/png", "image/jpeg", "text/plain"];

export function isPreviewable(fileType: string): boolean {
  return PREVIEWABLE_TYPES.includes(fileType);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function extFromName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}
