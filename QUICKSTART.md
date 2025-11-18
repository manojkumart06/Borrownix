# Quick Start Guide

Get your Finance Tracker up and running in 5 minutes!

## 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Configure Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use any text editor
```

**Minimum required settings in .env:**

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_32_character_secret
```

**Get MongoDB Connection String:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (takes 5 minutes)
3. Get connection string
4. Replace `<password>` with your DB password

**Generate JWT Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Configure Frontend (Optional)

```bash
cd ../frontend

# Copy environment file
cp .env.example .env

# Edit if needed (default: http://localhost:4000/api)
nano .env
```

## 4. Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Backend will start on http://localhost:4000

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:3000

## 5. Use the Application

1. Open browser: http://localhost:3000
2. Click "Sign Up" and create an account
3. Login with your credentials
4. Start adding borrowers!

## Common Commands

```bash
# Backend
npm start          # Production mode
npm run dev        # Development mode with nodemon

# Frontend
npm run dev        # Development mode
npm run build      # Build for production
npm run preview    # Preview production build
```

## Troubleshooting

**Port already in use:**

```bash
# Change PORT in backend/.env to different number (e.g., 5000)
# Update frontend/.env VITE_API_URL accordingly
```

**MongoDB connection error:**

- Check your connection string
- Verify IP whitelist in MongoDB Atlas (use 0.0.0.0/0 for development)
- Ensure password doesn't have special characters

**Frontend can't connect to backend:**

- Verify backend is running on port 4000
- Check VITE_API_URL in frontend/.env
- Check browser console for errors

## Next Steps

- Read [README.md](README.md) for detailed documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Customize the UI in `frontend/src`
- Add more features as needed

## Email Notifications (Optional)

To enable email reminders:

1. Add to backend/.env:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Not your regular password!
FROM_EMAIL=your-email@gmail.com
```

2. For Gmail:

   - Enable 2-factor authentication
   - Generate App Password: Account → Security → 2-Step Verification → App Passwords
   - Use that password in SMTP_PASS

3. Reminders run daily at 9:00 AM (configurable in `backend/jobs/reminderJob.js`)

## File Structure Overview

```
Finance/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   ├── jobs/           # Cron jobs
│   └── server.js       # Main server
├── frontend/
│   ├── src/
│   │   ├── pages/      # Login, Dashboard, Borrowers, etc.
│   │   ├── components/ # Reusable UI components
│   │   └── utils/      # Helper functions
│   └── index.html
└── README.md           # Full documentation
```

## Development Tips

1. **Hot Reload**: Both frontend and backend auto-reload on file changes
2. **Database**: Use MongoDB Compass to view your data visually
3. **API Testing**: Use Postman or Thunder Client for API testing
4. **Debugging**: Check browser console and terminal logs

## Need Help?

1. Check [README.md](README.md) for detailed info
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
3. Review error messages in terminal
4. Check MongoDB Atlas connection status

---

Happy lending! 💰
