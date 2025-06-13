import { AppRoutes } from './routes';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <ThemeContextProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </ThemeContextProvider>
  );
}

export default App;
