<img width="883" height="543" alt="Screenshot 2026-05-04 at 11 45 55 AM" src="https://github.com/user-attachments/assets/7938fce0-8981-4902-826a-04c35340dcbf" /><img width="878" height="516" alt="Screenshot 2026-05-04 at 11 47 12 AM" src="https://github.com/user-attachments/assets/1adea558-e205-45aa-8d95-9c466f7e36f6" />
<img width="880" height="544" alt="Screenshot 2026-05-04 at 11 46 23 AM" src="https://github.com/user-attachments/assets/4d0e5555-d0f2-4b27-90d5-1e766f565c5f" />
<img width="879" height="515" alt="Screenshot 2026-05-04 at 11 46 47 AM" src="https://github.com/user-attachments/assets/054951b4-03c2-4c08-94fe-149db8cbca43" />



<img width="879" height="517" alt="Screenshot 2026-05-04 at 11 47 41 AM" src="https://github.com/user-attachments/assets/69ca556f-270e-453b-8aca-9d7a22906196" />

# Growtix_company_1

MERN monorepo for Growtix: AI lead generation API (`packages/api`), BullMQ workers (`apps/workers`), and React web app (`apps/web`).

## Quick start

1. `docker compose up -d` (MongoDB + Redis)
2. Copy `.env.example` to `.env` and set secrets
3. `npm install` && `npm run build`
4. `npm run dev` (API, web, workers)

Optional admin seed: `npm run seed -w @growtix/api`

Email verification and password reset use `PUBLIC_WEB_URL`, `EMAIL_FROM`, and `EMAIL_PROVIDER` (`console` logs links in the worker; set `RESEND_API_KEY` and `EMAIL_PROVIDER=resend` to send mail). See `.env.example`.
