import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AptitudeRound from './pages/rounds/AptitudeRound';
import TechnicalRound from './pages/rounds/TechnicalRound';
import CodingRound from './pages/rounds/CodingRound';
import HRRound from './pages/rounds/HRRound';
import Results from './pages/Results';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rounds/aptitude"
            element={
              <ProtectedRoute>
                <AptitudeRound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rounds/technical"
            element={
              <ProtectedRoute>
                <TechnicalRound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rounds/coding"
            element={
              <ProtectedRoute>
                <CodingRound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rounds/hr"
            element={
              <ProtectedRoute>
                <HRRound />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
