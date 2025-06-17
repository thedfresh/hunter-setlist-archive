## Hosting & Deployment
This project is hosted on a DigitalOcean droplet.

### Deployment Process
- Code is deployed to the droplet using **GitHub Actions** (automatic deployment on push to main)
- The production site runs on **Next.js** with **PostgreSQL** database and **Nginx** reverse proxy
- For updates, push to the main branch and GitHub Actions automatically builds and deploys via PM2 restart

### Droplet Details
- **OS**: Ubuntu 24.10
- **Specs**: 1GB RAM, 1vCPU, 25GB SSD
- **Domain**: https://stillunsung.com (primary), https://darkstarcrashes.com (redirects)
- **IP**: 134.199.227.86

### Security
- Only authorized users can SSH into the droplet using SSH keys
- Environment variables and secrets are managed via `.env.production` files on the server (not committed to git)
- HTTPS enabled with Let's Encrypt SSL certificates (auto-renewal configured)

### Local Development
- Uses separate local PostgreSQL database (`hunter_archive_dev`)
- Sync production data with: `pg_dump` from production → import to local dev database
- Run locally with `npm run dev` on port 3000

---

For more internal context, see `CONTEXT.md` (not for public sharing).