-- ============================================================================
-- INITIAL SCHEMA: Mestres Course Platform
-- ============================================================================
-- This migration creates the complete database schema with:
-- - 7 tables: profiles, courses, modules, lessons, enrollments, progress, materials
-- - RLS policies for all tables (DATA-01)
-- - Indexes on all policy columns (DATA-05)
-- - Helper functions for enrollment and progress checks
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if a user is enrolled in a course
CREATE OR REPLACE FUNCTION public.is_enrolled(user_id UUID, course_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = $1
    AND e.course_id = $2
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Get course progress percentage for a user
CREATE OR REPLACE FUNCTION public.get_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  -- Count total lessons in course
  SELECT COUNT(*)
  INTO total_lessons
  FROM public.lessons l
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.course_id = p_course_id;

  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;

  -- Count completed lessons
  SELECT COUNT(*)
  INTO completed_lessons
  FROM public.progress p
  JOIN public.lessons l ON p.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE p.user_id = p_user_id
  AND m.course_id = p_course_id
  AND p.completed = true;

  RETURN (completed_lessons * 100 / total_lessons);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = $1
    AND p.role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================================
-- TABLE: profiles (extends auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS immediately after table creation
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies (separate SELECT, INSERT, UPDATE - never FOR ALL)
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin((SELECT auth.uid())));

-- Index on policy columns
CREATE INDEX idx_profiles_id ON public.profiles(id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- TABLE: courses
-- ============================================================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  instructor_name TEXT NOT NULL,
  instructor_avatar TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS immediately
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses policies
-- Anyone can view published courses (no auth required for landing page)
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT USING (is_published = true);

-- Admins can view all courses (including unpublished)
CREATE POLICY "courses_select_admin" ON public.courses
  FOR SELECT USING (public.is_admin((SELECT auth.uid())));

-- Admins can insert courses
CREATE POLICY "courses_insert_admin" ON public.courses
  FOR INSERT WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can update courses
CREATE POLICY "courses_update_admin" ON public.courses
  FOR UPDATE USING (public.is_admin((SELECT auth.uid())))
  WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can delete courses
CREATE POLICY "courses_delete_admin" ON public.courses
  FOR DELETE USING (public.is_admin((SELECT auth.uid())));

-- Indexes on policy columns
CREATE INDEX idx_courses_is_published ON public.courses(is_published);
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_created_at ON public.courses(created_at DESC);

-- ============================================================================
-- TABLE: modules (course sections)
-- ============================================================================
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS immediately
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Modules policies
-- Anyone can view modules for published courses
CREATE POLICY "modules_select_published_course" ON public.modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
      AND c.is_published = true
    )
  );

-- Admins can view all modules
CREATE POLICY "modules_select_admin" ON public.modules
  FOR SELECT USING (public.is_admin((SELECT auth.uid())));

-- Admins can insert modules
CREATE POLICY "modules_insert_admin" ON public.modules
  FOR INSERT WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can update modules
CREATE POLICY "modules_update_admin" ON public.modules
  FOR UPDATE USING (public.is_admin((SELECT auth.uid())))
  WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can delete modules
CREATE POLICY "modules_delete_admin" ON public.modules
  FOR DELETE USING (public.is_admin((SELECT auth.uid())));

-- Indexes on policy columns
CREATE INDEX idx_modules_course_id ON public.modules(course_id);
CREATE INDEX idx_modules_position ON public.modules(course_id, position);

-- ============================================================================
-- TABLE: lessons
-- ============================================================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS immediately
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons policies
-- Anyone can view preview lessons for published courses
CREATE POLICY "lessons_select_preview" ON public.lessons
  FOR SELECT USING (
    is_preview = true
    AND EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON m.course_id = c.id
      WHERE m.id = module_id
      AND c.is_published = true
    )
  );

-- Enrolled users can view all lessons for their enrolled courses
CREATE POLICY "lessons_select_enrolled" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.enrollments e ON m.course_id = e.course_id
      WHERE m.id = module_id
      AND e.user_id = (SELECT auth.uid())
    )
  );

-- Admins can view all lessons
CREATE POLICY "lessons_select_admin" ON public.lessons
  FOR SELECT USING (public.is_admin((SELECT auth.uid())));

-- Admins can insert lessons
CREATE POLICY "lessons_insert_admin" ON public.lessons
  FOR INSERT WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can update lessons
CREATE POLICY "lessons_update_admin" ON public.lessons
  FOR UPDATE USING (public.is_admin((SELECT auth.uid())))
  WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can delete lessons
CREATE POLICY "lessons_delete_admin" ON public.lessons
  FOR DELETE USING (public.is_admin((SELECT auth.uid())));

