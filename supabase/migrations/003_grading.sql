-- Assignment submissions
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

-- Grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  max_score DECIMAL(5,2) DEFAULT 100,
  feedback TEXT,
  graded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Submissions policies
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

-- Grades policies
CREATE POLICY "Students can view own grades"
ON grades FOR SELECT
TO authenticated
USING (
  submission_id IN (
    SELECT id FROM submissions WHERE student_id = auth.uid()
  )
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

-- Indexes
CREATE INDEX idx_submissions_homework ON submissions(homework_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_grades_submission ON grades(submission_id);
CREATE INDEX idx_grades_teacher ON grades(teacher_id);
