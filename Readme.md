<div align="center">
  <br />
    <h1 align="center">SlotSwapper - Peer-to-Peer Time Slot Scheduling Application</h1>
<img width="1470" alt="Screenshot 2024-12-10 at 9 45 45 AM" src="./public/Screenshot (133).png">
   <img alt='SlotSwapper'src="https://img.shields.io/badge/SlotSwapper-Full%2520Stack%2520App-blue">
<br />

  <div>
   <img alt='Next.js'src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=nextdotjs&logoColor=white">
<img alt='Supabase' src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
<img alt='Tailwind CSS' src='https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white'>
<img alt='Prisma' src='https://img.shields.io/badge/Prisma-blue?style=for-the-badge&logo=prisma&logoColor=white'>
<img alt='Inngest' src='https://img.shields.io/badge/Inngest-beige?style=for-the-badge&logo=inngest&logoColor=white'>
<img alt='ArcJet' src='https://img.shields.io/badge/ArcJet-yellow?style=for-the-badge&logo=arcjet&logoColor=white'>
<img alt='Shadcn UI' src='https://img.shields.io/badge/shadcn/ui-pink?style=for-the-badge&logo=shadcnui&logoColor=white'>
  </div>




</div>



## <a name="introduction">✨ Introduction</a>

SlotSwapper is a modern peer-to-peer time-slot scheduling application that allows users to exchange their busy time slots with others. Built with the MERN stack (MongoDB, Express.js, React, Node.js) and TypeScript, it provides a seamless experience for managing calendars and swapping time commitments.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[Next.js](https://nextjs.org/)** : A React-based framework for building full-stack web applications.

  -  Provides SSR (Server-Side Rendering), SSG (Static Site Generation), and API routes, making it ideal for both frontend and backend.

  -  Handles routing, server functions, and API integration seamlessly.

- **[Supabase](https://supabase.com/dashboard/organizations)** : An open-source Firebase alternative.

  - Provides PostgreSQL database, authentication, storage, and real-time APIs out of the box.

  - Great for managing users, finance data, and secure storage without setting up your own backend.



- **[Tailwind CSS](https://tailwindcss.com/)** : A utility-first CSS framework that makes it easy to build responsive and modern UIs quickly.

  - Instead of writing custom CSS, you use small utility classes like flex, p-4, bg-gray-200.

  - Helps create clean and consistent styling for the finance platform.

- **[Prisma](https://www.prisma.io/)** : A next-generation ORM (Object Relational Mapper) for databases.

  - Works perfectly with Supabase’s PostgreSQL to provide type-safe database queries in JavaScript/TypeScript.

  - Makes working with data models and migrations simple and robust.

-  **[Inngest](https://www.inngest.com/)** : A tool for background jobs, workflows, and event-driven architecture.

   - Helps schedule recurring jobs (like finance data refresh, AI insights, or sending reports).

   - Runs independently of API requests, keeping the app fast and reliable.

- **[ArcJet](https://arcjet.com/)** : A security and compliance toolkit for modern apps.

  - Protects your platform from bots, fraud, abuse, and spam.

  - Important for financial platforms where data security and compliance are critical.


- **[Shadcn UI](https://ui.shadcn.com/)** : A collection of beautifully styled, accessible UI components built with Tailwind CSS and Radix UI.

  - Provides production-ready components like modals, tables, dropdowns, and forms.

  - Ensures the platform looks modern and consistent without reinventing UI design.



## <a name="Key Features">🔋 Features</a>

👉 **AI-powered financial insights**: Analyze financial data with AI to generate insights, predictions, and recommendations.  

👉 **Secure authentication**: Manage user accounts and sessions with Supabase and ArcJet for reliability, security, and compliance.  

🔐 User Authentication - Secure JWT-based authentication system

📅 Calendar Management - Create, view, update, and delete events

🔄 Smart Swapping - Mark slots as swappable and request swaps with other users

🔔 Real-time Notifications - Instant updates on swap requests and responses

🎯 Modern UI - Clean, responsive interface built with Tailwind CSS

⚡ Type Safety - Full TypeScript implementation for better code quality  

## <a name="quick-start">🏗️ Project Structure</a>

<h3>Frontend Architecture</h3>

```bash
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── AnimatedBackground.tsx    # Dynamic background component
│   │   ├── EventForm.tsx             # Form for creating/editing events
│   │   ├── FormInput.tsx             # Reusable form input component
│   │   ├── Layout.tsx                # Main layout wrapper
│   │   ├── ProtectedRoute.tsx        # Route protection HOC
│   │   └── ErrorBoundary.tsx         # Error handling component
│   ├── pages/
│   │   ├── Dashboard.tsx             # User's calendar and events
│   │   ├── Login.tsx                 # Authentication page
│   │   ├── Marketplace.tsx           # Browse swappable slots
│   │   ├── Notifications.tsx         # Swap requests management
│   │   └── Register.tsx              # User registration
│   ├── context/
│   │   └── AuthContext.tsx           # Authentication state management
│   ├── hooks/
│   │   ├── useEvents.ts              # Events management custom hook
│   │   ├── useSwaps.ts               # Swaps management custom hook
│   │   └── index.ts                  # Hooks barrel export
│   ├── utils/
│   │   └── api.ts                    # API service layer
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   ├── App.tsx                       # Main application component
│   ├── main.tsx                      # Application entry point
│   └── index.css                     # Global styles
├── index.html
├── package.json
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── vite.config.ts                    # Vite build configuration
└── tsconfig.json                     # TypeScript configuration
```
<h3>backend Architecture</h3>

``` bash
backend/
├── src/
│   ├── models/
│   │   ├── User.ts                   # User data model
│   │   ├── Event.ts                  # Event/Slot data model
│   │   └── SwapRequest.ts            # Swap request data model
│   ├── routes/
│   │   ├── auth.ts                   # Authentication routes
│   │   ├── events.ts                 # Event management routes
│   │   └── swaps.ts                  # Swap operations routes
│   ├── middleware/
│   │   └── auth.ts                   # JWT authentication middleware
│   └── index.ts                      # Server entry point
├── package.json
├── tsconfig.json                     # TypeScript configuration
└── .env                              # Environment variables
```

## <a name="Technology Stack">🛠️ Technology Stack</a>


- **Frontend**

  - React 18 - UI library with latest features
  - TypeScript - Type-safe JavaScript
  - Vite - Fast build tool and dev server
  - Tailwind CSS - Utility-first CSS framework
  - Axios - HTTP client for API calls

- **Backend**

  - Node.js - Runtime environment
  - Express.js - Web application framework
  - TypeScript - Type-safe Node.js development
  - Mongoose - MongoDB object modeling
  - JWT - JSON Web Tokens for authentication
  - bcryptjs - Password hashing
  

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Clone the Repo**
```bash
git clone https://github.com/your-username/fullstack-ai-finance-platform.git
cd fullstack-ai-finance-platform
```

**Install Dependencies**
```bash
npm install
```
**Set Up Environment Variables**

Create a .env file and add credentials for:

Supabase (DB URL, API Keys)

Prisma (DATABASE_URL)

Inngest, ArcJet keys

Run the Development Server
```bash
npm run dev
```

The app will be live at http://localhost:3000
 🚀

📌 Contributing

Feel free to fork the repo, open issues, or submit PRs. Contributions are welcome!


