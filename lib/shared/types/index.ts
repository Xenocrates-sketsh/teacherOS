export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface TeacherSchool {
  teacher_id: string;
  school_id: string;
  role: "admin" | "teacher";
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  created_at: string;
}

export interface SubjectWorkspace {
  id: string;
  class_id: string;
  name: string;
  subject: string;
  created_at: string;
}

export interface StudentClass {
  student_id: string;
  class_id: string;
  joined_at: string;
}

export interface ClassCode {
  id: string;
  class_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface Homework {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  due_date: string;
  created_by: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface Resource {
  id: string;
  workspace_id: string;
  title: string;
  type: "file" | "link";
  file_url?: string;
  link_url?: string;
  created_by: string;
  created_at: string;
}

export interface StudentProfile {
  user_id: string;
  student_id: string;
  school_id: string;
}
