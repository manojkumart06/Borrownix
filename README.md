# Finance Tracker - Personal Lending Management System

A full-stack web application for managing personal finance lending business. Track borrowers, monthly interest collections, and get timely reminders for due payments.

## Features

- **User Authentication**: Secure signup/login system with JWT
- **Borrower Management**: Add, edit, delete, and view borrowers
- **Interest Tracking**: Track monthly interest collections with status updates
- **Dashboard**: Overview with statistics, upcoming collections, and overdue alerts
- **Notifications**: Email reminders 2 days before and on the due date
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Toast Notifications**: Real-time feedback for all user actions

## Tech Stack

### Frontend

- React 18
- React Router v6
- Tailwind CSS
- React Hook Form
- React DatePicker
- React Hot Toast
- Axios
- Vite

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Node-cron for scheduled tasks
- Nodemailer for email notifications

## Project Structure

```
Finance/
├── backend/
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth middleware
│   ├── jobs/            # Cron jobs for reminders
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- SMTP email service (Gmail, SendGrid, etc.) - Optional for email reminders

### Installation

1. **Clone or navigate to the project directory**

   ```bash
   cd Finance
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install

   # Create .env file
   cp .env.example .env

   # Edit .env with your configuration
   # Required: MONGO_URI, JWT_SECRET
   # Optional: SMTP settings for email notifications
   ```

3. **Setup Frontend**

   ```bash
   cd ../frontend
   npm install

   # Create .env file (optional - defaults to localhost:4000)
   cp .env.example .env
   ```

### Configuration

#### Backend (.env)

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finance-tracker
JWT_SECRET=your_very_strong_secret_key_here_min_32_characters
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@financetracker.com
FRONTEND_URL=http://localhost:3000
```

#### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `MONGO_URI`

#### Email Setup (Optional)

For Gmail:

1. Enable 2-factor authentication
2. Generate an App Password: Google Account → Security → 2-Step Verification → App Passwords
3. Use the generated password in `SMTP_PASS`

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000/api
```

### Running the Application

1. **Start Backend**

   ```bash
   cd backend
   npm run dev
   # Backend will run on http://localhost:4000
   ```

2. **Start Frontend** (in a new terminal)

   ```bash
   cd frontend
   npm run dev
   # Frontend will run on http://localhost:3000
   ```

3. **Access the Application**
   - Open browser and go to `http://localhost:3000`
   - Sign up for a new account
   - Start adding borrowers and tracking collections!

## Usage Guide

### 1. Sign Up / Login

- Create an account with your email and password
- Your friends can also create accounts to manage their own borrowers

### 2. Add a Borrower

- Click "Add New Borrower"
- Fill in:
  - Borrower name
  - Principal amount
  - Interest (fixed amount or percentage)
  - Date finance was provided
  - Optional notes
- System automatically creates 12 monthly collection records

### 3. Track Collections

- View all borrowers on the dashboard
- See upcoming and overdue collections
- Click "Mark" to record interest collection
- Select collection date and amount
- Add notes if needed

### 4. View Collection History

- Click "View" next to any borrower
- See all monthly collections with status
- Mark collections as received or pending

### 5. Get Reminders

- Email reminders are sent automatically:
  - 2 days before due date
  - On the due date
  - For overdue collections
- Reminders run daily at 9:00 AM

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### Borrowers

- `GET /api/borrowers` - List all borrowers
- `POST /api/borrowers` - Create borrower
- `GET /api/borrowers/:id` - Get single borrower
- `PUT /api/borrowers/:id` - Update borrower
- `DELETE /api/borrowers/:id` - Delete borrower (soft delete)
- `GET /api/borrowers/:id/collections` - Get borrower's collections

### Collections

- `GET /api/collections` - List collections (with filters)
- `PUT /api/collections/:id/mark-collected` - Mark as collected
- `PUT /api/collections/:id/mark-pending` - Mark as pending
- `GET /api/collections/dashboard/summary` - Dashboard statistics

## Deployment

### Deploy Backend (Render/Railway)

#### Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables from .env.example
5. Deploy

#### Railway

1. Go to [Railway](https://railway.app)
2. Create new project
3. Deploy from GitHub
4. Add environment variables
5. Deploy

### Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL`: Your deployed backend URL + /api
5. Deploy

### Post-Deployment

- Update backend `FRONTEND_URL` environment variable with your Vercel URL
- Update frontend `VITE_API_URL` with your Render/Railway API URL
- Test email notifications
- Verify CORS settings

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Passwords hashed with bcrypt (salt rounds: 10)
- Environment variables for sensitive data
- Input validation on both frontend and backend
- MongoDB injection protection with Mongoose
- CORS enabled for specified frontend URL

## Troubleshooting

### Backend won't start

- Check MongoDB connection string
- Verify all environment variables are set
- Check if port 4000 is available

### Frontend can't connect to backend

- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running

### Email notifications not working

- Verify SMTP credentials
- Check email provider settings
- Emails are optional - app works without them

### Collections not generating

- Check if dateProvided is set correctly
- Verify borrower was created successfully
- Check backend logs for errors

## Future Enhancements

- [ ] SMS notifications
- [ ] Push notifications
- [ ] Export data to Excel/PDF
- [ ] Payment history tracking
- [ ] Multi-currency support
- [ ] Advanced analytics and reports
- [ ] Mobile app (React Native)
- [ ] Bulk import borrowers
- [ ] Payment reminders to borrowers
- [ ] Custom interest calculation formulas

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT License - feel free to use this for your own lending business

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the code comments
3. Verify environment variables are correctly set

## Credits

Built with modern web technologies for efficient personal finance management.

---

**Note**: This application is designed for personal use. Ensure you comply with local lending and financial regulations in your jurisdiction.
