# SpeechTrack - Production Ready React Components

This is a framework-agnostic React implementation of the SpeechTrack pediatric speech development tracker, ready for integration with your FastAPI backend.

## Features

- **Framework Agnostic**: Works with any React setup (Vite, CRA, or custom)
- **Smart/Dumb Component Architecture**: Separation of data fetching and UI rendering
- **TypeScript API Interfaces**: Fully typed backend contract
- **FastAPI Ready**: Prepared for direct integration with Python backend
- **No Next.js Dependencies**: Uses standard HTML elements and React patterns

## Installation

1. Copy the `src/` directory into your React project
2. Install dependencies (if not already present):

```bash
npm install lucide-react
```

3. Ensure you have your Shadcn UI components set up (Button, Card, Dialog, etc.)

## Usage

### Basic Integration

```tsx
import { DashboardContainer } from './src/components/DashboardContainer'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const authToken = 'your-jwt-token'
  const apiBaseUrl = 'https://your-api.com/api/v1'

  if (!isLoggedIn) {
    return <LoginScreen onSuccess={() => setIsLoggedIn(true)} />
  }

  return (
    <DashboardContainer
      apiBaseUrl={apiBaseUrl}
      authToken={authToken}
      onLogout={() => setIsLoggedIn(false)}
    />
  )
}
```

### With Custom API Functions

```tsx
import { DashboardContainer } from './src/components/DashboardContainer'
import type { DashboardData, RecordingUploadPayload } from './src/types/api'

function App() {
  const customFetchDashboard = async (): Promise<DashboardData> => {
    // Your custom implementation
    const response = await myApiClient.getDashboard()
    return response.data
  }

  const customUploadRecording = async (payload: RecordingUploadPayload) => {
    const formData = new FormData()
    formData.append('file', payload.file)
    formData.append('child_id', payload.child_id)
    formData.append('duration', payload.duration.toString())
    
    await myApiClient.uploadRecording(formData)
  }

  return (
    <DashboardContainer
      apiBaseUrl="https://your-api.com/api/v1"
      authToken="your-jwt-token"
      onLogout={() => console.log('Logout')}
      fetchDashboardData={customFetchDashboard}
      uploadRecording={customUploadRecording}
    />
  )
}
```

## API Contract

### Expected Backend Endpoints

#### GET /dashboard
Returns all dashboard data for the current user:

```typescript
{
  user: { id: string, email: string, full_name: string, profile_image_url?: string },
  children: Child[],
  currentChild: Child,
  latestAnalysis: Analysis | null,
  weeklyProgress: Array<{ date: string, mlu: number, tokens: number }>,
  missedRecordings: Array<{ routine: string, scheduled_time: string }>,
  routines: ScheduledRoutine[]
}
```

#### POST /recordings/
Accepts FormData with:
- `file`: Audio file (File)
- `child_id`: Child ID (string)
- `duration`: Recording duration in seconds (number)

## Component Architecture

### Smart Components (Data Layer)
- **DashboardContainer**: Handles API calls, state management, and data flow

### Dumb Components (UI Layer)
- **DashboardView**: Main dashboard router
- **HomeView**: Home screen with metrics
- **RecordingView**: Recording interface with MediaRecorder API
- **DataView**: Analytics and charts
- **FamilyView**: Child switcher
- **AlertsView**: Scheduled routines
- **ProfileSettings**: User settings

## Customization

All components use standard CSS classes and can be styled with:
- Tailwind CSS (recommended)
- CSS Modules
- Styled Components
- Any CSS-in-JS solution

The Soft Medical design system uses:
- Rounded corners (rounded-2xl)
- Muted color palette (slate/teal)
- Clean typography
- Professional medical aesthetic

## Notes

- All image elements use standard `<img>` tags instead of Next.js Image
- No font imports; assumes global font loading in your app
- MediaRecorder API used for real audio recording
- FormData properly structured for FastAPI multipart upload
- Full TypeScript type safety throughout
