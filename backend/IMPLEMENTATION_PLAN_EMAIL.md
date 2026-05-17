# Email Service Implementation Plan

Currently, the system is in **Simulation Mode**. It logs emails to the server console instead of sending them. To enable real email sending for features like "Forgot Password", follow this guide.

## 1. Choose an Email Provider
We recommend **Gmail** for development/testing or **SendGrid/AWS SES** for production. This guide covers **Gmail**.

## 2. Generate an App Password (For Gmail)
**Security Warning:** Do NOT use your real Google account password. You must generate a secure "App Password".

1.  Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2.  Ensure **2-Step Verification** is enabled (required).
3.  Search for **"App passwords"** in the search bar at the top (or look under 2-Step Verification settings).
4.  Create a new App Password:
    *   **App name**: "School Management System"
    *   Click **Create**.
5.  Copy the 16-character code (e.g., `abcd efgh ijkl mnop`). This is your `SMTP_PASS`.

## 3. Update Configuration
Open the file `backend/.env` and update the email section with your new credentials.

```env
# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=paste-your-16-char-app-password-here
EMAIL_FROM=noreply@school.com
```

### Configuration Table
| Provider | Host | Port | Secure |
| :--- | :--- | :--- | :--- |
| **Gmail** | `smtp.gmail.com` | `587` | False (uses STARTTLS) |
| **Outlook** | `smtp.office365.com` | `587` | False |
| **SendGrid** | `smtp.sendgrid.net` | `587` | False |

## 4. Verification Steps
1.  **Restart the Backend Server**:
    STOP the current terminal running `npm start` (Ctrl+C) and run it again to load the new `.env` settings.
    ```bash
    cd backend
    npm start
    ```

2.  **Test "Forgot Password"**:
    *   Go to login page: `http://localhost:5173`.
    *   Click **Forgot Password**.
    *   Enter your specific email address.
    *   Click **Send**.

3.  **Check Inbox**:
    *   You should actually receive an email now.
    *   The server console will verify success with: `Email sent successfully to ...`

## 5. Troubleshooting
*   **Error: Invalid login**: Double-check you copied the App Password correctly without spaces.
*   **Error: ETIMEDOUT**: Your firewall or antivirus might be blocking port 587. Try disabling them temporarily.
*   **Simulation Still Running?**: Make sure you removed the placeholder text `your-email` from the `SMTP_USER` field in `.env`. The system simulates emails if it detects invalid config.
