import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import LaundryDashboard from "@/components/LaundryDashboard";
import ErrorBoundary from "@/components/ErrorBoundary";

// Validate environment on startup
if (!process.env.REACT_APP_BACKEND_URL) {
  console.warn('⚠️ REACT_APP_BACKEND_URL is not set. Using default: http://localhost:8000');
}

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        {/* Background gradient spots */}
        <div className="bg-spot-1" />
        <div className="bg-spot-2" />
        <div className="bg-spot-3" />

        {/* Main Dashboard */}
        <LaundryDashboard />

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
