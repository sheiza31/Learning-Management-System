import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Public Routes
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("courses", "routes/courses._index.tsx"),
  route("courses/:slug", "routes/courses.$slug.tsx"),

  // Student Routes
  route("student", "routes/student._index.tsx"),
  route("student/courses", "routes/student.courses.tsx"),
  route("student/my-courses", "routes/student.my-courses.tsx"),
  route("student/learning/:courseId", "routes/student.learning.$courseId._index.tsx"),
  route("student/learning/:courseId/lesson/:lessonId", "routes/student.learning.$courseId.lesson.$lessonId.tsx"),
  route("student/quizzes/:quizId", "routes/student.quizzes.$quizId.tsx"),
  route("student/profile", "routes/student.profile.tsx"),

  // Instructor Routes
  route("instructor", "routes/instructor._index.tsx"),
  route("instructor/courses", "routes/instructor.courses._index.tsx"),
  route("instructor/courses/create", "routes/instructor.courses.create.tsx"),
  route("instructor/courses/:id", "routes/instructor.courses.$id._index.tsx"),
  route("instructor/courses/:id/lessons", "routes/instructor.courses.$id.lessons.tsx"),
  route("instructor/courses/:id/quizzes", "routes/instructor.courses.$id.quizzes.tsx"),
  route("instructor/students", "routes/instructor.students.tsx"),

  // Admin Routes
  route("admin", "routes/admin._index.tsx"),
  route("admin/users", "routes/admin.users.tsx"),
  route("admin/courses", "routes/admin.courses.tsx"),
  route("admin/categories", "routes/admin.categories.tsx"),
  route("admin/enrollments", "routes/admin.enrollments.tsx"),
] satisfies RouteConfig;
