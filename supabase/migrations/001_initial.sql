-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (profiles linked to auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher-School membership (admins manage the school)
CREATE TABLE teacher_schools (
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'teacher')) NOT NULL DEFAULT 'teacher',
  PRIMARY KEY (teacher_id, school_id)
);

-- Classes within a school
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student enrollment in classes
CREATE TABLE student_classes (
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, class_id)
);

-- Student profile info
CREATE TABLE student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE
);

-- Class join codes
CREATE TABLE class_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subject workspaces within a class
CREATE TABLE subject_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homework
CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources (files and links)
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

-- Enable RLS
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

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Anyone can insert their profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Schools policies
CREATE POLICY "Teachers can view their schools"
  ON schools FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

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

CREATE POLICY "Teachers can create schools"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Classes policies
CREATE POLICY "Teachers can view their classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
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

-- Student classes policies
CREATE POLICY "Students can view their enrollments"
  ON student_classes FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can join classes"
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

-- Class codes policies
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

-- Workspace policies
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
    class_id IN (
      SELECT class_id FROM student_classes WHERE student_id = auth.uid()
    )
  );

-- Lesson policies
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

-- Homework policies
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

-- Announcement policies
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

-- Resource policies
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

-- Indexes
CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_subject_workspaces_class ON subject_workspaces(class_id);
CREATE INDEX idx_lessons_workspace ON lessons(workspace_id);
CREATE INDEX idx_homework_workspace ON homework(workspace_id);
CREATE INDEX idx_announcements_workspace ON announcements(workspace_id);
CREATE INDEX idx_resources_workspace ON resources(workspace_id);
CREATE INDEX idx_student_classes_student ON student_classes(student_id);
CREATE INDEX idx_class_codes_code ON class_codes(code);
CREATE INDEX idx_users_role ON users(role);
