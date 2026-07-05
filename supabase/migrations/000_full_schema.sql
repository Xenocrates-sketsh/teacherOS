-- ================================================
-- COMPLETE TEACHER WORKSPACE SCHEMA
-- Run this entire file in the Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- CORE TABLES
-- ================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teacher_schools (
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'teacher')) NOT NULL DEFAULT 'teacher',
  PRIMARY KEY (teacher_id, school_id)
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_classes (
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, class_id)
);

CREATE TABLE student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE class_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subject_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('file', 'link')) NOT NULL,
  file_url TEXT,
  link_url TEXT,
  storage_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- GRADING
-- ================================================

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id UUID REFERENCES homework(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  storage_path TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(homework_id, student_id)
);

CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  max_score DECIMAL(5,2) DEFAULT 100,
  feedback TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- CALENDAR
-- ================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('class', 'homework_due', 'exam', 'meeting', 'other')) NOT NULL DEFAULT 'other',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- MESSAGING
-- ================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT CHECK (type IN ('direct', 'class', 'workspace')) NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ATTENDANCE
-- ================================================

CREATE TABLE attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, date)
);

CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) NOT NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- ================================================
-- NOTIFICATIONS
-- ================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('grade_posted', 'homework_assigned', 'announcement', 'message', 'attendance')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  UNIQUE(user_id, type)
);

-- ================================================
-- ACTIVITY & STATS
-- ================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspace_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  avg_score DECIMAL(5,2),
  submission_rate DECIMAL(5,2),
  total_homework INTEGER DEFAULT 0,
  total_submissions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id)
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_stats ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES
-- ================================================

-- USERS
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- SCHOOLS
CREATE POLICY "Teachers can view their schools"
  ON schools FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can create schools"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update their schools"
  ON schools FOR UPDATE
  TO authenticated
  USING (
    id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete their schools"
  ON schools FOR DELETE
  TO authenticated
  USING (
    id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid() AND role = 'admin')
  );

-- TEACHER SCHOOLS
CREATE POLICY "Teachers can view school memberships"
  ON teacher_schools FOR SELECT
  TO authenticated
  USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Admins can manage school memberships"
  ON teacher_schools FOR ALL
  TO authenticated
  USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid() AND role = 'admin')
  );

-- CLASSES
CREATE POLICY "Teachers can view their classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Students can view enrolled classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT class_id FROM student_classes WHERE student_id = auth.uid())
  );

CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can update their classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can delete their classes"
  ON classes FOR DELETE
  TO authenticated
  USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

-- STUDENT CLASSES
CREATE POLICY "Students can view own enrollment"
  ON student_classes FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can enroll via class code"
  ON student_classes FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view enrollments"
  ON student_classes FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT c.id FROM classes c
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

-- STUDENT PROFILES
CREATE POLICY "Students can view own profile"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students can create own profile"
  ON student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- CLASS CODES
CREATE POLICY "Anyone can look up class codes"
  ON class_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage class codes"
  ON class_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    class_id IN (
      SELECT c.id FROM classes c
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

-- SUBJECT WORKSPACES
CREATE POLICY "Teachers can manage workspaces"
  ON subject_workspaces FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT c.id FROM classes c
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view workspaces"
  ON subject_workspaces FOR SELECT
  TO authenticated
  USING (
    class_id IN (SELECT class_id FROM student_classes WHERE student_id = auth.uid())
  );

-- LESSONS
CREATE POLICY "Teachers can manage lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN student_classes sc ON c.id = sc.class_id
      WHERE sc.student_id = auth.uid()
    )
  );

-- HOMEWORK
CREATE POLICY "Teachers can manage homework"
  ON homework FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view homework"
  ON homework FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN student_classes sc ON c.id = sc.class_id
      WHERE sc.student_id = auth.uid()
    )
  );

-- ANNOUNCEMENTS
CREATE POLICY "Teachers can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN student_classes sc ON c.id = sc.class_id
      WHERE sc.student_id = auth.uid()
    )
  );

-- RESOURCES
CREATE POLICY "Teachers can manage resources"
  ON resources FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN student_classes sc ON c.id = sc.class_id
      WHERE sc.student_id = auth.uid()
    )
  );

