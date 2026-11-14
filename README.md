# TechJournal

TechJournal is a responsive technology blog with public article browsing and a protected admin CMS. Visitors can search, filter, and read published articles; administrators can manage articles, categories, and authors, upload images, and publish immediately or on a schedule.

## Requirements

- Node.js and npm
- MongoDB connection string

## Local setup

1. Configure the backend environment:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Set `MONGO_URI`, `JWT_SECRET`, and the `ADMIN_*` values in `backend\.env`. Use a unique JWT secret and an admin password of at least 12 characters.

2. Configure the frontend:

   ```powershell
   Copy-Item frontend\.env.example frontend\.env
   ```

   The default API URL is `http://localhost:5000/api`. Set it to the deployed API base URL before building for production.

3. Install dependencies if they are not already present:

   ```powershell
   npm --prefix backend install
   npm --prefix frontend install
   ```

4. Seed the admin, initial categories, and sample articles:

   ```powershell
   npm --prefix backend run seed:all
   ```

   Running the blog seeder also refreshes sample article descriptions and content for matching slugs, plus cover images explicitly marked for refresh.

   Assign a distinct sample author to every article:

   ```powershell
   npm --prefix backend run seed:authors
   ```

5. Start the API and frontend in separate terminals:

   ```powershell
   npm --prefix backend run dev
   npm --prefix frontend run dev
   ```

   Open the Vite URL printed in the frontend terminal. Sign in at `/login` with the configured admin email and password; manage content under `/admin`.

## CMS capabilities

- Article create, edit, delete, draft, publish, and scheduled publishing
- Featured images and inline article image uploads (JPG, PNG, WEBP; 5 MB maximum)
- Category and author management
- SEO title and description fields, article schema, canonical and social metadata
- Search, category filtering, trending articles, related articles, and pagination

## SEO and public links

Set optional frontend values in `frontend/.env`:

- `VITE_GA_MEASUREMENT_ID` — Google Analytics 4 measurement ID
- `VITE_GOOGLE_SITE_VERIFICATION` — Search Console HTML verification token
- `VITE_SOCIAL_LINKEDIN`, `VITE_SOCIAL_YOUTUBE`, `VITE_SOCIAL_INSTAGRAM`, `VITE_SOCIAL_X`, `VITE_SOCIAL_GITHUB` — public HTTPS profile URLs; the LinkedIn, X, and GitHub footer icons fall back to their official homepages when no profile URL is set
- `VITE_CONTACT_EMAIL` — public contact address

Vite embeds `VITE_*` values in the client bundle. Do not put credentials or private keys in frontend environment variables. Analytics is only loaded when a valid measurement ID is configured; deploy it in line with applicable consent and privacy requirements.

## Validation

```powershell
npm --prefix frontend run build
npm --prefix frontend run lint
```
