-- Events table
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

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Events policies
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
  class_id IN (
    SELECT class_id FROM student_classes WHERE student_id = auth.uid()
  )
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

-- Indexes
CREATE INDEX idx_events_class ON events(class_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_created_by ON events(created_by);
