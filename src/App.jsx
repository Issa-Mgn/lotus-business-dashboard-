import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Licenses from './pages/Licenses';
import Notifications from './pages/Notifications';
import Activity from './pages/Activity';
import Admins from './pages/Admins';
import Infos from './pages/Infos';
import Settings from './pages/Settings';
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
            <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
            <Route path="/activity" element={<Layout><Activity /></Layout>} />
            <Route path="/admins" element={<Layout><Admins /></Layout>} />
            <Route path="/infos" element={<Layout><Infos /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />

            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
