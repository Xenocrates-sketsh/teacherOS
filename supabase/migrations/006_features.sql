-- ==========================================
-- Attendance Tracking
-- ==========================================
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

ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

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
    class_id IN (
      SELECT class_id FROM student_classes WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage attendance records"
  ON attendance_records FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM attendance_sessions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view own attendance records"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE INDEX idx_attendance_sessions_class ON attendance_sessions(class_id);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(date);
CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);

-- ==========================================
-- Notifications
-- ==========================================
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

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

-- ==========================================
-- Activity Feed
-- ==========================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_type ON activity_log(action_type);

-- ==========================================
-- Workspace Analytics Cache
-- ==========================================
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

ALTER TABLE workspace_stats ENABLE ROW LEVEL SECURITY;

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

-- Enable realtime for notifications and activity
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Storage bucket for workspace files (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('workspace-files', 'workspace-files', false, 10485760, '{image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain}')
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated uploads' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Allow authenticated uploads"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'workspace-files');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated reads' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Allow authenticated reads"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'workspace-files');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated deletes' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Allow authenticated deletes"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'workspace-files');
  END IF;
END $$;
