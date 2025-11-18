import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BorrowersList from './pages/BorrowersList';
import BorrowerForm from './pages/BorrowerForm';
import BorrowerDetail from './pages/BorrowerDetail';
import CollectionsView from './pages/CollectionsView';
import AdminDashboard from './pages/AdminDashboard';
import { isAuthenticated } from './utils/auth';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Home />}
        />
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Signup />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/borrowers"
          element={
            <PrivateRoute>
              <Layout>
                <BorrowersList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/borrowers/new"
          element={
            <PrivateRoute>
              <Layout>
                <BorrowerForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/borrowers/:id"
          element={
            <PrivateRoute>
              <Layout>
                <BorrowerDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/borrowers/:id/edit"
          element={
            <PrivateRoute>
              <Layout>
                <BorrowerForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/borrowers/:id/collections"
          element={
            <PrivateRoute>
              <Layout>
                <CollectionsView />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
