console.log('Testing module availability...');

try {
  const mongoose = require('mongoose');
  console.log('✅ mongoose available');
} catch (error) {
  console.log('❌ mongoose not available:', error.message);
}

try {
  const socketio = require('socket.io');
  console.log('✅ socket.io available');
} catch (error) {
  console.log('❌ socket.io not available:', error.message);
}

try {
  const cloudinary = require('cloudinary');
  console.log('✅ cloudinary available');
} catch (error) {
  console.log('❌ cloudinary not available:', error.message);
}

try {
  const multipart = require('@fastify/multipart');
  console.log('✅ @fastify/multipart available');
} catch (error) {
  console.log('❌ @fastify/multipart not available:', error.message);
}

console.log('Module test completed.');
