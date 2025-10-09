## Disabling Vercel Authentication (Deployment Protection)

This short guide walks you through disabling the "Vercel Authentication" deployment protection so your site is publicly accessible without requiring visitors to sign in to your Vercel team.

1. Open https://vercel.com and sign in with your account.
2. From the dashboard, choose the project that corresponds to this repository (e.g., `24005826G_lab2` or the name you used when importing the repo).
3. Click "Settings" in the left-hand project sidebar.
4. Scroll to or search for "Deployment Protection". On some Vercel UI layouts this appears within the "General" settings section.
5. Inside Deployment Protection you'll see a toggle labeled "Vercel Authentication". Turn that toggle OFF (disabled).
6. If there is a Save button, click it. Otherwise the change may be applied immediately.
7. Re-deploy the project or trigger a new deployment (optional but recommended) to ensure the change is active on the production deployment.

Troubleshooting:

- Can't find Deployment Protection? Vercel occasionally relocates settings. Use the Settings search box and search for "Deployment Protection" or "Authentication".
- Still asked to sign in? Confirm you disabled "Vercel Authentication" specifically. You may also have branch protections or integrations that require additional steps.

Security reminder:

- Disabling authentication only affects access gating on the Vercel deployment; it does not expose environment variable values to clients. Make sure sensitive credentials are stored only in Vercel's Environment Variables and not committed to the repository.

If you'd like, I can produce annotated screenshots of the Vercel UI — tell me which account (personal/team) and I'll generate step images you can follow locally.
