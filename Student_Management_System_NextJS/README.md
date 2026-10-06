# Student Management System (MERN + Next.js)

DEA Group G's Student Management System, converted from Java JSP/Servlets + MySQL to
**MongoDB + Express + React (Next.js 14) + Node**. Every feature of the original app is kept,
and the UI follows `academia_student_management_system.html`.

It is one Next.js project, so it deploys to Vercel as a single app. The Express API runs
inside Next.js as a serverless function (`pages/api/[...path].js`), on the same domain as the pages.

```
app/                    Next.js 14 App Router pages (replaces the JSPs)
components/  lib/       UI components and frontend helpers
public/                 Static files (logo, favicon)
middleware.js           Route guard (redirects by role)
pages/api/[...path].js  Hands every /api/* request to the Express app
server/                 Express API + Mongoose models (replaces the servlets, DAOs and MySQL)
  app.js                The Express app (exported, not app.listen()-ed)
  config/ middleware/ models/ routes/ services/ utils/
  seed.js               Imports the original data
```

## Requirements

- Node.js 18.17 or newer
- A MongoDB Atlas connection string (or MongoDB 6+ running locally for development)

## Setup

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
#    then set MONGO_URI and a long random JWT_SECRET in .env.local

# 3. Import the data from Database/student_management_system.sql
npm run seed

# 4. Run (pages and API together)
npm run dev             # http://localhost:3000
```

The seed copies the original BCrypt hashes, so the original logins still work:

| Role    | Username | Password      |
|---------|----------|---------------|
| Admin   | admin    | 123           |
| Teacher | teacher  | 123           |
| Student | nilesh   | 32915NNAmcc   |

`npm run seed` wipes the SMS collections first, so only run it when you want a fresh database.

## How the old app maps to the new one

| Java / JSP                         | MERN + Next.js                                          |
|------------------------------------|---------------------------------------------------------|
| `HttpSession` + session checks     | httpOnly JWT cookie, `server/middleware/auth.js`, `middleware.js` |
| `LoginServlet`, `RegisterServlet`, `LogoutServlet` | `server/routes/auth.js`              |
| `AdminServlet`                     | `server/routes/admin.js`                            |
| `TeacherServlet`                   | `server/routes/teacher.js`                          |
| `StudentServlet`                   | `server/routes/student.js`                          |
| `ProfileServlet`                   | `server/routes/profile.js`                          |
| `com.sms.model.*` + DAOs           | `server/models/*` (Mongoose)                        |
| `Grade.java` / GPA calculations    | `server/utils/grading.js`                           |
| `student_courses` table            | `Enrollment` collection                                 |
| `ON DELETE CASCADE / SET NULL`     | `server/services/people.js`                         |
| `includes/header.jsp`              | `components/AppShell.js` (sidebar per role)      |
| `includes/footer.jsp`              | `components/PublicShell.js`                      |
| `error.jsp`, `error-404.jsp`, `error-500.jsp` | `app/error.js`, `app/not-found.js` |

Page URLs are the same as before: `/admin/manage-students`, `/admin/edit-course/:id`,
`/admin/assign-teacher/:id`, `/teacher/manage-grades?courseId=`, `/teacher/take-attendance?courseId=&date=`,
`/student/view-grades`, `/student/course-registration`, `/profile`, and so on.

Numeric IDs (Student ID 1, Teacher ID 1, Course ID 1) are kept through a counter collection,
so the tables show the same IDs as the MySQL version.

## Business rules carried over

- **Total score** = assignment × 0.3 + midterm × 0.3 + final × 0.4, only when all three are entered.
- **Grade**: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, otherwise F. **Grade points** 4.0 / 3.0 / 2.0 / 1.0 / 0.0.
- **Academic status** from grade point or GPA: Excellent ≥ 3.5, Very Good ≥ 3.0, Good ≥ 2.5, Satisfactory ≥ 2.0, Poor ≥ 1.0, otherwise Failing.
- **GPA** is credit-weighted; **credits earned** count every graded course that isn't an F.
- **Student attendance %** counts Present only. **Teacher attendance rate** counts Present + Late.

## Fixes compared with the original

- Delete links for students, teachers and courses now work (they were GET links to POST-only handlers).
- Clearing a score now clears the total and letter grade instead of keeping the old ones.
- Students with no grades show "Not Available" instead of "Failing".
- Success messages now show after redirects (grade, attendance, edit and assign pages).
- Adding a user with a taken username or email, or a course with a taken code, shows a message instead of a 500 error.
- Teachers can only open grades and attendance for courses they teach (enforced on the API too).

## UI

The whole app (landing, sign in, register, dashboards and every management page) uses the
**Academia** design from `academia_student_management_system.html`:

- `tailwind.config.js` is the mockup's `tailwind.config` block (canvas colour, card radii,
  `shadow-subtle / float / popover`, Inter).
- `app/globals.css` holds the mockup's `<style>` block verbatim (beacon pulse, hatch pattern,
  scrollbars). Tailwind is compiled at build time instead of loaded from the CDN.
- `components/ui.js` turns the mockup's markup into React pieces (KPI cards, cards with
  icon headers, roster tables, micro-beacon statuses, bar chart, dark charcoal card, approval-style
  list rows, inputs) using the mockup's class strings.
- `components/AppShell.js` is the mockup sidebar (green active pill, grouped nav,
  collapse toggle) and top bar: ⌘K search (filters the table on the current page), a notices bell,
  a role-aware **+ New** menu and the profile menu with Sign Out.
- Feedback uses the mockup's bottom-right toast; form errors show inline.
- Brand name lives in `lib/brand.js`.

## Deploying to Vercel

1. **Database** – use MongoDB Atlas (Vercel can't reach a MongoDB on your PC). In Atlas →
   *Network Access*, allow `0.0.0.0/0`, because Vercel functions don't have fixed IPs.
   Run `npm run seed` once from your machine with that `MONGO_URI` if the database is empty.
2. **Push to GitHub** and in Vercel choose *Add New → Project* and import the repo.
   - Framework preset: **Next.js** (detected automatically)
   - Root directory: the folder that contains this `package.json` (leave as `./` if it's the repo root)
   - Build / install / output settings: leave the defaults
3. **Environment variables** (Project Settings → Environment Variables, for Production and Preview):

   | Key              | Value                                    |
   |------------------|------------------------------------------|
   | `MONGO_URI`      | your Atlas `mongodb+srv://…` string      |
   | `JWT_SECRET`     | a long random string                     |
   | `JWT_EXPIRES_IN` | `1d` (optional)                          |

   Don't set `MONGO_DNS_SERVERS` or `NODE_ENV` on Vercel.
4. **Deploy.** Check `https://<your-app>.vercel.app/api/health` returns `{"ok":true}`, then sign in.

Or from the terminal: `npm i -g vercel`, then `vercel` (preview) and `vercel --prod`.

## Production (self-hosted)

```bash
npm run build
npm start               # NODE_ENV is production, so the login cookie is Secure
```
