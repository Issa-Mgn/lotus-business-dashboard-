import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Licenses from './pages/Licenses';
import Admins from './pages/Admins';
import Infos from './pages/Infos';
import NotFound from './pages/NotFound';
import { testApiConnection } from './utils/testApi';

// Rendre testApiConnection accessible globalement pour debug
window.testApiConnection = testApiConnection;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/users" element={<Layout><Users /></Layout>} />
            <Route path="/licenses" element={<Layout><Licenses /></Layout>} />
            <Route path="/admins" element={<Layout><Admins /></Layout>} />
            <Route path="/infos" element={<Layout><Infos /></Layout>} />

            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
