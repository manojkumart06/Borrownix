import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import { formatCurrency, formatDate, calculateInterest, getStatusColor } from '../utils/helpers';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function CollectionsView() {
  const { id } = useParams();
  const [borrower, setBorrower] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMarkCollectionModal, setShowMarkCollectionModal] = useState(false);
  const [collectionToMark, setCollectionToMark] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [amountCollected, setAmountCollected] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedLoan, setSelectedLoan] = useState('all');
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [collectionToRevert, setCollectionToRevert] = useState(null);
  const [isReverting, setIsReverting] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [borrowerRes, collectionsRes] = await Promise.all([
        api.get(`/borrowers/${id}`),
        api.get(`/borrowers/${id}/collections`)
      ]);

      if (borrowerRes.data.success) {
        setBorrower(borrowerRes.data.data);
      }

      if (collectionsRes.data.success) {
        setCollections(collectionsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get all loans for a borrower (legacy + new loans array)
  const getAllLoans = () => {
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
  const getLoanById = (loanId) => {
    const loans = getAllLoans();
    if (!loanId) {
      // Legacy collection without loanId - use first loan
      return loans[0] || null;
    }
    return loans.find(loan => loan._id && loan._id.toString() === loanId.toString()) || null;
  };

  // Filter collections by selected loan
  const getFilteredCollections = () => {
    if (selectedLoan === 'all') return collections;
    if (selectedLoan === 'legacy') {
      // Show collections without loanId
      return collections.filter(c => !c.loanId);
    }

    // Check if this is the first loan and there's no legacy loan
    const allLoans = getAllLoans();
    const hasLegacyLoan = borrower && borrower.principalAmount && borrower.dateProvided;
    const isFirstLoan = allLoans.length > 0 && allLoans[0]._id.toString() === selectedLoan;

    // If selecting the first loan and there's no legacy loan,
    // include orphaned collections (null loanId) with this loan's collections
    if (!hasLegacyLoan && isFirstLoan) {
      return collections.filter(c =>
        !c.loanId || (c.loanId && c.loanId.toString() === selectedLoan)
      );
    }

    return collections.filter(c => c.loanId && c.loanId.toString() === selectedLoan);
  };

  const handleStartMarkCollection = (collection) => {
    setCollectionToMark(collection);
    // Set default amount based on the loan this collection belongs to
    const loan = getLoanById(collection.loanId);
    if (loan) {
      const defaultAmount = calculateInterest(loan);
      setAmountCollected(defaultAmount.toString());
    }
    setSelectedDate(new Date());
    setNotes('');
    setShowMarkCollectionModal(true);
  };

  const handleMarkCollected = async () => {
    if (!collectionToMark) return;

    setIsMarking(true);
    try {
      const response = await api.put(`/collections/${collectionToMark._id}/mark-collected`, {
        collectedDate: selectedDate.toISOString(),
        amountCollected: parseFloat(amountCollected),
        notes: notes
      });

      if (response.data.success) {
        toast.success('Collection marked as received!');
        setShowMarkCollectionModal(false);
        setCollectionToMark(null);
        setNotes('');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to mark collection');
    } finally {
      setIsMarking(false);
    }
  };

  const handleMarkPendingClick = (collectionId) => {
    setCollectionToRevert(collectionId);
    setShowRevertModal(true);
  };

  const handleMarkPendingConfirm = async () => {
    if (!collectionToRevert) return;

    setIsReverting(true);
    try {
      const response = await api.put(`/collections/${collectionToRevert}/mark-pending`);

      if (response.data.success) {
        toast.success('Collection marked as pending');
        setShowRevertModal(false);
        setCollectionToRevert(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update collection');
    } finally {
      setIsReverting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading collections...</p>
        </div>
      </div>
    );
  }

  const allLoans = getAllLoans();
  const filteredCollections = getFilteredCollections();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Link to="/borrowers" className="text-lime-400 hover:text-lime-300 text-sm">
              ← Back to Borrowers
            </Link>
            <h1 className="text-3xl font-bold text-white mt-2">Interest Collections</h1>
            {borrower && (
              <p className="text-gray-300 mt-1">{borrower.borrowerName}</p>
            )}
          </div>
          {borrower && (
            <Link
              to={`/borrowers/${id}`}
              className="btn-secondary"
            >
              View All Loans
            </Link>
          )}
        </div>

        {/* Loan Filter */}
        {allLoans.length > 1 && (
          <div className="mt-4 card">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Filter by Loan
            </label>
            <select
              value={selectedLoan}
              onChange={(e) => setSelectedLoan(e.target.value)}
              className="input-field"
            >
              <option value="all">All Loans ({collections.length} collections)</option>
              {allLoans.map((loan, index) => {
                const hasLegacyLoan = borrower && borrower.principalAmount && borrower.dateProvided;
                const isFirstLoan = index === 0;

                // Count collections for this loan
                let count;
                if (loan._id === 'legacy') {
                  // Legacy loan: count collections with null loanId
                  count = collections.filter(c => !c.loanId).length;
                } else if (!hasLegacyLoan && isFirstLoan) {
                  // First loan without legacy: include orphaned collections
                  count = collections.filter(c =>
                    !c.loanId || (c.loanId?.toString() === loan._id.toString())
                  ).length;
                } else {
                  // Regular loan: only count collections with matching loanId
                  count = collections.filter(c =>
                    c.loanId?.toString() === loan._id.toString()
                  ).length;
                }

                return (
                  <option key={loan._id} value={loan._id.toString()}>
                    Loan #{index + 1} - {formatCurrency(loan.principalAmount)}
                    {' '}({count} collections)
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Loan Summary for selected loan */}
        {selectedLoan !== 'all' && allLoans.length > 0 && (
          <div className="mt-4 card bg-slate-700/40">
            {(() => {
              const loan = selectedLoan === 'legacy'
                ? allLoans.find(l => l._id === 'legacy')
                : allLoans.find(l => l._id?.toString() === selectedLoan);

              if (!loan) return null;

              const loanInterest = calculateInterest(loan);
              const loanIndex = allLoans.findIndex(l => l._id === loan._id);

              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Loan</p>
                    <p className="font-semibold text-white">Loan #{loanIndex + 1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Principal</p>
                    <p className="font-semibold text-white">
                      {formatCurrency(loan.principalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Monthly Interest</p>
                    <p className="font-semibold text-white">
                      {loan.interestIsPercent
                        ? `${loan.interestAmount}% (${formatCurrency(loanInterest)})`
                        : formatCurrency(loan.interestAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date Provided</p>
                    <p className="font-semibold text-white">{formatDate(loan.dateProvided)}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Collections Table */}
      {filteredCollections.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-lime-400/20">
              <thead className="bg-slate-700/30">
                <tr>
                  {allLoans.length > 1 && selectedLoan === 'all' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                      Loan
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Expected Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Collected Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Amount Collected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-lime-400/10">
                {filteredCollections.map((collection) => {
                  const loan = getLoanById(collection.loanId);
                  const expectedAmount = loan ? calculateInterest(loan) : 0;
                  const loanIndex = allLoans.findIndex(l => l._id === loan?._id);

                  return (
                    <tr key={collection._id} className="hover:bg-white/5">
                      {allLoans.length > 1 && selectedLoan === 'all' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            Loan #{loanIndex >= 0 ? loanIndex + 1 : '?'}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(collection.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatCurrency(expectedAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusColor(collection.status)}>
                          {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {collection.collectedDate ? formatDate(collection.collectedDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {collection.amountCollected > 0
                          ? formatCurrency(collection.amountCollected)
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {collection.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {collection.status === 'pending' ? (
                          <button
                            onClick={() => handleStartMarkCollection(collection)}
                            className="text-green-600 hover:text-green-400 transition-colors"
                          >
                            Mark Collected
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPendingClick(collection._id)}
                            className="text-yellow-500 hover:text-yellow-400 transition-colors"
                          >
                            Mark Pending
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-300">No collections found{selectedLoan !== 'all' ? ' for this loan' : ''}.</p>
        </div>
      )}

      {/* Mark Collection Modal */}
      {showMarkCollectionModal && collectionToMark && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col border border-lime-400/20">
            {/* Fixed Header */}
            <div className="p-6 border-b border-lime-400/20">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">Mark Collection as Received</h3>
                <button
                  onClick={() => {
                    setShowMarkCollectionModal(false);
                    setCollectionToMark(null);
                  }}
                  className="text-gray-400 hover:text-gray-200"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-lime-400/10">
                <p className="text-sm text-gray-400">Due Date</p>
                <p className="font-semibold text-white">{formatDate(collectionToMark.dueDate)}</p>
                <p className="text-sm text-gray-400 mt-2">Expected Amount</p>
                <p className="font-semibold text-lime-400">
                  {formatCurrency(getLoanById(collectionToMark.loanId) ? calculateInterest(getLoanById(collectionToMark.loanId)) : 0)}
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleMarkCollected(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Collection Date
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    className="w-full px-4 py-2 bg-slate-700 border border-lime-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Amount Collected (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountCollected}
                    onChange={(e) => setAmountCollected(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-lime-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
                    placeholder="Enter amount collected"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-700 border border-lime-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all resize-none"
                    placeholder="Add any notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={isMarking} className="btn-primary flex-1">
                    {isMarking ? 'Saving...' : 'Mark as Collected'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMarkCollectionModal(false);
                      setCollectionToMark(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Revert to Pending Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showRevertModal}
        onClose={() => {
          setShowRevertModal(false);
          setCollectionToRevert(null);
        }}
        onConfirm={handleMarkPendingConfirm}
        title="Revert Collection Status"
        message="Are you sure you want to mark this collection as pending? This will remove the collected date and amount."
        confirmText="Mark Pending"
        isLoading={isReverting}
      />
    </div>
  );
}

export default CollectionsView;
