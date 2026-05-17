# Setup Guide

## 1. Database Configuration
The MySQL server is running, but the application cannot connect because of incorrect credentials.

1.  Open the file `.env` in the root directory.
2.  Find the line `DB_PASSWORD=`.
3.  Add your MySQL root password after the equal sign.
    *   Example: `DB_PASSWORD=mySecretPassword123`

## 2. Initialize Database
Once the password is correct, run the following command to create the database and tables:

```bash
node config/init_db.js
```

## 3. Seed Data (Optional)
To add sample users (Admin, Teacher, Student) and data:

```bash
npm run seed
```

## 4. Start the Server
```bash
npm start
```
