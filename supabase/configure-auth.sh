#!/usr/bin/env bash
# Applies the SWC Events auth settings to the Supabase project via the Management API.
# Idempotent: safe to re-run after rotating a key. Contains no secrets; reads them from the environment.
#
# Reads these from the environment, prompting for any that are missing:
#   SUPABASE_ACCESS_TOKEN   personal access token (https://supabase.com/dashboard/account/tokens)
#   RESEND_API_KEY          Resend API key with sending access for swc.events
#   GOOGLE_CLIENT_ID        Google OAuth web client
#   GOOGLE_CLIENT_SECRET
#   DISCORD_CLIENT_ID       Discord application (OAuth2)
#   DISCORD_CLIENT_SECRET
set -euo pipefail

PROJECT_REF="${PROJECT_REF:-lwithjozvrufswjnnrdx}"

# Prompt (without echo) for anything not already in the environment, so secrets
# never need to be written to a file or shell history.
for var in SUPABASE_ACCESS_TOKEN RESEND_API_KEY GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET DISCORD_CLIENT_ID DISCORD_CLIENT_SECRET; do
	if [ -z "${!var:-}" ]; then
		if [ -t 0 ]; then
			read -rsp "$var: " "${var?}"
			echo
			export "${var?}"
		fi
		if [ -z "${!var:-}" ]; then
			echo "Missing $var" >&2
			exit 1
		fi
	fi
done

read -r -d '' CODE_EMAIL <<'HTML' || true
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:420px;margin:0 auto;padding:24px;color:#111">
  <h2 style="margin:0 0 8px">Your sign-in code</h2>
  <p style="margin:0 0 16px;color:#444">Enter this code in the Celebration 2027 Companion to sign in.</p>
  <p style="font-size:32px;font-weight:800;letter-spacing:8px;margin:0 0 16px">{{ .Token }}</p>
  <p style="margin:0;color:#666;font-size:13px">It expires in one hour. If you didn't ask for it, you can ignore this email.</p>
</div>
HTML

payload=$(
	CODE_EMAIL="$CODE_EMAIL" python3 - <<'PY'
import json, os
e = os.environ
print(json.dumps({
    "site_url": "https://swc.events",
    "uri_allow_list": ",".join([
        "https://swc.events/**",
        "https://swc-events-*-shawnhoffman.vercel.app/**",
        "http://localhost:3000/**",
        "http://localhost:3100/**",
    ]),
    # Email: 6-digit codes instead of links (links open in the mail app's browser
    # and can't sign in a home-screen web app).
    "mailer_otp_length": 6,
    "mailer_otp_exp": 3600,
    "mailer_subjects_magic_link": "{{ .Token }} is your SWC Events sign-in code",
    "mailer_templates_magic_link_content": e["CODE_EMAIL"],
    "mailer_subjects_confirmation": "{{ .Token }} is your SWC Events sign-in code",
    "mailer_templates_confirmation_content": e["CODE_EMAIL"],
    # Resend SMTP (Supabase's built-in sender is limited to a few emails per hour).
    "smtp_host": "smtp.resend.com",
    "smtp_port": "465",
    "smtp_user": "resend",
    "smtp_pass": e["RESEND_API_KEY"],
    "smtp_admin_email": "no-reply@swc.events",
    "smtp_sender_name": "SWC Events",
    "rate_limit_email_sent": 300,
    # Social providers
    "external_google_enabled": True,
    "external_google_client_id": e["GOOGLE_CLIENT_ID"],
    "external_google_secret": e["GOOGLE_CLIENT_SECRET"],
    "external_discord_enabled": True,
    "external_discord_client_id": e["DISCORD_CLIENT_ID"],
    "external_discord_secret": e["DISCORD_CLIENT_SECRET"],
}))
PY
)

status=$(curl -sS -o /tmp/swc-auth-config.json -w '%{http_code}' -X PATCH \
	"https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
	-H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
	-H "Content-Type: application/json" \
	--data "$payload")

if [ "$status" != "200" ]; then
	echo "Supabase rejected the update (HTTP $status):" >&2
	cat /tmp/swc-auth-config.json >&2
	rm -f /tmp/swc-auth-config.json
	exit 1
fi

# Echo back the non-secret settings so the result can be checked at a glance.
jq '{site_url, uri_allow_list, mailer_otp_length, smtp_host, smtp_admin_email, external_google_enabled, external_discord_enabled}' /tmp/swc-auth-config.json
rm -f /tmp/swc-auth-config.json
echo "Auth settings applied to ${PROJECT_REF}."
