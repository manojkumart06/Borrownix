import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../utils/api';

function BorrowerForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [duplicateBorrower, setDuplicateBorrower] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      borrowerName: '',
      principalAmount: '',
      interestAmount: '',
      interestIsPercent: false,
      dateProvided: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  const interestIsPercent = watch('interestIsPercent');
  const borrowerName = watch('borrowerName');

  useEffect(() => {
    if (isEditMode) {
      fetchBorrowerData();
    }
  }, [id]);

  // Set default borrower name if passed via location state
  useEffect(() => {
    if (location.state?.defaultName && !isEditMode) {
      setValue('borrowerName', location.state.defaultName);
    }
  }, [location.state, isEditMode, setValue]);

  // Check for duplicate borrower names as user types
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!borrowerName || borrowerName.trim().length < 2 || isEditMode) {
        setDuplicateBorrower(null);
        return;
      }

      try {
        const response = await api.get('/borrowers/check-duplicate', {
          params: { borrowerName: borrowerName.trim() }
        });

        if (response.data.success && response.data.isDuplicate) {
          setDuplicateBorrower(response.data.borrower);
        } else {
          setDuplicateBorrower(null);
        }
      } catch (error) {
        console.error('Error checking duplicates:', error);
        setDuplicateBorrower(null);
      }
    };

    const timeoutId = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timeoutId);
  }, [borrowerName, isEditMode]);

  const fetchBorrowerData = async () => {
    try {
      const response = await api.get(`/borrowers/${id}`);
      if (response.data.success) {
        const borrower = response.data.data;
        setValue('borrowerName', borrower.borrowerName);
        setValue('principalAmount', borrower.principalAmount);
        setValue('interestAmount', borrower.interestAmount);
        setValue('interestIsPercent', borrower.interestIsPercent);
        setValue('dateProvided', new Date(borrower.dateProvided).toISOString().split('T')[0]);
        setValue('notes', borrower.notes || '');
      }
    } catch (error) {
      toast.error('Failed to load borrower data');
      navigate('/borrowers');
    } finally {
      setFetchingData(false);
    }
  };

  const onSubmit = async (data) => {
    // If duplicate exists and not in edit mode, show modal
    if (duplicateBorrower && !isEditMode) {
      setPendingFormData(data);
      setShowDuplicateModal(true);
      return;
    }

    // Proceed with creating new borrower
    await createNewBorrower(data);
  };

  const createNewBorrower = async (data) => {
    setLoading(true);
    try {
      const endpoint = isEditMode ? `/borrowers/${id}` : '/borrowers';
      const method = isEditMode ? 'put' : 'post';

      const response = await api[method](endpoint, {
        ...data,
        principalAmount: parseFloat(data.principalAmount),
        interestAmount: parseFloat(data.interestAmount)
      });

      if (response.data.success) {
        toast.success(
          isEditMode ? 'Borrower updated successfully!' : 'Borrower added successfully!'
        );
        navigate('/borrowers');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoanToExisting = async () => {
    if (!pendingFormData || !duplicateBorrower) return;

    setLoading(true);
    setShowDuplicateModal(false);

    try {
      const response = await api.post(`/borrowers/${duplicateBorrower._id}/loans`, {
        principalAmount: parseFloat(pendingFormData.principalAmount),
        interestAmount: parseFloat(pendingFormData.interestAmount),
        interestIsPercent: pendingFormData.interestIsPercent,
        dateProvided: pendingFormData.dateProvided,
        notes: pendingFormData.notes || ''
      });

      if (response.data.success) {
        toast.success('New loan added to existing borrower!');
        navigate('/borrowers');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add loan. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
      setPendingFormData(null);
    }
  };

  const handleCreateSeparate = async () => {
    setShowDuplicateModal(false);
    if (pendingFormData) {
      await createNewBorrower(pendingFormData);
      setPendingFormData(null);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setPendingFormData(null);
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading borrower data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to="/borrowers" className="text-lime-400 hover:text-lime-300 text-sm">
          ← Back to Borrowers
        </Link>
        <h1 className="text-3xl font-bold text-white mt-2">
          {isEditMode ? 'Edit Borrower' : 'Add New Borrower'}
        </h1>
        <p className="text-gray-300 mt-1">
          {isEditMode ? 'Update borrower information' : 'Enter borrower details and loan information'}
        </p>
      </div>

      {/* Duplicate Warning */}
      {duplicateBorrower && !isEditMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Duplicate borrower detected!</strong> A borrower named "{duplicateBorrower.borrowerName}" already exists with {duplicateBorrower.totalLoans} loan(s). When you submit, you'll be asked if you want to add this as a new loan to the existing borrower.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Borrower Name */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Borrower Name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter borrower's name"
              {...register('borrowerName', {
                required: 'Borrower name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
            />
            {errors.borrowerName && (
              <p className="text-red-500 text-sm mt-1">{errors.borrowerName.message}</p>
            )}
          </div>

          {/* Principal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Principal Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="Enter principal amount"
              {...register('principalAmount', {
                required: 'Principal amount is required',
                min: {
                  value: 1,
                  message: 'Amount must be greater than 0'
                }
              })}
            />
            {errors.principalAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.principalAmount.message}</p>
            )}
          </div>

          {/* Interest Type Toggle */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                {...register('interestIsPercent')}
              />
              <span className="text-sm font-medium text-gray-200">
                Interest is a percentage
              </span>
            </label>
          </div>

          {/* Interest Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Interest {interestIsPercent ? 'Rate (%)' : 'Amount (₹)'} *
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder={
                interestIsPercent
                  ? 'Enter interest rate (e.g., 2.5 for 2.5%)'
                  : 'Enter monthly interest amount'
              }
              {...register('interestAmount', {
                required: 'Interest amount is required',
                min: {
                  value: 0,
                  message: 'Interest must be 0 or greater'
                }
              })}
            />
            {errors.interestAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.interestAmount.message}</p>
            )}
            {interestIsPercent && (
              <p className="text-xs text-gray-500 mt-1">
                Monthly interest will be calculated based on principal amount
              </p>
            )}
          </div>

          {/* Date Provided */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Date Finance Provided *
            </label>
            <input
              type="date"
              className="input-field"
              {...register('dateProvided', {
                required: 'Date is required'
              })}
            />
            {errors.dateProvided && (
              <p className="text-red-500 text-sm mt-1">{errors.dateProvided.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows="3"
              className="input-field"
              placeholder="Add any additional notes or comments..."
              {...register('notes')}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading
                ? isEditMode
                  ? 'Updating...'
                  : 'Adding...'
                : isEditMode
                ? 'Update Borrower'
                : 'Add Borrower'}
            </button>
            <Link to="/borrowers" className="btn-secondary flex-1 text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Duplicate Borrower Modal */}
      {showDuplicateModal && duplicateBorrower && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Duplicate Borrower Found
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    A borrower named <strong>"{duplicateBorrower.borrowerName}"</strong> already exists with <strong>{duplicateBorrower.totalLoans} loan(s)</strong>.
                  </p>
                  <p className="mt-2">What would you like to do?</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleAddLoanToExisting}
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Adding...' : 'Add as New Loan to Existing Borrower'}
              </button>

              <button
                onClick={handleCreateSeparate}
                disabled={loading}
                className="w-full btn-secondary"
              >
                Create as Separate Entry
              </button>

              <button
                onClick={handleCancelDuplicate}
                disabled={loading}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BorrowerForm;
