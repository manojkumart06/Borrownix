import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatCurrency, formatDate, calculateInterest, formatDueStatus } from '../utils/helpers';
import MarkCollectionModal from '../components/MarkCollectionModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function BorrowersList() {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [expandedBorrowers, setExpandedBorrowers] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [borrowerToDelete, setBorrowerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      const response = await api.get('/borrowers');
      if (response.data.success) {
        setBorrowers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load borrowers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, name) => {
    setBorrowerToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!borrowerToDelete) return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/borrowers/${borrowerToDelete.id}`);
      if (response.data.success) {
        toast.success('Borrower deleted successfully');
        setShowDeleteModal(false);
        setBorrowerToDelete(null);
        fetchBorrowers();
      }
    } catch (error) {
      toast.error('Failed to delete borrower');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkCollection = (borrower) => {
    setSelectedBorrower(borrower);
    setShowMarkModal(true);
  };

  const handleCollectionMarked = () => {
    setShowMarkModal(false);
    setSelectedBorrower(null);
    fetchBorrowers();
  };

  const toggleExpanded = (borrowerId) => {
    setExpandedBorrowers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(borrowerId)) {
        newSet.delete(borrowerId);
      } else {
        newSet.add(borrowerId);
      }
      return newSet;
    });
  };

  // Helper function to get all loans for a borrower (legacy + new loans array)
  const getAllLoans = (borrower) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading borrowers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Borrowers</h1>
          <p className="text-sm sm:text-base text-gray-300 mt-1">Manage your borrowers and track payments</p>
        </div>
        <Link to="/borrowers/new" className="btn-primary whitespace-nowrap text-sm sm:text-base">
          + Add New Borrower
        </Link>
      </div>

      {/* Borrowers Table */}
      {borrowers.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-lime-400/20">
              <thead className="bg-slate-700/30">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Interest
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                    Date Provided
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Next Due
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-lime-400/10">
                {borrowers.map((borrower) => {
                  const borrowerId = borrower._id.slice(-6).toUpperCase();
                  const allLoans = getAllLoans(borrower);
                  const hasMultipleLoans = allLoans.length > 1;
                  const isExpanded = expandedBorrowers.has(borrower._id);

                  // Calculate total principal across all loans
                  const totalPrincipal = allLoans.reduce((sum, loan) => sum + loan.principalAmount, 0);

                  return (
                    <>
                      {/* Main Borrower Row */}
                      <tr key={borrower._id} className="hover:bg-white/5">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400 hidden md:table-cell">
                          {borrowerId}
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-white">
                                {borrower.borrowerName}
                              </div>
                              {hasMultipleLoans && (
                                <button
                                  onClick={() => toggleExpanded(borrower._id)}
                                  className="text-xs bg-lime-400/20 text-lime-400 px-2 py-1 rounded-full hover:bg-lime-400/30 whitespace-nowrap"
                                >
                                  {allLoans.length} loans {isExpanded ? '▼' : '▶'}
                                </button>
                              )}
                            </div>
                            {/* Show status and next due on mobile */}
                            <div className="sm:hidden flex items-center gap-2 text-xs">
                              {borrower.nextDueDate && (
                                <>
                                  <span className="text-gray-400">{formatDate(borrower.nextDueDate)}</span>
                                  <span
                                    className={
                                      formatDueStatus(borrower.nextDueDate, borrower.nextDueStatus) ===
                                      'Overdue'
                                        ? 'badge-overdue'
                                        : 'badge-pending'
                                    }
                                  >
                                    {formatDueStatus(borrower.nextDueDate, borrower.nextDueStatus)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {hasMultipleLoans ? (
                            <div>
                              <div className="font-medium">{formatCurrency(totalPrincipal)}</div>
                              <div className="text-xs text-gray-500">Total</div>
                            </div>
                          ) : (
                            formatCurrency(allLoans[0]?.principalAmount || 0)
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden lg:table-cell">
                          {hasMultipleLoans ? (
                            <span className="text-xs text-gray-400">Multiple</span>
                          ) : allLoans[0]?.interestIsPercent ? (
                            <span>
                              {allLoans[0].interestAmount}%
                              <span className="text-xs text-gray-400 block">
                                ({formatCurrency(calculateInterest(allLoans[0]))})
                              </span>
                            </span>
                          ) : (
                            formatCurrency(allLoans[0]?.interestAmount || 0)
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden xl:table-cell">
                          {hasMultipleLoans ? (
                            <span className="text-xs text-gray-400">Multiple</span>
                          ) : (
                            formatDate(allLoans[0]?.dateProvided)
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                          {borrower.nextDueDate ? formatDate(borrower.nextDueDate) : 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          {borrower.nextDueDate && (
                            <span
                              className={`text-xs ${
                                formatDueStatus(borrower.nextDueDate, borrower.nextDueStatus) ===
                                'Overdue'
                                  ? 'badge-overdue'
                                  : formatDueStatus(
                                      borrower.nextDueDate,
                                      borrower.nextDueStatus
                                    ) === 'Due Today' ||
                                    formatDueStatus(
                                      borrower.nextDueDate,
                                      borrower.nextDueStatus
                                    ) === 'Due Soon'
                                  ? 'badge-pending'
                                  : 'badge-pending'
                              }`}
                            >
                              {formatDueStatus(borrower.nextDueDate, borrower.nextDueStatus)}
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium">
                          <div className="flex flex-col items-start sm:flex-row sm:justify-end sm:items-center gap-3">
                            <button
                              onClick={() => handleMarkCollection(borrower)}
                              className="group relative text-green-600 hover:text-green-400 transition-colors"
                              title="Mark Collection"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Mark Collection
                              </span>
                            </button>
                            <Link
                              to={`/borrowers/${borrower._id}`}
                              className="group relative text-lime-400 hover:text-lime-300 transition-colors"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                View Details
                              </span>
                            </Link>
                            <Link
                              to={`/borrowers/${borrower._id}/collections`}
                              className="group relative text-blue-400 hover:text-blue-300 transition-colors"
                              title="View Collections"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                View Collections
                              </span>
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(borrower._id, borrower.borrowerName)}
                              className="group relative text-red-500 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Delete Borrower
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Loans Details */}
                      {hasMultipleLoans && isExpanded && allLoans.map((loan, index) => {
                        const loanInterest = calculateInterest(loan);
                        return (
                          <tr key={`${borrower._id}-loan-${index}`} className="bg-slate-800/50">
                            <td className="px-3 sm:px-6 py-2 hidden md:table-cell"></td>
                            <td className="px-3 sm:px-6 py-2 sm:pl-12">
                              <div className="text-xs text-gray-300">
                                Loan #{index + 1}
                                {loan.notes && <span className="ml-2 italic">({loan.notes})</span>}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 text-sm text-gray-300">
                              {formatCurrency(loan.principalAmount)}
                            </td>
                            <td className="px-3 sm:px-6 py-2 text-sm text-gray-300 hidden lg:table-cell">
                              {loan.interestIsPercent ? (
                                <span>
                                  {loan.interestAmount}%
                                  <span className="text-xs text-gray-400 ml-1">
                                    ({formatCurrency(loanInterest)})
                                  </span>
                                </span>
                              ) : (
                                formatCurrency(loan.interestAmount)
                              )}
                            </td>
                            <td className="px-3 sm:px-6 py-2 text-sm text-gray-300 hidden xl:table-cell">
                              {formatDate(loan.dateProvided)}
                            </td>
                            <td className="px-3 sm:px-6 py-2 hidden sm:table-cell" colSpan="3"></td>
                          </tr>
                        );
                      })}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
          <h3 className="mt-2 text-sm font-medium text-white">No borrowers found</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by adding your first borrower.</p>
          <div className="mt-6">
            <Link to="/borrowers/new" className="btn-primary">
              + Add Borrower
            </Link>
          </div>
        </div>
      )}

      {/* Mark Collection Modal */}
      {showMarkModal && selectedBorrower && (
        <MarkCollectionModal
          borrower={selectedBorrower}
          onClose={() => setShowMarkModal(false)}
          onSuccess={handleCollectionMarked}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setBorrowerToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Borrower"
        message={`Are you sure you want to delete ${borrowerToDelete?.name}? This will delete all associated loans and collections. This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default BorrowersList;
