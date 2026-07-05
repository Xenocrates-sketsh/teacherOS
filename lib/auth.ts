export interface User {
  id: string;
  email: string;
  password: string;
  role: "teacher" | "student";
  full_name: string;
  created_at: string;
}

const USERS_KEY = "tw_users";
const SESSION_KEY = "tw_session";

const DEFAULT_TEACHER: User = {
  id: "teacher-1",
  email: "admin@teacher.com",
  password: "admin123",
  role: "teacher",
  full_name: "Admin Teacher",
  created_at: new Date().toISOString(),
};

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [];
}

export function saveUsers(users: User[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function initDefaultUsers() {
  const users = getUsers();
  const exists = users.some((u) => u.email === DEFAULT_TEACHER.email);
  if (!exists) {
    users.push(DEFAULT_TEACHER);
    saveUsers(users);
  }
}

export function loginUser(
  email: string,
  password: string
): { user: Omit<User, "password">; error: string | null } {
  initDefaultUsers();
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { user: null as any, error: "Invalid email or password" };
  }
  const { password: _, ...safe } = user;
  if (typeof window !== "undefined") {
    document.cookie = `${SESSION_KEY}=${encodeURIComponent(JSON.stringify(safe))}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }
  return { user: safe, error: null };
}

export function registerUser(
  email: string,
  password: string,
  fullName: string,
  role: "teacher" | "student"
): { user: Omit<User, "password"> | null; error: string | null } {
  initDefaultUsers();
  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return { user: null, error: "An account with this email already exists" };
  }
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    password,
    role,
    full_name: fullName,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  const { password: _, ...safe } = newUser;
  if (typeof window !== "undefined") {
    document.cookie = `${SESSION_KEY}=${encodeURIComponent(JSON.stringify(safe))}; path=/; max-age=${60 * 60 * 24 * 7}`;
  }
  return { user: safe, error: null };
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    document.cookie = `${SESSION_KEY}=; path=/; max-age=0`;
  }
}

export function getSession(): Omit<User, "password"> | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SESSION_KEY}=([^;]*)`)
  );
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {}
  }
  return null;
}

export function getServerSession(
  cookieHeader: string
): Omit<User, "password"> | null {
  const match = cookieHeader?.match(
    new RegExp(`(?:^|; )${SESSION_KEY}=([^;]*)`)
  );
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {}
  }
  return null;
}
