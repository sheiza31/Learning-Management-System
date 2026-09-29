-- Seed data for LMS development
-- Passwords are all 'password123' hashed with bcrypt cost 10
-- Generated hash: $2a$10$H7zZDNwrzLjVKhMypK.m4.hrU.C5e37rLea2YLprLfqtgWHbusdWi

-- Admin
INSERT INTO users (id, full_name, email, password, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin Utama', 'admin@lms.test', '$2a$10$H7zZDNwrzLjVKhMypK.m4.hrU.C5e37rLea2YLprLfqtgWHbusdWi', 'ADMIN');

-- Instructors
INSERT INTO users (id, full_name, email, password, role) VALUES
('22222222-2222-2222-2222-222222222222', 'Budi Santoso', 'budi@lms.test', '$2a$10$H7zZDNwrzLjVKhMypK.m4.hrU.C5e37rLea2YLprLfqtgWHbusdWi', 'INSTRUCTOR'),
('22222222-2222-2222-2222-222222222223', 'Citra Dewi', 'citra@lms.test', '$2a$10$H7zZDNwrzLjVKhMypK.m4.hrU.C5e37rLea2YLprLfqtgWHbusdWi', 'INSTRUCTOR');

-- Students
INSERT INTO users (id, full_name, email, password, role) VALUES
('33333333-3333-3333-3333-333333333331', 'Siti Rahma', 'siti@lms.test', '$2a$10$H7zZDNwrzLjVKhMypK.m4.hrU.C5e37rLea2YLprLfqtgWHbusdWi', 'STUDENT'),
('33333333-3333-3333-3333-333333333332', 'Ahmad Fauzi', 'ahmad@lms.test', '$2a$10$H7zZDNwrzLjVKhMypK.m4.hrU.C5e37rLea2YLprLfqtgWHbusdWi', 'STUDENT'),
('33333333-3333-3333-3333-333333333333', 'Dewi Lestari', 'dewi@lms.test', '$2a$10$H7zZDNwrzLjVKhMypK.m4.hrU.C5e37rLea2YLprLfqtgWHbusdWi', 'STUDENT');

-- Categories
INSERT INTO categories (id, name, slug, description) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Programming', 'programming', 'Belajar pemrograman dari dasar hingga mahir'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'Design', 'design', 'Desain grafis dan UI/UX'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 'Data Science', 'data-science', 'Analisis data dan machine learning');

-- Courses
INSERT INTO courses (id, instructor_id, category_id, title, slug, description, thumbnail, trailer_url, price, level, status) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Belajar Golang Dasar', 'belajar-golang-dasar', 'Kursus dasar pemrograman Go untuk pemula. Pelajari syntax, concurrency, dan web development.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80', 'https://www.youtube.com/watch?v=YS4e4q9oBaU', 0, 'beginner', 'published'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'React Modern', 'react-modern', 'Kuasai React 19 dengan TypeScript, hooks, dan state management modern.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80', 'https://www.youtube.com/watch?v=bMknfKXIFA8', 150000, 'intermediate', 'published'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', '22222222-2222-2222-2222-222222222223', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 'UI/UX Design Fundamentals', 'uiux-design-fundamentals', 'Pelajari prinsip-prinsip desain antarmuka pengguna yang baik.', 'https://images.unsplash.com/photo-1581291518655-9523c932dede?w=800&auto=format&fit=crop&q=80', 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU', 99000, 'beginner', 'published');

-- Lessons for "Belajar Golang Dasar"
INSERT INTO lessons (id, course_id, title, slug, description, video_url, content, sort_order, duration) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccc01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Pengenalan Go', 'pengenalan-go', 'Apa itu Go dan mengapa belajar Go?', 'https://www.youtube.com/watch?v=YS4e4q9oBaU', '# Pengenalan Go\n\nGo (Golang) adalah bahasa pemrograman open-source yang dikembangkan oleh Google.\n\n## Kenapa Go?\n- Performa tinggi\n- Concurrency built-in\n- Sintaks sederhana\n- Cocok untuk microservices', 1, 600),
('cccccccc-cccc-cccc-cccc-cccccccccc02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Instalasi dan Setup', 'instalasi-dan-setup', 'Cara install Go dan setup environment', 'https://www.youtube.com/watch?v=8uiZC0l4Ajw', '# Instalasi Go\n\n1. Download dari go.dev\n2. Install sesuai OS\n3. Set GOPATH\n4. Verifikasi: `go version`', 2, 480),
('cccccccc-cccc-cccc-cccc-cccccccccc03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Variabel dan Tipe Data', 'variabel-dan-tipe-data', 'Belajar variabel, konstanta, dan tipe data dasar', 'https://www.youtube.com/watch?v=sqV3b85kI_0', '# Variabel dan Tipe Data\n\n```go\nvar name string = "Go"\nage := 14\nconst pi = 3.14\n```', 3, 900),
('cccccccc-cccc-cccc-cccc-cccccccccc04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Control Flow', 'control-flow', 'If, switch, dan loop', 'https://www.youtube.com/watch?v=q6bQpG6qZk8', '# Control Flow\n\n```go\nif x > 10 {\n    fmt.Println("besar")\n}\n\nfor i := 0; i < 10; i++ {\n    fmt.Println(i)\n}\n```', 4, 720);

-- Lessons for "React Modern"
INSERT INTO lessons (id, course_id, title, slug, description, video_url, content, sort_order, duration) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccc05', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 'Pengenalan React', 'pengenalan-react', 'Apa itu React dan ekosistemnya', 'https://www.youtube.com/watch?v=bMknfKXIFA8', '# React Modern\n\nReact adalah library JavaScript untuk membangun UI.', 1, 600),
('cccccccc-cccc-cccc-cccc-cccccccccc06', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', 'Components dan Props', 'components-dan-props', 'Belajar komponen, props, dan komposisi', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', '# Components\n\n```tsx\nfunction Card({ title }: { title: string }) {\n  return <div>{title}</div>\n}\n```', 2, 840);

-- Quizzes
INSERT INTO quizzes (id, course_id, title, description) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Quiz Dasar Golang', 'Uji pemahaman dasar Go');

-- Questions
INSERT INTO questions (id, quiz_id, question, type, points, sort_order) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Siapa yang mengembangkan Go?', 'multiple_choice', 10, 1),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Apa keyword untuk mendeklarasikan variabel di Go?', 'multiple_choice', 10, 2);

