# 🛡️ SMS Maintenance & Operations Guide

This guide ensures the stability and longevity of the School Management System (SMS).

## 1. Daily Operations (How to start)

1. **Start Database:** Open **XAMPP Control Panel** and start **MySQL** (and Apache if needed).
2. **Start Backend:**
   - Open terminal in `/backend` folder.
   - Run: `npm run dev`
3. **Start Frontend:**
   - Open terminal in `/frontend sms` folder.
   - Run: `npm run dev`

## 2. Preventing Data Corruption (CRITICAL)

**Always stop the MySQL service** through the XAMPP Control Panel before:
- Shutting down your computer.
- Closing XAMPP.

> [!WARNING]
> If the computer loses power or restarts while MySQL is running, the `ib_logfile0` and `ib_logfile1` files can become corrupted, preventing the database from starting.

**If the database fails to start:**
1. Go to `C:\xampp\mysql\data`.
2. Delete (or rename to .bak) `ib_logfile0` and `ib_logfile1`.
3. Restart MySQL.

## 3. System Verification (For Presentation)

Before presenting your code to the examiners, run the automated health check:
```powershell
cd backend
node tests/system_verification.js
```

## 4. Database Backups

It is highly recommended to export your database daily:
1. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Select the `sms_db` (or your chosen database name).
3. Click the **Export** tab and then **Go**.
4. Keep the `.sql` file in a safe place.

## 5. Security & Credentials

- **JWT Secret:** Managed in `/backend/.env`.
- **Password Hashing:** Uses `bcrypt` (10 rounds) for maximum security.
- **Portals:** Access is strictly role-based (Admin, Teacher, Principal, Student, Parent).
