# Chat Feature Implementation

## Overview

The chat feature allows users to send direct messages to players from the players page. When a user clicks the "Зурвас" (Message) button on any player card, a chat modal opens where they can send and receive messages.

## Features

### Frontend Components

1. **ChatModal Component** (`frontend/src/app/components/ChatModal.tsx`)

   - Real-time chat interface
   - Message history display
   - Send/receive messages
   - Responsive design with dark mode support
   - Authentication required

2. **Players Page Integration** (`frontend/src/app/players/page.tsx`)
   - "Зурвас" button on each player card
   - Modal state management
   - Authentication check before opening chat

### Backend API

1. **Message Routes** (`backend/src/routes/messageRoutes.ts`)
   - `POST /api/messages` - Send a new message
   - `GET /api/messages/:userId` - Get conversation history
   - Authentication middleware required

## How It Works

1. **User clicks "Зурвас" button** on a player card
2. **Authentication check** - if user is not logged in, shows alert
3. **Chat modal opens** with the selected player's information
4. **Message history loads** from the backend API
5. **Real-time messaging** - users can send and receive messages
6. **Responsive design** - works on desktop and mobile

## Authentication

- Users must be logged in to use the chat feature
- JWT token is required for API calls
- User context is managed through AuthContext

## Database Schema

The chat system uses a Message model with:

- `senderId` - ID of the message sender
- `receiverId` - ID of the message recipient
- `content` - Message text content
- `status` - Message status (SENT, DELIVERED, READ)
- `createdAt` - Timestamp

## Styling

- Uses Tailwind CSS for styling
- Dark mode support
- Framer Motion for animations
- Responsive design for all screen sizes

## Error Handling

- Network error handling
- Authentication error handling
- Loading states
- Error messages displayed to users

## Future Enhancements

- Real-time notifications
- Message read receipts
- File/image sharing
- Group chat functionality
- Message search
- Message deletion
