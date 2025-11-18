import { format, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return 'N/A';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calculateInterest = (borrower) => {
  if (borrower.interestIsPercent) {
    return (borrower.principalAmount * borrower.interestAmount) / 100;
  }
  return borrower.interestAmount;
};

export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return differenceInDays(due, today);
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'received':
      return 'badge-received';
    case 'pending':
      return 'badge-pending';
    case 'missed':
    case 'overdue':
      return 'badge-overdue';
    default:
      return 'badge-pending';
  }
};

export const formatDueStatus = (dueDate, status) => {
  if (status === 'received') return 'Received';

  const daysUntil = getDaysUntilDue(dueDate);

  if (daysUntil < 0) return 'Overdue';
  if (daysUntil === 0) return 'Due Today';
  if (daysUntil === 1) return 'Due Tomorrow';
  if (daysUntil <= 2) return 'Due Soon';
  return 'Pending';
};