-- Indexes on policy columns
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_lessons_is_preview ON public.lessons(is_preview);
CREATE INDEX idx_lessons_position ON public.lessons(module_id, position);

-- ============================================================================
-- TABLE: enrollments (DATA-03: user-course access tracking)
-- ============================================================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- Enable RLS immediately
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Enrollments policies
-- Users can view their own enrollments
CREATE POLICY "enrollments_select_own" ON public.enrollments
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Admins can view all enrollments
CREATE POLICY "enrollments_select_admin" ON public.enrollments
  FOR SELECT USING (public.is_admin((SELECT auth.uid())));

-- Admins can create enrollments (manual enrollment)
CREATE POLICY "enrollments_insert_admin" ON public.enrollments
  FOR INSERT WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can update enrollments (extend expiry, etc.)
CREATE POLICY "enrollments_update_admin" ON public.enrollments
  FOR UPDATE USING (public.is_admin((SELECT auth.uid())))
  WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can delete enrollments
CREATE POLICY "enrollments_delete_admin" ON public.enrollments
  FOR DELETE USING (public.is_admin((SELECT auth.uid())));

-- Indexes on policy columns
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX idx_enrollments_expires_at ON public.enrollments(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- TABLE: progress (DATA-04: lesson completion tracking)
-- ============================================================================
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS immediately
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Progress policies
-- Users can view their own progress
CREATE POLICY "progress_select_own" ON public.progress
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Users can insert their own progress
CREATE POLICY "progress_insert_own" ON public.progress
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can update their own progress
CREATE POLICY "progress_update_own" ON public.progress
  FOR UPDATE USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Admins can view all progress
CREATE POLICY "progress_select_admin" ON public.progress
  FOR SELECT USING (public.is_admin((SELECT auth.uid())));

-- Admins can delete progress (for testing/support)
CREATE POLICY "progress_delete_admin" ON public.progress
  FOR DELETE USING (public.is_admin((SELECT auth.uid())));

-- Indexes on policy columns
CREATE INDEX idx_progress_user_id ON public.progress(user_id);
CREATE INDEX idx_progress_lesson_id ON public.progress(lesson_id);
CREATE INDEX idx_progress_user_lesson ON public.progress(user_id, lesson_id);
CREATE INDEX idx_progress_completed ON public.progress(user_id, completed) WHERE completed = true;

-- ============================================================================
-- TABLE: materials (downloadable resources)
-- ============================================================================
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS immediately
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Materials policies
-- Enrolled users can view materials for their enrolled courses
CREATE POLICY "materials_select_enrolled" ON public.materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON l.module_id = m.id
      JOIN public.enrollments e ON m.course_id = e.course_id
      WHERE l.id = lesson_id
      AND e.user_id = (SELECT auth.uid())
    )
  );

-- Materials for preview lessons are visible to all
CREATE POLICY "materials_select_preview" ON public.materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON l.module_id = m.id
      JOIN public.courses c ON m.course_id = c.id
      WHERE l.id = lesson_id
      AND l.is_preview = true
      AND c.is_published = true
    )
  );

-- Admins can view all materials
CREATE POLICY "materials_select_admin" ON public.materials
  FOR SELECT USING (public.is_admin((SELECT auth.uid())));

-- Admins can insert materials
CREATE POLICY "materials_insert_admin" ON public.materials
  FOR INSERT WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can update materials
CREATE POLICY "materials_update_admin" ON public.materials
  FOR UPDATE USING (public.is_admin((SELECT auth.uid())))
  WITH CHECK (public.is_admin((SELECT auth.uid())));

-- Admins can delete materials
CREATE POLICY "materials_delete_admin" ON public.materials
  FOR DELETE USING (public.is_admin((SELECT auth.uid())));

-- Indexes on policy columns
CREATE INDEX idx_materials_lesson_id ON public.materials(lesson_id);

-- ============================================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- COMMENTS: Document tables and columns
-- ============================================================================
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with app-specific data';
COMMENT ON TABLE public.courses IS 'Course catalog with metadata and publication status';
COMMENT ON TABLE public.modules IS 'Course sections/chapters grouping lessons';
COMMENT ON TABLE public.lessons IS 'Individual video lessons with duration and preview flag';
COMMENT ON TABLE public.enrollments IS 'User-course access records (DATA-03)';
COMMENT ON TABLE public.progress IS 'Lesson completion tracking (DATA-04)';
COMMENT ON TABLE public.materials IS 'Downloadable resources attached to lessons';

COMMENT ON FUNCTION public.is_enrolled IS 'Check if user is enrolled in a specific course';
COMMENT ON FUNCTION public.get_course_progress IS 'Calculate course completion percentage for a user';
COMMENT ON FUNCTION public.is_admin IS 'Check if user has admin role';
