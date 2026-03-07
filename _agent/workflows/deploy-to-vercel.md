---
description: How to push and deploy (rebuild) to Vercel
---

1. **Commit and Push to Git**
   Ensure all your changes are saved and pushed to your GitHub or GitLab repository.
   ```powershell
   git add .
   git commit -m "feat: your message"
   git push origin main
   ```

2. **Vercel Project Setup (First Time)**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New** > **Project**.
   - Import your repository.

3. **Configure Environment Variables**
   In the Vercel project settings, add the following variables from your `.env` file:
   - `DATABASE_URL`: Your Supabase connection string.
   - `NEXTAUTH_SECRET`: A random string for security.
   - `NEXTAUTH_URL`: Your production URL (e.g., `https://your-app.vercel.app`).

4. **Automatic Rebuilds**
   Vercel automatically detects pushes to the linked branch (e.g., `main`) and starts a new build.

5. **Manual Re-deploy (Optional)**
   - Go to the **Deployments** tab in Vercel.
   - Click the three dots `...` next to a deployment and select **Redeploy**.