-- Options for Q1
INSERT INTO options (id, question_id, option_text, is_correct) VALUES
('ffffffff-ffff-ffff-ffff-fffffffffff1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Microsoft', false),
('ffffffff-ffff-ffff-ffff-fffffffffff2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Google', true),
('ffffffff-ffff-ffff-ffff-fffffffffff3', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Facebook', false),
('ffffffff-ffff-ffff-ffff-fffffffffff4', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Apple', false);

-- Options for Q2
INSERT INTO options (id, question_id, option_text, is_correct) VALUES
('ffffffff-ffff-ffff-ffff-fffffffffff5', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'let', false),
('ffffffff-ffff-ffff-ffff-fffffffffff6', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'var', true),
('ffffffff-ffff-ffff-ffff-fffffffffff7', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'const', false),
('ffffffff-ffff-ffff-ffff-fffffffffff8', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'dim', false);

-- Enrollments
INSERT INTO enrollments (id, student_id, course_id) VALUES
('99999999-9999-9999-9999-999999999991', '33333333-3333-3333-3333-333333333331', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('99999999-9999-9999-9999-999999999992', '33333333-3333-3333-3333-333333333332', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- Lesson progress for Siti
INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, watched_seconds) VALUES
('99999999-9999-9999-9999-999999999991', 'cccccccc-cccc-cccc-cccc-cccccccccc01', true, 600),
('99999999-9999-9999-9999-999999999991', 'cccccccc-cccc-cccc-cccc-cccccccccc02', true, 480);
