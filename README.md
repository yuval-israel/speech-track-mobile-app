# SpeechTrack Frontend

A modern, mobile-first web application for tracking pediatric speech development. Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**, this frontend integrates seamlessly with the SpeechTrack Python backend to provide parents with actionable insights, recording tools, and progress visualization.

## 🚀 Features

* **Dashboard & Analytics**: Real-time visualization of speech metrics (MLU, Word Count) using interactive charts.
* **Voice Recording**: Integrated audio recorder with direct uploads to the analysis engine.
* **Multi-Child Management**: Seamless switching between child profiles to track individual progress.
* **Role-Based Access**: Specialized UI for Owners (Parents) and Viewers (Therapists/Family), with permission-gated features.
* **Responsive Design**: Mobile-optimized interface designed for daily use by busy parents.
* **Secure Authentication**: JWT-based auth flow with login and registration screens.

## 🛠️ Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) (Radix UI)
* **Form Handling**: React Hook Form + Zod
* **Visualization**: Recharts
* **Icons**: Lucide React

## 📂 Project Structure

```bash
src/
├── app/                # Next.js App Router pages (Login, Dashboard)
├── components/         # React components
│   ├── auth/           # Login/Register forms
│   ├── ui/             # Shadcn UI primitives (Buttons, Cards, Dialogs)
│   ├── views/          # Main dashboard views (Home, Family, Settings)
│   └── ...             # Feature-specific components (RecordingBar, MetricsCard)
├── hooks/              # Custom React hooks (useRecordings, useDashboardData)
├── lib/                # Utilities and API clients
│   ├── api/            # Typed API client and interfaces
│   └── utils.ts        # Helper functions
└── types/              # TypeScript type definitions
```

## ⚡ Getting Started

### Prerequisites

* Node.js 18+ (LTS recommended)
* pnpm (recommended) or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yuval-israel/speech-track-mobile-app.git
   cd speech-track-mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Configure Environment: Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 Scripts

* `npm run dev`: Starts the development server.
* `npm run build`: Builds the application for production.
* `npm run start`: Runs the built production application.
* `npm run lint`: Runs ESLint to check for code quality issues.

## 🔌 API Integration

This frontend is designed to work with the SpeechTrack Backend. It expects a RESTful API compliant with the interfaces defined in `src/types/api.ts`.

Key endpoints used:
* `POST /token`: User authentication
* `GET /children`: Fetch family profiles
* `POST /recordings`: Upload audio files
* `GET /analysis`: Retrieve speech metrics

## 🎨 UI Customization

The project uses a "Soft Medical" aesthetic with rounded corners and a muted slate/teal color palette. Global styles are defined in `app/globals.css`, and component themes are managed via Tailwind utility classes.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
