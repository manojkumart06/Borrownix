import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatCurrency, calculateInterest } from '../utils/helpers';

function MarkCollectionModal({ borrower, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [amountCollected, setAmountCollected] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCollections, setPendingCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    fetchPendingCollections();
  }, [borrower]);

  // Helper function to get all loans for a borrower (legacy + new loans array)
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

  const fetchPendingCollections = async () => {
    try {
      const response = await api.get(`/borrowers/${borrower._id}/collections`);
      if (response.data.success) {
        const pending = response.data.data.filter((c) => c.status === 'pending');
        setPendingCollections(pending);
        if (pending.length > 0) {
          setSelectedCollection(pending[0]._id);
          // Set default amount based on the first pending collection's loan
          const loan = getLoanById(pending[0].loanId);
          if (loan) {
            const defaultAmount = calculateInterest(loan);
            setAmountCollected(defaultAmount.toString());
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch collections');
    }
  };

  const handleCollectionChange = (collectionId) => {
    setSelectedCollection(collectionId);
    // Update default amount based on the selected collection's loan
    const collection = pendingCollections.find(c => c._id === collectionId);
    if (collection) {
      const loan = getLoanById(collection.loanId);
      if (loan) {
        const defaultAmount = calculateInterest(loan);
        setAmountCollected(defaultAmount.toString());
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCollection) {
      toast.error('No pending collections found');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/collections/${selectedCollection}/mark-collected`, {
        collectedDate: selectedDate.toISOString(),
        amountCollected: parseFloat(amountCollected),
        notes: notes
      });

      if (response.data.success) {
        toast.success('Interest marked as collected!');
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to mark collection');
    } finally {
      setLoading(false);
    }
  };

  // Get the current selected collection's loan for display
  const getCurrentCollectionLoan = () => {
    const collection = pendingCollections.find(c => c._id === selectedCollection);
    if (collection) {
      return getLoanById(collection.loanId);
    }
    return null;
  };

  const currentLoan = getCurrentCollectionLoan();
  const interestAmount = currentLoan ? calculateInterest(currentLoan) : 0;
  const allLoans = getAllLoans();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col border border-lime-400/20">
        {/* Fixed Header */}
        <div className="p-6 border-b border-lime-400/20">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">Mark Interest Collection</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-lime-400/10">
            <p className="text-sm text-gray-400">Borrower</p>
            <p className="font-semibold text-white">{borrower.borrowerName}</p>
            {allLoans.length > 1 && currentLoan && (
              <>
                <p className="text-sm text-gray-400 mt-2">Loan</p>
                <p className="font-semibold text-white">
                  Loan #{allLoans.findIndex(l => l._id === currentLoan._id) + 1} - {formatCurrency(currentLoan.principalAmount)}
                </p>
              </>
            )}
            <p className="text-sm text-gray-400 mt-2">Expected Amount</p>
            <p className="font-semibold text-lime-400">{formatCurrency(interestAmount)}</p>
          </div>

          {pendingCollections.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-300">No pending collections found for this borrower.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Select Collection Period
                </label>
                <select
                  value={selectedCollection || ''}
                  onChange={(e) => handleCollectionChange(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-lime-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
                  required
                >
                  {pendingCollections.map((collection) => {
                    const collectionLoan = getLoanById(collection.loanId);
                    const loanIndex = collectionLoan ? allLoans.findIndex(l => l._id === collectionLoan._id) : -1;
                    return (
                      <option key={collection._id} value={collection._id}>
                        Due: {new Date(collection.dueDate).toLocaleDateString('en-IN')}
                        {allLoans.length > 1 && loanIndex >= 0 ? ` (Loan #${loanIndex + 1})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

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
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Saving...' : 'Mark as Collected'}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default MarkCollectionModal;
