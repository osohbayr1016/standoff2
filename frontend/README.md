# E-Sport Connection Frontend

A modern, responsive web application built with Next.js 14, TypeScript, and Tailwind CSS for the E-Sport Connection platform.

## 🚀 Features

- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety and modern JavaScript features
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Responsive Design** - Mobile-first approach with beautiful UI
- **Modern UI/UX** - Glassmorphism design with gradient backgrounds
- **Authentication Pages** - Login and registration forms
- **SEO Optimized** - Built-in SEO features with Next.js
- **Performance** - Optimized for speed and user experience

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── register/
│   │       └── page.tsx          # Registration page
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Homepage/landing page
```

## 🛠️ Installation

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` file with your configuration:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

## 📱 Pages

### Homepage (`/`)

- Beautiful landing page with hero section
- Feature highlights
- Call-to-action sections
- Responsive navigation

### Login (`/auth/login`)

- User authentication form
- Social login options (Google, Twitter)
- Form validation
- Loading states

### Registration (`/auth/register`)

- User registration form
- Password confirmation
- Terms and conditions
- Form validation with error handling

## 🎨 Design System

### Colors

- **Primary**: Purple gradient (`from-purple-500 to-pink-500`)
- **Background**: Dark slate gradient (`from-slate-900 via-purple-900 to-slate-900`)
- **Text**: White and gray variations
- **Accent**: Purple and pink for highlights

### Typography

- **Headings**: Bold, large text with gradient effects
- **Body**: Clean, readable text
- **Font**: System fonts with fallbacks

### Components

- **Glassmorphism Cards**: Semi-transparent backgrounds with blur effects
- **Gradient Buttons**: Purple to pink gradients with hover effects
- **Form Inputs**: Styled with focus states and validation
- **Animations**: Smooth transitions and hover effects

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🛡️ Features

### Authentication

- Form validation
- Loading states
- Error handling
- Social login integration (ready for implementation)

### Responsive Design

- Mobile-first approach
- Tablet and desktop optimizations
- Flexible grid layouts
- Touch-friendly interactions

### Performance

- Next.js Image optimization
- Code splitting
- Lazy loading
- Optimized fonts and assets

## 🎯 Custom Animations

### Blob Animation

- Floating background elements
- Smooth color transitions
- Staggered animation delays

### Hover Effects

- Scale transformations
- Color transitions
- Focus states

### Loading States

- Spinner animations
- Button state changes
- Form submission feedback

## 🔗 API Integration

The frontend is designed to integrate with the Express.js backend API:

- **Base URL**: `http://localhost:5001/api/v1`
- **Authentication**: JWT token-based
- **Endpoints**: User registration, login, profile management

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms

- **Netlify**: Configure build settings
- **AWS Amplify**: Connect repository and deploy
- **Docker**: Build and deploy containers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🎮 E-Sport Connection

This frontend is part of the E-Sport Connection platform, designed to help gamers:

- Connect with other players
- Form competitive teams
- Join tournaments
- Track performance statistics
- Build gaming communities

The platform provides a modern, intuitive interface for the gaming community to thrive and compete at the highest levels.
