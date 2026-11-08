# Runbook: turning on accounts

Everything needed to take sign-in and sync from "built" to "live". Steps are in order; each one says where you'll be working and how you know it worked. Plan on about an hour, most of it waiting on DNS.

**Already done for you**

- Supabase project **SWC Events 2027** (`lwithjozvrufswjnnrdx`, us-west-1, free plan) with tables, row level security, and the keep-alive function.
- Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (all environments), `CRON_SECRET` (Production). The old `NEXT_PUBLIC_SUPABASE_ANON_KEY` is removed.
- Code: sign-in (Google, Discord, emailed code), sync, account page, public profiles, account deletion, daily keep-alive cron.
- Production: the 2027 site is live on `main` with `NEXT_PUBLIC_ACCOUNTS=off` in Production, so swc.events shows no **Sign in** button until step 8. The keep-alive cron already runs daily, so the database stays awake.

**What you'll need open:** a terminal in this repo, the [Supabase dashboard](https://supabase.com/dashboard/project/lwithjozvrufswjnnrdx), [Resend](https://resend.com), [Porkbun](https://porkbun.com) (DNS for `swc.events`), [Google Cloud Console](https://console.cloud.google.com), and the [Discord Developer Portal](https://discord.com/developers/applications).

Values you'll reuse:

| Name | Value |
| --- | --- |
| Supabase callback URL | `https://lwithjozvrufswjnnrdx.supabase.co/auth/v1/callback` |
| Supabase project URL | `https://lwithjozvrufswjnnrdx.supabase.co` |
| Publishable key | `sb_publishable_Kvm4Tfjw_jzhFWBXaKTt4A_Gq6zHSrs` |

## 1. Update your local .env

*Where: your editor.* The Supabase lines in `.env` still point at the paused 2023 project.

- [ ] Delete the `NEXT_PUBLIC_SUPABASE_ANON_KEY` line.
- [ ] Replace the `NEXT_PUBLIC_SUPABASE_URL` line and add the publishable key:

```
NEXT_PUBLIC_SUPABASE_URL=https://lwithjozvrufswjnnrdx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Kvm4Tfjw_jzhFWBXaKTt4A_Gq6zHSrs
```

**Done when:** `pnpm dev` shows a **Sign in** button in the header.

## 2. Create the Supabase secret key

*Where: Supabase dashboard, then terminal.* Account deletion needs a server-only key that can remove users.

- [ ] Supabase dashboard: **Project Settings > API Keys > Secret keys > New secret key**. Name it `vercel-account-deletion`. Copy it.
- [ ] Add it to Vercel Production. The command prompts for the value, so it never lands in shell history:

```bash
vercel env add SUPABASE_SECRET_KEY production --sensitive
```

- [ ] Add it to Preview too, so you can test deletion on a preview deploy. Leave the git branch prompt empty to apply it to all preview branches:

```bash
vercel env add SUPABASE_SECRET_KEY preview --sensitive
```

- [ ] Optional, for testing deletion locally: add `SUPABASE_SECRET_KEY=...` to `.env`.

**Done when:** `vercel env ls` lists `SUPABASE_SECRET_KEY` for Production and Preview.

## 3. Set up Resend for sign-in emails

*Where: Resend, then Porkbun.* Supabase's built-in email sender allows only a few messages per hour; Resend sends the 6-digit codes.

- [ ] Resend: **Domains > Add domain** > `swc.events`.
- [ ] Porkbun: **Domain Management > swc.events > DNS**. Add each record Resend shows (usually an MX and a TXT on `send`, and a TXT on `resend._domainkey`). In Porkbun's **Host** field enter only the part before `.swc.events` (for example `send`). These live on a subdomain, so they don't touch any existing email setup on the root domain.
- [ ] Back in Resend, click **Verify**. DNS can take a few minutes to an hour.
- [ ] Resend: **API Keys > Create API key**, permission **Sending access**, domain `swc.events`. Copy it for step 6. You don't need to save it anywhere.

**Done when:** the domain shows **Verified** in Resend.

## 4. Create the Google sign-in client

*Where: Google Cloud Console.* Create a new project (for example "SWC Events") or reuse one.

- [ ] **Google Auth Platform > Branding:** app name `SWC Events`, your support email, authorized domains `swc.events` and `supabase.co`.
- [ ] **Audience:** User type **External**, then **Publish app**. While it stays in "Testing", only listed test users can sign in. The app only asks for basic email and profile access, so publishing doesn't require Google review.
- [ ] **Clients > Create client:** type **Web application**.
  - Authorized JavaScript origins: `https://swc.events`
  - Authorized redirect URIs: `https://lwithjozvrufswjnnrdx.supabase.co/auth/v1/callback`
- [ ] Copy the **Client ID** and **Client secret** for step 6.

**Done when:** the client appears under **Clients** and the app's publishing status is **In production**.

## 5. Point Discord at the new project

*Where: Discord Developer Portal.* Your `.env` already has `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` from an earlier app.

- [ ] Open the application whose ID matches `DISCORD_CLIENT_ID` (or create a new one named `SWC Events`).
- [ ] **OAuth2 > Redirects > Add Redirect:** `https://lwithjozvrufswjnnrdx.supabase.co/auth/v1/callback`, then **Save Changes**.
- [ ] If you created a new app, or the old secret no longer works: **Reset Secret**, and update both Discord lines in `.env`.

