-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (both teachers and students)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher-School relationship (many-to-many)
CREATE TABLE teacher_schools (
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'teacher')) NOT NULL DEFAULT 'teacher',
  PRIMARY KEY (teacher_id, school_id)
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subject Workspaces table
CREATE TABLE subject_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student enrollment
CREATE TABLE student_classes (
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, class_id)
);

-- Class join codes
CREATE TABLE class_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homework table
CREATE TABLE homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES subject_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('file', 'link')) NOT NULL,
  file_url TEXT,
  link_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student profiles
CREATE TABLE student_profiles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_teacher_schools_teacher ON teacher_schools(teacher_id);
CREATE INDEX idx_teacher_schools_school ON teacher_schools(school_id);
CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_subject_workspaces_class ON subject_workspaces(class_id);
CREATE INDEX idx_student_classes_student ON student_classes(student_id);
CREATE INDEX idx_student_classes_class ON student_classes(class_id);
CREATE INDEX idx_class_codes_class ON class_codes(class_id);
CREATE INDEX idx_class_codes_code ON class_codes(code);
CREATE INDEX idx_lessons_workspace ON lessons(workspace_id);
CREATE INDEX idx_homework_workspace ON homework(workspace_id);
CREATE INDEX idx_announcements_workspace ON announcements(workspace_id);
CREATE INDEX idx_resources_workspace ON resources(workspace_id);
CREATE INDEX idx_student_profiles_school ON student_profiles(school_id);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Teachers can view users in their schools
CREATE POLICY "Teachers can view school members" ON users
  FOR SELECT USING (
    id IN (
      SELECT teacher_id FROM teacher_schools WHERE school_id IN (
        SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
      )
    )
    OR id IN (
      SELECT student_id FROM student_classes WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

-- Schools policies
CREATE POLICY "Teachers can view their schools" ON schools
  FOR SELECT USING (
    id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can create schools" ON schools
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Teacher-School policies
CREATE POLICY "Teachers can view school memberships" ON teacher_schools
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Admins can manage school memberships" ON teacher_schools
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid() AND role = 'admin'
    )
  );

-- Classes policies
CREATE POLICY "Teachers can view classes in their schools" ON classes
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Students can view enrolled classes" ON classes
  FOR SELECT USING (
    id IN (SELECT class_id FROM student_classes WHERE student_id = auth.uid())
  );

CREATE POLICY "Teachers can create classes" ON classes
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

-- Subject Workspaces policies
CREATE POLICY "Teachers can view workspaces in their classes" ON subject_workspaces
  FOR SELECT USING (
    class_id IN (
      SELECT class_id FROM classes WHERE school_id IN (
        SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can view workspaces in enrolled classes" ON subject_workspaces
  FOR SELECT USING (
    class_id IN (SELECT class_id FROM student_classes WHERE student_id = auth.uid())
  );

CREATE POLICY "Teachers can create workspaces" ON subject_workspaces
  FOR INSERT WITH CHECK (
    class_id IN (
      SELECT class_id FROM classes WHERE school_id IN (
        SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
      )
    )
  );

-- Student Classes policies
CREATE POLICY "Teachers can view students in their classes" ON student_classes
  FOR SELECT USING (
    class_id IN (
      SELECT class_id FROM classes WHERE school_id IN (
        SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can view own enrollment" ON student_classes
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can enroll via class code" ON student_classes
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Class Codes policies
CREATE POLICY "Teachers can view codes for their classes" ON class_codes
  FOR SELECT USING (
    class_id IN (
      SELECT class_id FROM classes WHERE school_id IN (
        SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can view active codes for joining" ON class_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can create codes" ON class_codes
  FOR INSERT WITH CHECK (
    class_id IN (
      SELECT class_id FROM classes WHERE school_id IN (
        SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
      )
    )
  );

-- Lessons policies
CREATE POLICY "Teachers can view lessons in their workspaces" ON lessons
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Students can view lessons in enrolled class workspaces" ON lessons
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM student_classes WHERE student_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can create lessons" ON lessons
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

-- Homework policies
CREATE POLICY "Teachers can view homework in their workspaces" ON homework
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Students can view homework in enrolled class workspaces" ON homework
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM student_classes WHERE student_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can create homework" ON homework
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

-- Announcements policies
CREATE POLICY "Teachers can view announcements in their workspaces" ON announcements
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Students can view announcements in enrolled class workspaces" ON announcements
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM student_classes WHERE student_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can create announcements" ON announcements
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

-- Resources policies
CREATE POLICY "Teachers can view resources in their workspaces" ON resources
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Students can view resources in enrolled class workspaces" ON resources
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM student_classes WHERE student_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can create resources" ON resources
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM subject_workspaces WHERE class_id IN (
        SELECT class_id FROM classes WHERE school_id IN (
          SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid()
        )
      )
    )
  );

-- Student Profiles policies
CREATE POLICY "Students can view own profile" ON student_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Teachers can view student profiles in their schools" ON student_profiles
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM teacher_schools WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Students can create own profile" ON student_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
