export const ROLES = {
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export const SCHOOL_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
} as const;

export const RESOURCE_TYPES = {
  FILE: "file",
  LINK: "link",
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
