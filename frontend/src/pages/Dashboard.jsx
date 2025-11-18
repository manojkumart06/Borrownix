import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatCurrency, formatDate, calculateInterest, getDaysUntilDue } from '../utils/helpers';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const response = await api.get('/collections/dashboard/summary');
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get all loans for a borrower (legacy + new loans array)
  const getAllLoans = (borrower) => {
    if (!borrower) return [];

    const loans = [];

    // Add legacy loan if exists
    if (borrower.principalAmount && borrower.dateProvided) {
      loans.push({
        _id: 'legacy',
        principalAmount: borrower.principalAmount,
        interestAmount: borrower.interestAmount,
        interestIsPercent: borrower.interestIsPercent,
        dateProvided: borrower.dateProvided,
        notes: borrower.notes || '',
        status: 'active'
      });
    }

    // Add loans from loans array
    if (borrower.loans && borrower.loans.length > 0) {
      loans.push(...borrower.loans);
    }

    return loans;
  };

  // Get loan details by loanId
  const getLoanById = (borrower, loanId) => {
    const loans = getAllLoans(borrower);
    if (!loanId) {
      // Legacy collection without loanId - use first loan
      return loans[0] || null;
    }
    return loans.find(loan => loan._id && loan._id.toString() === loanId.toString()) || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-300 mt-1">Overview of your lending activities</p>
        </div>
        <Link to="/borrowers/new" className="btn-primary whitespace-nowrap text-sm sm:text-base">
          + Add New Borrower
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Borrowers</p>
          <p className="text-3xl font-bold text-lime-400">{summary?.totalBorrowers || 0}</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Lent</p>
          <p className="text-3xl font-bold text-lime-400">
            {formatCurrency(summary?.totalLent || 0)}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Interest This Month</p>
          <p className="text-3xl font-bold text-green-400">
            {formatCurrency(summary?.totalInterestThisMonth || 0)}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Due Today</p>
          <p className="text-3xl font-bold text-yellow-400">{summary?.dueToday || 0}</p>
        </div>
      </div>

      {/* Alerts */}
      {summary?.overdueCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                You have <strong>{summary.overdueCount}</strong> overdue collection{summary.overdueCount !== 1 ? 's' : ''}.{' '}
                <Link to="/borrowers" className="font-medium underline">
                  View now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Collections */}
      {summary?.upcoming && summary.upcoming.length > 0 && (
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Upcoming Collections</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-lime-400/20">
              <thead>
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Borrower
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Amount
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">
                    Due Date
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lime-400/10">
                {summary.upcoming.map((collection) => {
                  const daysUntil = getDaysUntilDue(collection.dueDate);
                  const loan = getLoanById(collection.borrowerId, collection.loanId);
                  const amount = loan ? calculateInterest(loan) : 0;
                  const allLoans = getAllLoans(collection.borrowerId);
                  const loanIndex = loan ? allLoans.findIndex(l => l._id === loan._id) : -1;

                  return (
                    <tr key={collection._id} className="hover:bg-white/5">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="min-w-max">
                          <div className="font-medium text-sm text-white">{collection.borrowerId.borrowerName}</div>
                          {allLoans.length > 1 && loanIndex >= 0 && (
                            <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded">
                              Loan #{loanIndex + 1}
                            </span>
                          )}
                          {/* Show due date on mobile */}
                          <div className="sm:hidden text-xs text-gray-400 mt-1">
                            {formatDate(collection.dueDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                        {formatDate(collection.dueDate)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <span
                          className={`badge-${
                            daysUntil === 0 ? 'pending' : daysUntil <= 2 ? 'pending' : 'pending'
                          } text-xs`}
                        >
                          {daysUntil === 0
                            ? 'Due Today'
                            : daysUntil === 1
                            ? 'Due Tomorrow'
                            : `In ${daysUntil} days`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overdue Collections */}
      {summary?.overdue && summary.overdue.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-red-400">Overdue Collections</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-lime-400/20">
              <thead>
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Borrower
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Amount
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">
                    Due Date
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Overdue By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lime-400/10">
                {summary.overdue.map((collection) => {
                  const daysOverdue = Math.abs(getDaysUntilDue(collection.dueDate));
                  const loan = getLoanById(collection.borrowerId, collection.loanId);
                  const amount = loan ? calculateInterest(loan) : 0;
                  const allLoans = getAllLoans(collection.borrowerId);
                  const loanIndex = loan ? allLoans.findIndex(l => l._id === loan._id) : -1;

                  return (
                    <tr key={collection._id} className="hover:bg-white/5">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="min-w-max">
                          <div className="font-medium text-sm text-white">{collection.borrowerId.borrowerName}</div>
                          {allLoans.length > 1 && loanIndex >= 0 && (
                            <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-0.5 rounded">
                              Loan #{loanIndex + 1}
                            </span>
                          )}
                          {/* Show due date on mobile */}
                          <div className="sm:hidden text-xs text-gray-400 mt-1">
                            {formatDate(collection.dueDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                        {formatDate(collection.dueDate)}
                      </td>
                      <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                        <span className="badge-overdue text-xs">
                          {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {summary?.totalBorrowers === 0 && (
        <div className="card text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">No borrowers yet</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by adding your first borrower.</p>
          <div className="mt-6">
            <Link to="/borrowers/new" className="btn-primary">
              + Add Borrower
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
