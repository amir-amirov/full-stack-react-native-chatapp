
# React Native Firebase Chat App

This is a **full-stack React Native chat application** that integrates with a web-based chat app through a shared **Firebase database**, allowing real-time communication between mobile and web platforms. The app is built using **React Native CLI**, **Redux Toolkit**, and **Firebase services** (Authentication, Firestore, and Storage) to provide a seamless, real-time chat experience with additional features such as image messaging, user profiles, and notifications.

## Features

- **User Authentication**: Secure login/signup using Firebase Authentication.
- **Real-time Messaging**: Chat functionality powered by Firestore with real-time updates using `onSnapshot`.
- **Image Messaging**: Allows users to send images from their gallery using `react-native-image-crop-picker` and Firebase Storage for image uploads.
- **Tab Navigation**: Easy-to-navigate interface using `react-navigation` with tabs for Profile and Chat.
  - **Profile**: View and edit user profile.
  - **Chat**: Displays a list of chats and a chatbox for active conversations.
- **Notifications**: Notifications for user's actions using `react-native-simple-toast`.
- **Redux Toolkit**: State management for handling user data, chat interactions, and messages.
- **Real-time Message Status**: Messages are timestamped and feature a "like" option, with unread message status tracking.
- **Iconography**: Icons from `react-native-vector-icons/Ionicons` to enhance the UI.
- **TypeScript**: Ensures type safety throughout the application.

## Key Libraries and Technologies

- **Firebase**:  
  - Authentication: For user signup/login.
  - Firestore: Real-time database to store chat messages.
  - Storage: For storing user-uploaded images.
  
- **Redux Toolkit**: Manages global state, including the current user, chat user, and chat messages.
  
- **React Navigation**: Manages navigation within the app, with stack and tab-based navigation for a clean user experience.
  
- **Image Crop Picker**: Used to pick and crop images from the user's gallery before sending them as messages.
  
- **React Native Vector Icons**: Provides a range of customizable icons to enhance the app's UI.

## Project Structure

The app is divided into different components:

- **Profile Screen**: Allows users to view and edit their profile. It includes stack navigation for moving between the profile overview and the edit profile page.
  
- **Chat Screen**: Displays a list of chats, allowing users to enter a chatbox to send messages. Each chat displays the last message and updates in real-time using `onSnapshot`.
  
- **ChatList Component**:  

  - Shows chat list of users you are chatting with
  - Allows users to find friends by username and start chatting
  - Real-time chatlist updates sorted by the most recent
  - In the chat list, each chat shows friend's avatar, name and last message
  - If last message is unseen, it's highlighted and avatar is bordered

- **Chatbox Component**:  
  - Handles message sending (both text and images) and updates chat status in real time.
  - Shows interactive icons for messages with a "like" feature.
  - Allows users to attach images from their gallery, which are uploaded to Firebase Storage and displayed in the chat.
  - Real-time status updates for "seen" and "unseen" messages.

In the **ChatBox** component, we handle sending both text and image messages, update chat status in real-time, and allow users to like/unlike messages. 

Key features in `ChatBox`:

1. **Real-time Message Updates**: Messages are fetched and updated in real-time from Firestore using `onSnapshot`. This ensures that all users in the chat receive new messages immediately.

2. **Image Uploads**: Users can select images from their gallery, which are cropped and uploaded to Firebase Storage. The image URL is then sent as part of the chat message.

3. **Like/Unlike Messages**: Messages can be liked, with the status updated in Firestore and reflected in the UI.


## Firebase Firestore Database Design
The NoSQL database is structured for scalability and efficient querying. It includes the following collections:

1. **Users Collection**: Stores user profiles with fields such as `id`, `username`,`email`,`name`, `bio`, and `avatar`.
2. **Chats Collection**: Each document identified by user id and contains chatsData array of chats for each user. chatsData is an array of objects. Each object has information about chat like the `messageId`, `rid` (receiver ID), `lastMessage`, and `updatedAt` timestamp.
3. **Messages Collection**: Stores the chat messages for each conversation. Each document is identified by uniques `messageId` and contains messages which is an array of objects. Each object has information of a message: `sId` (sender ID), `text` (message content), and `createdAt` timestamp.


## Installation and Setup

### Prerequisites
- Node.js (v14 or later)
- React Native CLI
- Firebase Project

### Steps to Set Up the Project

1. Clone the repository:

   \`\`\`bash
   git clone https://github.com/amir-amirov/full-stack-react-native-chatapp.git
   cd full-stack-react-native-chatapp
   \`\`\`

2. Install dependencies:

   \`\`\`bash
   npm install
   \`\`\`

3. Run the app:

   \`\`\`bash
   npx react-native run-android
   \`\`\`

## Future Enhancements

- **Push Notifications**: Integrate Firebase Cloud Messaging (FCM) for better real-time notifications.
- **Message Reactions**: Add more reactions to messages besides "like".