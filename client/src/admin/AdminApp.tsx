import { AppRoutes } from './routes';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';

const AdminApp = () => {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <SocketProvider>
          <CssBaseline />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
};

export default AdminApp;
