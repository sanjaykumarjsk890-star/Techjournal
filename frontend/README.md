# TechJournal frontend

The React/Vite client provides the public blog and administrator CMS. For complete local setup, backend configuration, seeding, and deployment settings, see the [project README](../README.md).

## Commands

```powershell
npm install
npm run dev
npm run build
npm run lint
```

Copy `.env.example` to `.env` to configure the API URL, analytics, Search Console verification, public social links, and contact email. All `VITE_*` values are public in the built client and must not contain secrets.
