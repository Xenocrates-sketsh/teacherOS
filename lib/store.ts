const STORE_PREFIX = "tw_";

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(STORE_PREFIX + key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Schools
export interface School {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export function getSchools(): School[] {
  return getItem<School[]>("schools", []);
}

export function saveSchool(school: Omit<School, "id" | "created_at">): School {
  const schools = getSchools();
  const s: School = { ...school, id: generateId(), created_at: new Date().toISOString() };
  schools.push(s);
  setItem("schools", schools);
  return s;
}

// Classes
export interface Class {
  id: string;
  school_id: string;
  name: string;
  archived: boolean;
  created_at: string;
}

export function getClasses(schoolId?: string): Class[] {
  const all = getItem<Class[]>("classes", []);
  return schoolId ? all.filter((c) => c.school_id === schoolId) : all;
}

export function saveClass(c: Omit<Class, "id" | "created_at">): Class {
  const classes = getClasses();
  const cls: Class = { ...c, id: generateId(), created_at: new Date().toISOString() };
  classes.push(cls);
  setItem("classes", classes);
  return cls;
}

export function updateClass(id: string, updates: Partial<Class>) {
  const classes = getClasses();
  const idx = classes.findIndex((c) => c.id === id);
  if (idx !== -1) {
    classes[idx] = { ...classes[idx], ...updates };
    setItem("classes", classes);
  }
}

export function deleteClass(id: string) {
  setItem("classes", getClasses().filter((c) => c.id !== id));
}

// Teacher-School relationships
export interface TeacherSchool {
  teacher_id: string;
  school_id: string;
  role: "admin" | "teacher";
}

export function getTeacherSchools(teacherId?: string): TeacherSchool[] {
  const all = getItem<TeacherSchool[]>("teacher_schools", []);
  return teacherId ? all.filter((ts) => ts.teacher_id === teacherId) : all;
}

export function saveTeacherSchool(ts: TeacherSchool) {
  const list = getTeacherSchools();
  list.push(ts);
  setItem("teacher_schools", list);
}

// Student enrollments
export interface StudentClass {
  student_id: string;
  class_id: string;
  joined_at: string;
}

export function getStudentClasses(studentId?: string, classId?: string): StudentClass[] {
  let all = getItem<StudentClass[]>("student_classes", []);
  if (studentId) all = all.filter((sc) => sc.student_id === studentId);
  if (classId) all = all.filter((sc) => sc.class_id === classId);
  return all;
}

export function enrollStudent(studentId: string, classId: string) {
  const list = getStudentClasses();
  if (!list.some((sc) => sc.student_id === studentId && sc.class_id === classId)) {
    list.push({ student_id: studentId, class_id: classId, joined_at: new Date().toISOString() });
    setItem("student_classes", list);
  }
}

// Class codes
export interface ClassCode {
  id: string;
  class_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export function getClassCodes(classId?: string): ClassCode[] {
  const all = getItem<ClassCode[]>("class_codes", []);
  return classId ? all.filter((cc) => cc.class_id === classId) : all;
}

export function saveClassCode(cc: Omit<ClassCode, "id" | "created_at">): ClassCode {
  const list = getClassCodes();
  const code: ClassCode = { ...cc, id: generateId(), created_at: new Date().toISOString() };
  list.push(code);
  setItem("class_codes", list);
  return code;
}

// Workspaces
export interface Workspace {
  id: string;
  class_id: string;
  name: string;
  subject: string;
  created_at: string;
}

export function getWorkspaces(classId?: string): Workspace[] {
  const all = getItem<Workspace[]>("workspaces", []);
  return classId ? all.filter((w) => w.class_id === classId) : all;
}

export function saveWorkspace(w: Omit<Workspace, "id" | "created_at">): Workspace {
  const list = getWorkspaces();
  const ws: Workspace = { ...w, id: generateId(), created_at: new Date().toISOString() };
  list.push(ws);
  setItem("workspaces", list);
  return ws;
}

// Lessons
export interface Lesson {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export function getLessons(workspaceId?: string): Lesson[] {
  const all = getItem<Lesson[]>("lessons", []);
  return workspaceId ? all.filter((l) => l.workspace_id === workspaceId) : all;
}

export function saveLesson(l: Omit<Lesson, "id" | "created_at">): Lesson {
  const list = getLessons();
  const lesson: Lesson = { ...l, id: generateId(), created_at: new Date().toISOString() };
  list.push(lesson);
  setItem("lessons", list);
  return lesson;
}

// Homework
export interface Homework {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  due_date: string | null;
  created_by: string;
  created_at: string;
}

export function getHomeworkList(workspaceId?: string): Homework[] {
  const all = getItem<Homework[]>("homework", []);
  return workspaceId ? all.filter((h) => h.workspace_id === workspaceId) : all;
}

export function saveHomework(h: Omit<Homework, "id" | "created_at">): Homework {
  const list = getHomeworkList();
  const hw: Homework = { ...h, id: generateId(), created_at: new Date().toISOString() };
  list.push(hw);
  setItem("homework", list);
  return hw;
}

// Announcements
export interface Announcement {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export function getAnnouncements(workspaceId?: string): Announcement[] {
  const all = getItem<Announcement[]>("announcements", []);
  return workspaceId ? all.filter((a) => a.workspace_id === workspaceId) : all;
}

export function saveAnnouncement(a: Omit<Announcement, "id" | "created_at">): Announcement {
  const list = getAnnouncements();
  const ann: Announcement = { ...a, id: generateId(), created_at: new Date().toISOString() };
  list.push(ann);
  setItem("announcements", list);
  return ann;
}

// Submissions
export interface Submission {
  id: string;
  homework_id: string;
  student_id: string;
  content: string;
  file_url: string | null;
  submitted_at: string;
}

export function getSubmissions(homeworkId?: string, studentId?: string): Submission[] {
  let all = getItem<Submission[]>("submissions", []);
  if (homeworkId) all = all.filter((s) => s.homework_id === homeworkId);
  if (studentId) all = all.filter((s) => s.student_id === studentId);
  return all;
}

export function saveSubmission(s: Omit<Submission, "id" | "submitted_at">): Submission {
  const list = getSubmissions();
  const sub: Submission = { ...s, id: generateId(), submitted_at: new Date().toISOString() };
  list.push(sub);
  setItem("submissions", list);
  return sub;
}

// Grades
export interface Grade {
  id: string;
  submission_id: string;
  teacher_id: string;
  score: number;
  max_score: number;
  feedback: string;
  graded_at: string;
}

export function getGrades(submissionId?: string): Grade[] {
  const all = getItem<Grade[]>("grades", []);
  return submissionId ? all.filter((g) => g.submission_id === submissionId) : all;
}

export function saveGrade(g: Omit<Grade, "id" | "graded_at">): Grade {
  const list = getGrades();
  const grade: Grade = { ...g, id: generateId(), graded_at: new Date().toISOString() };
  list.push(grade);
  setItem("grades", list);
  return grade;
}

// Attendance
export interface AttendanceSession {
  id: string;
  class_id: string;
  date: string;
  created_by: string;
  created_at: string;
}

export function getAttendanceSessions(classId?: string): AttendanceSession[] {
  const all = getItem<AttendanceSession[]>("attendance_sessions", []);
  return classId ? all.filter((s) => s.class_id === classId) : all;
}

export function saveAttendanceSession(s: Omit<AttendanceSession, "id" | "created_at">): AttendanceSession {
  const list = getAttendanceSessions();
  const session: AttendanceSession = { ...s, id: generateId(), created_at: new Date().toISOString() };
  list.push(session);
  setItem("attendance_sessions", list);
  return session;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: "present" | "absent" | "late" | "excused";
  marked_at: string;
}

export function getAttendanceRecords(sessionId?: string, studentId?: string): AttendanceRecord[] {
  let all = getItem<AttendanceRecord[]>("attendance_records", []);
  if (sessionId) all = all.filter((r) => r.session_id === sessionId);
  if (studentId) all = all.filter((r) => r.student_id === studentId);
  return all;
}

export function saveAttendanceRecord(r: Omit<AttendanceRecord, "id" | "marked_at">): AttendanceRecord {
  const list = getAttendanceRecords();
  const rec: AttendanceRecord = { ...r, id: generateId(), marked_at: new Date().toISOString() };
  list.push(rec);
  setItem("attendance_records", list);
  return rec;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function getNotifications(userId?: string): Notification[] {
  const all = getItem<Notification[]>("notifications", []);
  return userId ? all.filter((n) => n.user_id === userId) : all;
}

export function saveNotification(n: Omit<Notification, "id" | "created_at">): Notification {
  const list = getNotifications();
  const notif: Notification = { ...n, id: generateId(), created_at: new Date().toISOString() };
  list.push(notif);
  setItem("notifications", list);
  return notif;
}

export function markNotificationRead(id: string) {
  const list = getNotifications();
  const n = list.find((x) => x.id === id);
  if (n) {
    n.is_read = true;
    setItem("notifications", list);
  }
}

// Activity
export interface Activity {
  id: string;
  user_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  metadata: any;
  created_at: string;
}

export function getActivities(userId?: string): Activity[] {
  const all = getItem<Activity[]>("activities", []);
  return userId ? all.filter((a) => a.user_id === userId) : all;
}

export function saveActivity(a: Omit<Activity, "id" | "created_at">): Activity {
  const list = getActivities();
  const act: Activity = { ...a, id: generateId(), created_at: new Date().toISOString() };
  list.push(act);
  setItem("activities", list);
  return act;
}

// Conversations & Messages
export interface Conversation {
  id: string;
  name: string | null;
  type: "direct" | "class" | "workspace";
  class_id: string | null;
  workspace_id: string | null;
  created_at: string;
}

export function getConversations(): Conversation[] {
  return getItem<Conversation[]>("conversations", []);
}

export function saveConversation(c: Omit<Conversation, "id" | "created_at">): Conversation {
  const list = getConversations();
  const conv: Conversation = { ...c, id: generateId(), created_at: new Date().toISOString() };
  list.push(conv);
  setItem("conversations", list);
  return conv;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export function getMessages(conversationId?: string): Message[] {
  const all = getItem<Message[]>("messages", []);
  return conversationId ? all.filter((m) => m.conversation_id === conversationId) : all;
}

export function saveMessage(m: Omit<Message, "id" | "created_at">): Message {
  const list = getMessages();
  const msg: Message = { ...m, id: generateId(), created_at: new Date().toISOString() };
  list.push(msg);
  setItem("messages", list);
  return msg;
}

// Events
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time: string | null;
  class_id: string | null;
  workspace_id: string | null;
  created_by: string;
  created_at: string;
}

export function getEvents(classId?: string): CalendarEvent[] {
  const all = getItem<CalendarEvent[]>("events", []);
  return classId ? all.filter((e) => e.class_id === classId) : all;
}

export function saveEvent(e: Omit<CalendarEvent, "id" | "created_at">): CalendarEvent {
  const list = getEvents();
  const evt: CalendarEvent = { ...e, id: generateId(), created_at: new Date().toISOString() };
  list.push(evt);
  setItem("events", list);
  return evt;
}
