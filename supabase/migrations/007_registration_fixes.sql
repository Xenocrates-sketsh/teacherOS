-- Ensure users table has INSERT policy for self-registration
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'users' AND schemaname = 'public') THEN
    CREATE POLICY "Users can insert own profile"
      ON users FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Ensure student_profiles has INSERT and UPDATE policies for self
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can create own profile' AND tablename = 'student_profiles' AND schemaname = 'public') THEN
    CREATE POLICY "Students can create own profile"
      ON student_profiles FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can update own profile' AND tablename = 'student_profiles' AND schemaname = 'public') THEN
    CREATE POLICY "Students can update own profile"
      ON student_profiles FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Ensure student_classes has INSERT policy for self-enrollment
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can enroll via class code' AND tablename = 'student_classes' AND schemaname = 'public') THEN
    CREATE POLICY "Students can enroll via class code"
      ON student_classes FOR INSERT
      TO authenticated
      WITH CHECK (student_id = auth.uid());
  END IF;
END $$;
