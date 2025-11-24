// Firebase Cloud Functions for Push Notifications
// Compatible with firebase-functions v4+
// Deploy with: firebase deploy --only functions

const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

// Send notification when a new comment is added
exports.onCommentAdded = onDocumentUpdated('dates/{dateId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  const dateId = event.params.dateId;

  // Check if a new comment was added
  const beforeComments = before.comments || [];
  const afterComments = after.comments || [];

  if (afterComments.length > beforeComments.length) {
    const newComment = afterComments[afterComments.length - 1];
    const commenter = newComment.author;
    const recipient = commenter === 'simran' ? 'ayaan' : 'simran';

    console.log(`New comment by ${commenter} on date ${dateId}`);

    // Get recipient's FCM token
    const tokensSnapshot = await db.collection('fcmTokens')
      .where('user', '==', recipient)
      .get();

    if (tokensSnapshot.empty) {
      console.log(`No FCM token found for ${recipient}`);
      return null;
    }

    // Send notification to all recipient's devices
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    
    const message = {
      notification: {
        title: 'New Comment 💬',
        body: `${commenter === 'simran' ? 'Simran' : 'Ayaan'} commented on "${after.title}"`,
      },
      data: {
        type: 'comment',
        dateId: dateId,
        timestamp: newComment.timestamp
      },
      tokens: tokens
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log('Successfully sent comment notification:', response.successCount, 'messages sent');
      
      // Log any failures
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error sending comment notification:', error);
      return null;
    }
  }

  // Check if a new voice note was added
  const beforeVoiceNotes = before.voiceNotes || [];
  const afterVoiceNotes = after.voiceNotes || [];

  if (afterVoiceNotes.length > beforeVoiceNotes.length) {
    const newVoiceNote = afterVoiceNotes[afterVoiceNotes.length - 1];
    const uploader = newVoiceNote.uploadedBy;
    const recipient = uploader === 'simran' ? 'ayaan' : 'simran';

    console.log(`New voice note by ${uploader} on date ${dateId}`);

    // Get recipient's FCM token
    const tokensSnapshot = await db.collection('fcmTokens')
      .where('user', '==', recipient)
      .get();

    if (tokensSnapshot.empty) {
      console.log(`No FCM token found for ${recipient}`);
      return null;
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    
    const message = {
      notification: {
        title: 'New Voice Note 🎤',
        body: `${uploader === 'simran' ? 'Simran' : 'Ayaan'} sent a voice note for "${after.title}"`,
      },
      data: {
        type: 'voicenote',
        dateId: dateId,
        timestamp: newVoiceNote.timestamp
      },
      tokens: tokens
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log('Successfully sent voice note notification:', response.successCount, 'messages sent');
      
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error sending voice note notification:', error);
      return null;
    }
  }

  return null;
});

// Send notification when a new invitation is created
exports.onInvitationCreated = onDocumentCreated('invitations/{invitationId}', async (event) => {
  const invitation = event.data.data();
  const recipient = invitation.to;
  const sender = invitation.from;
  const invitationId = event.params.invitationId;

  console.log(`New invitation from ${sender} to ${recipient}`);

  // Get recipient's FCM token
  const tokensSnapshot = await db.collection('fcmTokens')
    .where('user', '==', recipient)
    .get();

  if (tokensSnapshot.empty) {
    console.log(`No FCM token found for ${recipient}`);
    return null;
  }

  const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
  
  const message = {
    notification: {
      title: 'Date Invitation! 💕',
      body: `${sender === 'simran' ? 'Simran' : 'Ayaan'} invited you to "${invitation.title}"`,
    },
    data: {
      type: 'invitation',
      invitationId: invitationId,
      timestamp: invitation.createdAt
    },
    tokens: tokens
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    console.log('Successfully sent invitation notification:', response.successCount, 'messages sent');
    
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
        }
      });
    }
    
    return response;
  } catch (error) {
    console.error('Error sending invitation notification:', error);
    return null;
  }
});

// Scheduled function to check for upcoming dates (runs every hour)
exports.checkUpcomingDates = onSchedule('every 1 hours', async (event) => {
  console.log('Checking for upcoming dates...');

  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Get all dates
  const datesSnapshot = await db.collection('dates').get();

  const upcomingDates = [];
  datesSnapshot.forEach(doc => {
    const date = doc.data();
    const dateTime = new Date(date.date);
    
    // Check if date is within 2 hours from now
    if (dateTime > now && dateTime <= twoHoursLater) {
      upcomingDates.push({
        id: doc.id,
        ...date
      });
    }
  });

  console.log(`Found ${upcomingDates.length} upcoming dates`);

  // Send notifications for each upcoming date
  for (const date of upcomingDates) {
    // Check if we've already notified about this date
    const notificationKey = `reminder-${date.id}`;
    const notificationDoc = await db.collection('notificationsSent')
      .doc(notificationKey)
      .get();

    if (notificationDoc.exists) {
      console.log(`Already notified about date ${date.id}`);
      continue;
    }

    // Get all FCM tokens (notify both users)
    const tokensSnapshot = await db.collection('fcmTokens').get();

    if (tokensSnapshot.empty) {
      console.log('No FCM tokens found');
      continue;
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    
    const message = {
      notification: {
        title: 'Upcoming Date! 💖',
        body: `Your date "${date.title}" is in 2 hours!`,
      },
      data: {
        type: 'reminder',
        dateId: date.id,
        timestamp: new Date().toISOString()
      },
      tokens: tokens
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      console.log(`Successfully sent reminder for date ${date.id}:`, response.successCount, 'messages sent');
      
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });
      }
      
      // Mark as notified
      await db.collection('notificationsSent')
        .doc(notificationKey)
        .set({
          dateId: date.id,
          sentAt: new Date(),
          type: 'reminder'
        });
    } catch (error) {
      console.error(`Error sending reminder for date ${date.id}:`, error);
    }
  }

  return null;
});

// Clean up old notification records (runs daily)
exports.cleanupOldNotifications = onSchedule('every 24 hours', async (event) => {
  console.log('Cleaning up old notification records...');

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const snapshot = await db.collection('notificationsSent')
    .where('sentAt', '<', oneWeekAgo)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Deleted ${snapshot.size} old notification records`);

  return null;
});