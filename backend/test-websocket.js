// test-websocket-enhanced.js
const io = require('socket.io-client');

// Get token from your login response
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MTg2ZjU3ZC1kNjFjLTQ2YTktOTdmNy1hOTlhZTc5ODZjOWIiLCJlbWFpbCI6ImRyLnNhcmFoQG9ydGhvLmZyIiwicm9sZSI6Im9ydGhvcGhvbmlzdGUiLCJpYXQiOjE3ODUyNjMxNTgsImV4cCI6MTc4NTI2NDA1OH0.w7h_R7il39HNaLVF0H542capOHFCcSmu-quYzdP_rN0';

const socket = io('http://localhost:3000/notifications', {
  auth: { token }
});

console.log('🔌 Connecting to WebSocket...');

socket.on('connect', () => {
  console.log('✅ Connected! Socket ID:', socket.id);
  console.log('📊 Getting unread count...');
  socket.emit('get-unread-count');
});

socket.on('unread-count', (data) => {
  console.log('📊 Unread count:', data.count);
});

socket.on('new-notification', (data) => {
  console.log('\n📨 NEW NOTIFICATION:');
  console.log('─────────────────────────────');
  console.log('📌 Title:', data.title);
  console.log('📝 Message:', data.message);
  console.log('🏷️  Type:', data.type);
  console.log('🔗 Action:', data.actionUrl || 'None');
  console.log('🕐 Time:', data.timeAgo);
  console.log('─────────────────────────────\n');
});

socket.on('notification-updated', (data) => {
  console.log('✏️ Notification updated:', data);
});

socket.on('all-notifications-read', () => {
  console.log('✅ All notifications marked as read!');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection Error:', error.message);
});

// Keep the script running
console.log('\n📡 Listening for notifications... Press Ctrl+C to exit\n');