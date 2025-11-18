const cron = require('node-cron');
const InterestCollection = require('../models/InterestCollection');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email transporter configuration
// NOTE: Configure with your email service (SendGrid, Mailgun, Gmail, etc.)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send reminder email
const sendReminderEmail = async (user, collections, reminderType) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email configuration not set. Skipping email notification.');
      return;
    }

    const transporter = createTransporter();

    const collectionsList = collections
      .map(
        (c) =>
          `- ${c.borrowerId.borrowerName}: ₹${
            c.borrowerId.interestIsPercent
              ? (c.borrowerId.principalAmount * c.borrowerId.interestAmount) / 100
              : c.borrowerId.interestAmount
          } (Due: ${c.dueDate.toLocaleDateString()})`
      )
      .join('\n');

    const subject =
      reminderType === 'two_days'
        ? 'Reminder: Interest Collections Due in 2 Days'
        : reminderType === 'today'
        ? 'Reminder: Interest Collections Due Today'
        : 'Overdue: Interest Collections';

    const message = `
Hello ${user.name},

${
  reminderType === 'two_days'
    ? 'The following interest collections are due in 2 days:'
    : reminderType === 'today'
    ? 'The following interest collections are due today:'
    : 'The following interest collections are overdue:'
}

${collectionsList}

Please log in to your Finance Tracker to mark them as collected.

Best regards,
Finance Tracker Team
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: user.email,
      subject,
      text: message
    });

    console.log(`Reminder email sent to ${user.email} (${reminderType})`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

// Check and send reminders
const checkAndSendReminders = async () => {
  try {
    console.log('Running reminder check job...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(23, 59, 59, 999);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find collections due in 2 days
    const dueTwoDays = await InterestCollection.find({
      status: 'pending',
      dueDate: {
        $gte: twoDaysFromNow,
        $lt: new Date(twoDaysFromNow.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('borrowerId ownerId');

    // Find collections due today
    const dueToday = await InterestCollection.find({
      status: 'pending',
      dueDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('borrowerId ownerId');

    // Find overdue collections
    const overdue = await InterestCollection.find({
      status: 'pending',
      dueDate: { $lt: today }
    }).populate('borrowerId ownerId');

    // Group by owner and send reminders
    const ownerCollections = {};

    // Process two-day reminders
    dueTwoDays.forEach((c) => {
      const ownerId = c.ownerId._id.toString();
      if (!ownerCollections[ownerId]) {
        ownerCollections[ownerId] = {
          user: c.ownerId,
          twoDays: [],
          today: [],
          overdue: []
        };
      }
      ownerCollections[ownerId].twoDays.push(c);
    });

    // Process today reminders
    dueToday.forEach((c) => {
      const ownerId = c.ownerId._id.toString();
      if (!ownerCollections[ownerId]) {
        ownerCollections[ownerId] = {
          user: c.ownerId,
          twoDays: [],
          today: [],
          overdue: []
        };
      }
      ownerCollections[ownerId].today.push(c);
    });

    // Process overdue reminders
    overdue.forEach((c) => {
      const ownerId = c.ownerId._id.toString();
      if (!ownerCollections[ownerId]) {
        ownerCollections[ownerId] = {
          user: c.ownerId,
          twoDays: [],
          today: [],
          overdue: []
        };
      }
      ownerCollections[ownerId].overdue.push(c);
    });

    // Send emails
    for (const ownerId in ownerCollections) {
      const { user, twoDays, today, overdue } = ownerCollections[ownerId];

      if (twoDays.length > 0) {
        await sendReminderEmail(user, twoDays, 'two_days');
      }

      if (today.length > 0) {
        await sendReminderEmail(user, today, 'today');
      }

      if (overdue.length > 0) {
        await sendReminderEmail(user, overdue, 'overdue');
      }
    }

    console.log('Reminder check completed.');
  } catch (error) {
    console.error('Error in reminder job:', error);
  }
};

// Schedule job to run daily at 9:00 AM
const startReminderJob = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', checkAndSendReminders, {
    timezone: 'Asia/Kolkata' // Change to your timezone
  });

  console.log('Reminder job scheduled to run daily at 9:00 AM');
};

module.exports = {
  startReminderJob,
  checkAndSendReminders // Export for manual testing
};