-- SUBMISSIONS
CREATE POLICY "Students can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can submit homework"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view submissions in their classes"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    homework_id IN (
      SELECT h.id FROM homework h
      JOIN subject_workspaces sw ON h.workspace_id = sw.id
      JOIN classes c ON sw.class_id = c.id
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

-- GRADES
CREATE POLICY "Students can view own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    submission_id IN (SELECT id FROM submissions WHERE student_id = auth.uid())
  );

CREATE POLICY "Teachers can view grades they created"
  ON grades FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create grades"
  ON grades FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update grades they created"
  ON grades FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid());

-- EVENTS
CREATE POLICY "Teachers can view events in their classes"
  ON events FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT c.id FROM classes c
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view events in enrolled classes"
  ON events FOR SELECT
  TO authenticated
  USING (
    class_id IN (SELECT class_id FROM student_classes WHERE student_id = auth.uid())
  );

CREATE POLICY "Teachers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    class_id IN (
      SELECT c.id FROM classes c
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their events"
  ON events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Teachers can delete their events"
  ON events FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- CONVERSATIONS
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- CONVERSATION MEMBERS
CREATE POLICY "Users can view conversation members"
  ON conversation_members FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can add members to conversations they are in"
  ON conversation_members FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
  );

-- MESSAGES
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update messages they sent"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- ATTENDANCE SESSIONS
CREATE POLICY "Teachers can manage attendance sessions"
  ON attendance_sessions FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT c.id FROM classes c
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view attendance sessions"
  ON attendance_sessions FOR SELECT
  TO authenticated
  USING (
    class_id IN (SELECT class_id FROM student_classes WHERE student_id = auth.uid())
  );

-- ATTENDANCE RECORDS
CREATE POLICY "Teachers can manage attendance records"
  ON attendance_records FOR ALL
  TO authenticated
  USING (
    session_id IN (SELECT id FROM attendance_sessions WHERE created_by = auth.uid())
  );

CREATE POLICY "Students can view own attendance records"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- ACTIVITY LOG
CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- WORKSPACE STATS
CREATE POLICY "Teachers can view workspace stats"
  ON workspace_stats FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN teacher_schools ts ON c.school_id = ts.school_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view workspace stats"
  ON workspace_stats FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT sw.id FROM subject_workspaces sw
      JOIN classes c ON sw.class_id = c.id
      JOIN student_classes sc ON c.id = sc.class_id
      WHERE sc.student_id = auth.uid()
    )
  );

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_teacher_schools_teacher ON teacher_schools(teacher_id);
CREATE INDEX idx_teacher_schools_school ON teacher_schools(school_id);
CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_subject_workspaces_class ON subject_workspaces(class_id);
CREATE INDEX idx_lessons_workspace ON lessons(workspace_id);
CREATE INDEX idx_homework_workspace ON homework(workspace_id);
CREATE INDEX idx_announcements_workspace ON announcements(workspace_id);
CREATE INDEX idx_resources_workspace ON resources(workspace_id);
CREATE INDEX idx_student_classes_student ON student_classes(student_id);
CREATE INDEX idx_student_classes_class ON student_classes(class_id);
CREATE INDEX idx_class_codes_code ON class_codes(code);
CREATE INDEX idx_class_codes_class ON class_codes(class_id);
CREATE INDEX idx_student_profiles_school ON student_profiles(school_id);
CREATE INDEX idx_submissions_homework ON submissions(homework_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_grades_submission ON grades(submission_id);
CREATE INDEX idx_grades_teacher ON grades(teacher_id);
CREATE INDEX idx_events_class ON events(class_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_conversation_members_user ON conversation_members(user_id);
CREATE INDEX idx_conversation_members_conversation ON conversation_members(conversation_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_attendance_sessions_class ON attendance_sessions(class_id);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(date);
CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_type ON activity_log(action_type);

-- ================================================
-- REALTIME
-- ================================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ================================================
-- STORAGE
-- ================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('workspace-files', 'workspace-files', false, 10485760, '{image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain}')
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'workspace-files');

CREATE POLICY "Allow authenticated reads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'workspace-files');

CREATE POLICY "Allow authenticated deletes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'workspace-files');
