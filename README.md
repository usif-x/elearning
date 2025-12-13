# 📚 E-Learning Platform - Frontend

A modern, full-featured e-learning platform built with Next.js 14, offering comprehensive course management, AI-powered question generation, and advanced analytics.

## ✨ Features

### 🎓 Course Management

- Browse and enroll in courses
- Track learning progress
- Access course lectures and materials
- Interactive course content delivery

### 🤖 AI-Powered Question Generation

- **Questions Forum**: Create AI-generated question sets from topics or PDF files
- **Practice Quizzes**: Test your knowledge with customizable quizzes
- Multiple question types support (multiple choice, true/false, etc.)
- Difficulty levels: Easy, Medium, Hard
- Public and private question sets
- Real-time progress tracking during question generation

### 👥 Community Features

- Discussion forums
- User posts and interactions
- Question & Answer sections
- Community engagement tracking

### 📊 Analytics & Tracking

- User activity monitoring
- Quiz performance analytics
- Course progress tracking
- Top users leaderboard (daily, weekly, monthly)
- Detailed usage history

### 👤 User Profiles

- Personal information management
- Usage statistics and charts
- Quiz results history
- Telegram integration
- Account activity overview
- Wallet management

### 🛠️ Admin Dashboard

- Platform-wide analytics
- User management with detailed profiles
- Course and content management
- Usage monitoring and statistics
- Top performers tracking
- System health overview

## 🚀 Tech Stack

### Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript/JSX
- **Styling**: Tailwind CSS
- **Icons**: Iconify React
- **Charts**: Recharts
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Markdown**: React Markdown with GFM support

### Key Libraries

- `@iconify/react` - Icon system
- `recharts` - Data visualization
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown
- `zustand` - State management
- `axios` - API requests

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/usif-x/elearning
cd frontend
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=your_backend_api_url
```

4. **Run development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5. **Build for production**

```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js app directory
│   ├── (admin)/                  # Admin routes
│   │   └── admin/
│   │       ├── dashboard/        # Admin dashboard
│   │       ├── login/            # Admin login
│   │       └── logout/           # Admin logout
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── logout/
│   ├── (commerce)/               # Course-related routes
│   │   └── courses/
│   │       ├── [id]/             # Course details
│   │       └── my/               # User's courses
│   ├── (main)/                   # Main landing page
│   ├── (user)/                   # User area routes
│   │   ├── community/            # Community forums
│   │   ├── dashboard/            # User dashboard
│   │   ├── practice-quiz/        # Practice quizzes
│   │   ├── profile/              # User profile
│   │   │   └── components/       # Profile components
│   │   └── questions-forum/      # AI question generation
│   │       ├── create/           # Create question sets
│   │       ├── [id]/             # Question set details
│   │       │   ├── add-questions/
│   │       │   ├── attempt/
│   │       │   └── participants/
│   │       └── components/
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── not-found.js              # 404 page
├── components/                    # Reusable components
│   ├── admin/                    # Admin-specific components
│   ├── layout/                   # Layout components
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── profile/                  # Profile components
│   ├── server/                   # Server components
│   │   ├── Hero.jsx
│   │   ├── AboutSection.jsx
│   │   └── SuggestRegister.jsx
│   └── ui/                       # UI components
│       ├── Alert.jsx
│       ├── Button.jsx
│       ├── CourseCard.jsx
│       ├── DarkModeSwitcher.jsx
│       ├── ErrorBoundary.jsx
│       ├── Filter.jsx
│       ├── Input.jsx
│       ├── LoadingSpinner.jsx
│       ├── MarkdownEditor.jsx
│       ├── MarkdownRender.jsx
│       ├── Select.jsx
│       └── ToastContainerWrapper.jsx
├── context/                      # React context providers
│   └── ThemeProvider.js
├── hooks/                        # Custom React hooks
│   └── useAuth.js
├── libs/                         # Utility libraries
│   ├── axios.js                  # Axios configuration
│   └── axios-server.js           # Server-side axios
├── services/                     # API service layers
│   ├── Community.js
│   ├── Courses.js
│   ├── PracticeQuiz.js
│   ├── QuestionsForum.js
│   └── QuizAnalytics.js
├── public/                       # Static assets
│   ├── fonts/
│   ├── icons/
│   └── images/
├── styles/                       # Additional styles
│   ├── darkmode.css
│   ├── font.css
│   ├── input.css
│   ├── select.css
│   └── waves.css
└── middleware.js                 # Next.js middleware
```

## 🎨 Design System

### Color Scheme

- **Primary**: Blue shades for main actions
- **Secondary**: Gray shades for backgrounds
- **Accent Colors**:
  - Green: Success states
  - Red: Error states
  - Amber: Warnings
  - Purple: Special features

### Dark Mode

Full dark mode support with smooth transitions using Tailwind's dark mode utilities.

### Responsive Design

Mobile-first approach with breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔑 Key Features Breakdown

### Questions Forum

- **AI Generation**: Create questions from topics or PDF files
- **Progress Tracking**: Real-time progress during generation
- **Question Types**: Multiple choice, true/false, etc.
- **Sharing**: Share question sets with the community
- **Leaderboards**: View top performers
- **Attempts**: Track and review past attempts

### Admin Dashboard

- **Analytics**: Comprehensive platform statistics
- **User Management**: View and manage users
- **Top Users**: Daily, weekly, and monthly activity leaders
- **Content Management**: Oversee courses and materials

### User Profile

- **Overview**: Activity charts and statistics
- **Personal Info**: Manage account details
- **Quiz Results**: View performance history
- **Security**: Password and account settings
- **Wallet**: Manage payments and credits

## 🔒 Authentication

The platform supports:

- User authentication with JWT tokens
- Admin authentication (separate route)
- Protected routes via middleware
- Persistent sessions with Zustand

## 🌐 API Integration

All API calls are centralized in the `services/` directory:

- Consistent error handling
- Request/response interceptors
- Token management
- Loading states

## 📱 Mobile Support

Fully responsive design optimized for:

- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1280px+)

## 🎯 Performance Optimizations

- Next.js App Router for optimal performance
- Client-side navigation
- Image optimization
- Code splitting
- Lazy loading

## 🛣️ Routing

Using Next.js 14 App Router with route groups:

- `(admin)`: Admin panel routes
- `(auth)`: Authentication routes
- `(commerce)`: Course marketplace
- `(main)`: Landing page
- `(user)`: User dashboard and features

## 🧪 Development

### Code Style

- Component-based architecture
- Functional components with hooks
- Consistent naming conventions
- Modular service layer

### Best Practices

- Separation of concerns
- Reusable components
- Centralized state management
- API abstraction layer

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📧 Contact

yousseifmuhammed@gmail.com

---

Built with ❤️ using Next.js and Tailwind CSS
