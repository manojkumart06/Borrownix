# Admin Dashboard Documentation

## Overview

The admin dashboard allows administrators to monitor all users, view their activity, and manage user accounts. This feature includes both backend APIs and a comprehensive frontend interface.

---

## Backend Implementation

### 1. User Model Updates ([backend/models/User.js](backend/models/User.js))

**Added Fields:**
- `role`: Now includes 'admin' option (enum: ['owner', 'friend', 'admin'])
- `lastLoginAt`: Tracks the last login timestamp
- `loginCount`: Counts total number of logins
- `isActive`: Boolean flag to activate/deactivate users

### 2. Authentication Updates ([backend/controllers/authController.js](backend/controllers/authController.js))

**Login Tracking:**
- Updates `lastLoginAt` on every successful login
- Increments `loginCount` counter
- Tracks user activity automatically

### 3. Admin Middleware ([backend/middleware/adminAuth.js](backend/middleware/adminAuth.js))

**Purpose:** Protects admin routes by verifying:
- User is authenticated (valid JWT token)
- User has 'admin' role
- User exists in database

### 4. Admin Controller ([backend/controllers/adminController.js](backend/controllers/adminController.js))

**Endpoints:**

#### GET `/api/admin/users`
**Description:** Get all users with statistics

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "owner",
      "lastLoginAt": "2025-11-17T10:30:00Z",
      "loginCount": 15,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "stats": {
        "borrowerCount": 5,
        "collectionCount": 30,
        "pendingCollections": 10
      },
      "isOnline": true
    }
  ],
  "count": 10
}
```

#### GET `/api/admin/stats`
**Description:** Get overall dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 50,
      "active": 48,
      "admins": 2,
      "recentLogins": 25
    },
    "borrowers": {
      "total": 250
    },
    "collections": {
      "total": 1500,
      "pending": 300,
      "received": 1100,
      "totalAmountCollected": 5000000
    }
  }
}
```

#### PUT `/api/admin/users/:userId/status`
**Description:** Activate or deactivate a user

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": false
  }
}
```

#### GET `/api/admin/users/:userId/activity`
**Description:** Get detailed user activity

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "lastLoginAt": "2025-11-17T10:30:00Z",
      "loginCount": 15,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "recentBorrowers": [
      {
        "_id": "borrower_id",
        "borrowerName": "Alice Smith",
        "createdAt": "2025-11-15T08:00:00Z"
      }
    ],
    "recentCollections": [
      {
        "_id": "collection_id",
        "borrowerId": {
          "borrowerName": "Alice Smith"
        },
        "status": "received",
        "amountCollected": 5000,
        "dueDate": "2025-11-10T00:00:00Z"
      }
    ]
  }
}
```

### 5. Admin Routes ([backend/routes/admin.js](backend/routes/admin.js))

All routes are protected with `adminAuthMiddleware`:
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get dashboard statistics
- `PUT /api/admin/users/:userId/status` - Update user status
- `GET /api/admin/users/:userId/activity` - Get user activity

---

## Frontend Implementation

### 1. Admin Dashboard Page ([frontend/src/pages/AdminDashboard.jsx](frontend/src/pages/AdminDashboard.jsx))

**Features:**
- **Statistics Cards:** Display total users, recent logins, borrowers, and collections
- **User Table:** Shows all users with their details:
  - Name and email
  - Role badge (admin/owner/friend)
  - Active status and online indicator
  - Last login time and total login count
  - User statistics (borrowers, pending collections)
  - Action buttons (View Activity, Activate/Deactivate)
- **Activity Modal:** Detailed view of individual user activity:
  - User info (joined date, last login, total logins, status)
  - Recent borrowers created
  - Recent collections activity
- **Real-time Online Status:** Shows green dot for users logged in within last 30 minutes
- **Access Control:** Automatically redirects non-admin users to dashboard

### 2. Navigation Integration ([frontend/src/components/Layout.jsx](frontend/src/components/Layout.jsx))

**Admin Menu Item:**
- Only visible to users with 'admin' role
- Shows ⚙️ icon with "Admin" label
- Automatically added to navigation menu

### 3. Routing ([frontend/src/App.jsx](frontend/src/App.jsx))

**New Route:**
```jsx
<Route path="/admin" element={
  <PrivateRoute>
    <AdminDashboard />
  </PrivateRoute>
} />
```

---

## How to Use

### 1. Create an Admin User

You need to manually create an admin user in the database. You can do this via MongoDB shell or Compass:

```javascript
// Update an existing user to admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)

// Or create a new admin user (after signing up via the UI)
// 1. Sign up normally via the UI
// 2. Then run the above command to upgrade to admin
```

### 2. Access the Admin Dashboard

1. Login with your admin credentials
2. Click on the "Admin" menu item in the navigation (⚙️)
3. You'll be redirected to `/admin`

### 3. View User Statistics

The dashboard displays:
- **Total Users:** All registered users
- **Recent Logins:** Users logged in within last 24 hours
- **Total Borrowers:** Across all users
- **Total Collected:** Sum of all received collections

### 4. Manage Users

**View All Users:**
- See complete list with online status
- View last login time and login count
- Check borrower and collection statistics

**View User Activity:**
1. Click "View Activity" button for any user
2. See detailed activity modal with:
   - User profile information
   - Recent borrowers they've created
   - Recent collection activity

**Activate/Deactivate Users:**
1. Click "Deactivate" button to disable a user
2. Click "Activate" button to re-enable a user
3. Deactivated users cannot login
4. You cannot deactivate your own account

### 5. Monitor Online Users

Users are considered "online" if they logged in within the last 30 minutes:
- Green pulsing dot indicates online status
- Last login timestamp shows exact time

---

## Security Features

1. **Role-Based Access Control:**
   - Only users with 'admin' role can access admin routes
   - Non-admin users are automatically redirected

2. **Protected API Endpoints:**
   - All admin endpoints require valid JWT token
   - Additional check for admin role

3. **Self-Protection:**
   - Admins cannot deactivate their own accounts
   - Prevents accidental lockout

4. **Password Security:**
   - Password hashes are never exposed in API responses
   - Sensitive data is excluded from user objects

---

## Database Schema Updates

### User Collection

```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String (enum: ['owner', 'friend', 'admin']),
  lastLoginAt: Date,
  loginCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Authentication

All admin API requests require the JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

The frontend `api` utility automatically includes this header for all authenticated requests.

---

## Troubleshooting

### "Access denied. Admin privileges required."

**Solution:** Your user account needs admin role:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### Admin menu not showing

**Solution:**
1. Check that your user has `role: 'admin'` in database
2. Logout and login again to refresh token
3. Clear browser cache and local storage

### Users showing as offline when they're online

**Solution:** The online status checks if `lastLoginAt` is within 30 minutes. Make sure:
1. The login tracking is working (check `lastLoginAt` in database)
2. System clocks are synchronized

---

## Future Enhancements

Potential features to add:
- [ ] User search and filtering
- [ ] Export user data to CSV
- [ ] Detailed audit logs
- [ ] User role management (promote/demote)
- [ ] Bulk user operations
- [ ] Email notifications to users
- [ ] Session management (force logout)
- [ ] User analytics and charts

---

## Support

For issues or questions about the admin dashboard, please refer to the main project documentation or create an issue in the repository.
