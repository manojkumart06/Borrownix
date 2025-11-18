import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatCurrency, formatDate, calculateInterest } from '../utils/helpers';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function BorrowerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [borrower, setBorrower] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBorrowerData();
  }, [id]);

  const fetchBorrowerData = async () => {
    try {
      const response = await api.get(`/borrowers/${id}`);
      if (response.data.success) {
        setBorrower(response.data.data);
        setNewName(response.data.data.borrowerName);
      }
    } catch (error) {
      toast.error('Failed to load borrower data');
      navigate('/borrowers');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error('Borrower name cannot be empty');
      return;
    }

    try {
      const response = await api.put(`/borrowers/${id}`, {
        borrowerName: newName.trim()
      });

      if (response.data.success) {
        toast.success('Borrower name updated successfully');
        setBorrower(prev => ({ ...prev, borrowerName: newName.trim() }));
        setIsEditingName(false);
      }
    } catch (error) {
      toast.error('Failed to update borrower name');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await api.delete(`/borrowers/${id}`);
      if (response.data.success) {
        toast.success('Borrower deleted successfully');
        navigate('/borrowers');
      }
    } catch (error) {
      toast.error('Failed to delete borrower');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getAllLoans = () => {
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
        status: 'active',
        isLegacy: true
      });
    }

    // Add loans from loans array
    if (borrower.loans && borrower.loans.length > 0) {
      loans.push(...borrower.loans.map(loan => ({ ...loan, isLegacy: false })));
    }

    return loans;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading borrower details...</p>
        </div>
      </div>
    );
  }

  if (!borrower) {
    return null;
  }

  const allLoans = getAllLoans();
  const totalPrincipal = allLoans.reduce((sum, loan) => sum + loan.principalAmount, 0);
  const totalInterest = allLoans.reduce((sum, loan) => sum + calculateInterest(loan), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/borrowers" className="text-lime-400 hover:text-lime-300 text-sm">
          ← Back to Borrowers
        </Link>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-2xl sm:text-3xl font-bold text-white border-b-2 border-lime-400 focus:outline-none bg-transparent w-full sm:w-auto placeholder-gray-400"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateName}
                    className="btn-primary text-sm flex-1 sm:flex-none"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(borrower.borrowerName);
                    }}
                    className="btn-secondary text-sm flex-1 sm:flex-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{borrower.borrowerName}</h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="group relative text-lime-400 hover:text-lime-300 transition-colors self-start"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Edit Name
                  </span>
                </button>
              </div>
            )}
            <p className="text-sm sm:text-base text-gray-300 mt-1">
              {allLoans.length} loan{allLoans.length !== 1 ? 's' : ''} • Total Principal: {formatCurrency(totalPrincipal)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Link to={`/borrowers/${id}/collections`} className="btn-primary text-sm sm:text-base text-center w-full sm:w-auto">
              View All Collections
            </Link>
            <button
              onClick={handleDeleteClick}
              className="group relative text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Delete Borrower
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs sm:text-sm text-gray-400">Total Principal</div>
          <div className="text-xl sm:text-2xl font-bold text-lime-400 mt-1">
            {formatCurrency(totalPrincipal)}
          </div>
        </div>
        <div className="card">
          <div className="text-xs sm:text-sm text-gray-400">Monthly Interest</div>
          <div className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(totalInterest)}
          </div>
        </div>
        <div className="card sm:col-span-2 md:col-span-1">
          <div className="text-xs sm:text-sm text-gray-400">Active Loans</div>
          <div className="text-xl sm:text-2xl font-bold text-primary-600 mt-1">
            {allLoans.filter(loan => loan.status === 'active').length}
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">All Loans</h2>
          <Link
            to="/borrowers/new"
            state={{ defaultName: borrower.borrowerName }}
            className="text-lime-400 hover:text-lime-300 text-sm font-medium self-start sm:self-auto"
          >
            + Add New Loan
          </Link>
        </div>

        <div className="space-y-4">
          {allLoans.map((loan, index) => {
            const monthlyInterest = calculateInterest(loan);
            return (
              <div
                key={loan._id || index}
                className="border border-lime-400/20 rounded-lg p-4 hover:border-lime-400/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-semibold text-white">
                        Loan #{index + 1}
                      </h3>
                      {loan.isLegacy && (
                        <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-1 rounded">
                          Original
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          loan.status === 'active'
                            ? 'bg-green-400/20 text-green-400'
                            : loan.status === 'paid_off'
                            ? 'bg-blue-400/20 text-blue-400'
                            : 'bg-red-400/20 text-red-400'
                        }`}
                      >
                        {loan.status === 'active' ? 'Active' : loan.status === 'paid_off' ? 'Paid Off' : 'Written Off'}
                      </span>
                    </div>
                    {loan.notes && (
                      <p className="text-xs sm:text-sm text-gray-400 mt-1 italic">{loan.notes}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase">Principal</div>
                    <div className="text-sm sm:text-lg font-semibold text-white mt-1">
                      {formatCurrency(loan.principalAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">Interest</div>
                    <div className="text-sm sm:text-lg font-semibold text-white mt-1">
                      {loan.interestIsPercent ? (
                        <span>
                          {loan.interestAmount}%
                          <span className="text-xs text-gray-400 block sm:inline sm:ml-1">
                            ({formatCurrency(monthlyInterest)}/mo)
                          </span>
                        </span>
                      ) : (
                        formatCurrency(loan.interestAmount)
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">Date Provided</div>
                    <div className="text-sm sm:text-lg font-semibold text-white mt-1">
                      {formatDate(loan.dateProvided)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase">Monthly Interest</div>
                    <div className="text-sm sm:text-lg font-semibold text-green-400 mt-1">
                      {formatCurrency(monthlyInterest)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Borrower"
        message={`Are you sure you want to delete ${borrower?.borrowerName}? This will delete all associated loans and collections. This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default BorrowerDetail;
