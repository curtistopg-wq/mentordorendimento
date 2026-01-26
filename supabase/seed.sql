-- Seed data for development
-- This file is executed after migrations during `supabase db reset`

-- Sample admin user profile (linked to auth.users via trigger)
-- Note: Auth users must be created through Supabase Auth, not directly in profiles

-- Sample courses
INSERT INTO public.courses (id, title, slug, description, instructor_name, instructor_avatar, thumbnail_url, is_published, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mastering Modern Web Development', 'mastering-modern-web-development', 'A comprehensive course covering HTML, CSS, JavaScript, and modern frameworks like React and Next.js.', 'John Doe', '/avatars/john-doe.jpg', '/thumbnails/web-dev-course.jpg', true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Advanced TypeScript Patterns', 'advanced-typescript-patterns', 'Deep dive into TypeScript generics, decorators, and design patterns for enterprise applications.', 'Jane Smith', '/avatars/jane-smith.jpg', '/thumbnails/typescript-course.jpg', true, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Database Design Fundamentals', 'database-design-fundamentals', 'Learn relational database design, SQL optimization, and PostgreSQL features including RLS.', 'Bob Johnson', '/avatars/bob-johnson.jpg', '/thumbnails/database-course.jpg', false, NOW(), NOW());

-- Sample modules for first course
INSERT INTO public.modules (id, course_id, title, description, position, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Getting Started', 'Introduction to the course and setting up your development environment.', 1, NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'HTML Fundamentals', 'Learn the building blocks of web pages.', 2, NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'CSS Styling', 'Master CSS for beautiful, responsive layouts.', 3, NOW(), NOW());

-- Sample modules for second course
INSERT INTO public.modules (id, course_id, title, description, position, created_at, updated_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'TypeScript Basics Review', 'Quick refresher on TypeScript fundamentals before diving deep.', 1, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Advanced Generics', 'Conditional types, mapped types, and template literal types.', 2, NOW(), NOW());

-- Sample lessons for first module of first course
INSERT INTO public.lessons (id, module_id, title, description, video_url, duration_seconds, position, is_preview, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Welcome to the Course', 'Introduction video explaining what you will learn.', '/videos/welcome.mp4', 180, 1, true, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Setting Up VS Code', 'Install and configure VS Code for web development.', '/videos/vscode-setup.mp4', 420, 2, true, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Installing Node.js', 'Set up Node.js and npm on your machine.', '/videos/nodejs-install.mp4', 300, 3, false, NOW(), NOW());

-- Sample lessons for second module
INSERT INTO public.lessons (id, module_id, title, description, video_url, duration_seconds, position, is_preview, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HTML Document Structure', 'Understanding DOCTYPE, html, head, and body tags.', '/videos/html-structure.mp4', 540, 1, false, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Semantic HTML', 'Using semantic elements for better accessibility.', '/videos/semantic-html.mp4', 480, 2, false, NOW(), NOW());

-- Sample materials
INSERT INTO public.materials (id, lesson_id, title, file_url, file_type, file_size, created_at)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Course Syllabus', '/materials/syllabus.pdf', 'pdf', 102400, NOW()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'VS Code Extensions List', '/materials/vscode-extensions.md', 'markdown', 4096, NOW()),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'HTML Cheatsheet', '/materials/html-cheatsheet.pdf', 'pdf', 51200, NOW());

-- Note: Enrollments and progress will be created when users sign up and interact with courses
-- Those require actual auth.users to exist first
