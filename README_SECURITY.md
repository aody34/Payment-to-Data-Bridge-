# Security & Scalability Roadmap

## Security Best Practices
- **Rate Limiting**: Currently implemented via standard Express middleware (suggested in `server.js` but needs specific library `express-rate-limit`).
  - *Recommendation*: `npm install express-rate-limit` and limit `/pay` to 5 requests per minute per IP.
- **Helmet**: Helmet middleware is already added to secure HTTP headers.
- **CORS**: Configured to allow all (`*`) for dev. For production, restrict to the specific frontend domain.
- **Input Validation**: currently manual. Suggest using `joi` or `zod` for strict schema validation.
- **Database**: Use environment variables for credentials (implemented). Ensure the DB user has minimum necessary privileges.

## Scalability & Transition to Production
1. **Transition to Official APIs**:
   - Replace the mock logic in `/api/pay` with Hormuud's Merchant API client.
   - Replace `/api/disburse` with Somtel's eDahab API.
   - Secure the API keys in `.env` (never commit them).
2. **Database Migration**:
   - The current logic is fine for up to thousands of transactions.
   - For high volume, add indices on `user_phone` and `created_at` for faster lookup.
3. **Queue System**:
   - Instead of `setTimeout` or immediate processing, use a queue (like Redis/BullMQ) to handle payments and disbursements asynchronously. This prevents data loss if the server crashes during a transaction.
4. **Monitoring**:
   - Integrate Sentry for error tracking.
   - Use Prometheus/Grafana for metric visualization.

## Deployment Guide
1. **VPS Setup**:
   - Install Node.js, PostgreSQL, Nginx, and PM2.
2. **Environment**:
   - Clone repo.
   - Run `npm install` in server and client.
   - Build client: `cd client && npm run build`.
   - Setup Nginx to serve the `client/dist` folder and reverse-proxy `/api` to `localhost:5000`.
3. **Process Management**:
   - Run backend with PM2: `pm2 start server.js`.