**Done when:** the redirect is saved and `.env` holds the current ID and secret.

## 6. Apply the auth settings

*Where: Supabase dashboard, then terminal.*

- [ ] Create a personal access token at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens). Name it `swc-configure-auth`. You can revoke it right after this step.
- [ ] Run the settings script. It loads the Discord values from `.env`, then silently prompts for the Supabase token, Resend key, and Google client ID and secret:

```bash
set -a && source .env && set +a && ./supabase/configure-auth.sh
```

The script ([configure-auth.sh](../supabase/configure-auth.sh)) sets:
- the site URL and allowed redirect URLs (production, previews, localhost)
- 6-digit code emails
- Resend as the email sender
- the Google and Discord providers

It's safe to re-run.

**Done when:** it prints the applied settings (with `external_google_enabled: true` and `external_discord_enabled: true`) and ends with `Auth settings applied`.

## 7. Test on a preview deploy

*Where: terminal, then a browser and your phone.*

- [ ] Build a preview deploy from your checkout of `main`. Previews have accounts turned on (`NEXT_PUBLIC_ACCOUNTS` is only set in Production). The command prints the preview URL when it finishes:

```bash
vercel deploy
```

- [ ] Open the preview URL and run through:
  - [ ] **Email code:** Sign in > enter an email > the code arrives from `no-reply@swc.events` > entering it signs you in.
  - [ ] **Google** and **Discord:** each signs in and returns you to the page you started on.
  - [ ] **Merge:** sign out, save a few events while signed out, sign in. The events are still there and the account menu says **Synced**.
  - [ ] **Cross-device:** save events on the laptop, sign in on your phone. The same events appear (re-focus the tab to force a sync).
  - [ ] **Offline:** on the phone, turn on airplane mode, save an event, turn it off. The account menu goes from offline to **Synced**.
  - [ ] **Public profile:** Account > set a handle > turn on **Make my schedule public** > Save > **View public page**. In a private window the page loads; turn it off and the page says it's private.
  - [ ] **Delete account:** with a throwaway email account, Account > **Delete account** > type `delete`. You're signed out, and signing in with that email starts a fresh, empty account.

**Done when:** every box above is checked.

## 8. Turn on accounts in production

*Where: terminal.* The code is already live; this removes the switch that hides sign-in.

- [ ] Remove the switch from Production:

```bash
vercel env rm NEXT_PUBLIC_ACCOUNTS production --yes
```

- [ ] Redeploy production. The switch is read at build time, so the old build keeps hiding sign-in until this finishes:

```bash
vercel deploy --prod
```

**Done when:** swc.events shows a **Sign in** button in the header and signing in works.

To hide accounts again, add the switch back and redeploy:

```bash
printf off | vercel env add NEXT_PUBLIC_ACCOUNTS production
```

## 9. Optional: remove unused Vercel env vars

*Where: terminal.* These served the Font Awesome Pro and private GitHub packages, which the project no longer installs.

```bash
vercel env rm NPM_RC --yes
```

```bash
vercel env rm X_GITHUB_AUTH_TOKEN --yes
```

```bash
vercel env rm X_FONTAWESOME_NPM_AUTH_TOKEN --yes
```

Also revoke the Supabase access token from step 6 if you haven't.

## Before the show (March 2027)

- [ ] **Resend plan:** the free plan caps sending at 100 emails a day, which opening morning can exceed. Upgrade to the paid plan for March and April.
- [ ] **Schedule feeds:** once the official 2027 feeds exist, set `SCHEDULE_ENDPOINT` and `VENDOR_ENDPOINT` in Vercel (all environments), then remove `NEXT_PUBLIC_SCHEDULE_ENDPOINT` and `NEXT_PUBLIC_VENDOR_ENDPOINT`. See the [README environment table](../README.md#environment).
- [ ] **Supabase plan:** the keep-alive cron covers the free tier. Upgrade to Pro only if usage outgrows it (500 MB database, 50,000 monthly active users).

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| "Sign-in didn't finish" on /account after Google or Discord | Redirect URL not allowed | Re-run step 6; check the preview URL matches `swc-events-*-shawn-hoffmans-projects.vercel.app` |
| Google says "Access blocked" or "app not verified" | App still in Testing | Step 4, **Audience > Publish app** |
| Discord says "Invalid OAuth2 redirect_uri" | Redirect missing in Discord | Step 5 |
| Code email never arrives | Domain not verified, or Resend key lacks sending access | Step 3; check **Logs** in Resend |
| "Email rate limit exceeded" | Supabase email rate limit | The script sets 300 per hour; raise `rate_limit_email_sent` in [configure-auth.sh](../supabase/configure-auth.sh) and re-run |
| Delete account says it isn't available | `SUPABASE_SECRET_KEY` missing for that environment | Step 2, then redeploy |
| No **Sign in** button on swc.events | `NEXT_PUBLIC_ACCOUNTS=off` still set in Production, or production wasn't redeployed after removing it | Step 8 |
| Sign-in or sync fails everywhere, dashboard shows project paused | Keep-alive didn't run for 7+ days | Restore the project in the Supabase dashboard, then in Vercel **Settings > Cron Jobs** click **Run** on `/api/cron/keep-alive` and check for a 200. A 401 means `CRON_SECRET` is missing in Production; a 503 means the Supabase env vars didn't reach the deploy |
