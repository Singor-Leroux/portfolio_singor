import { AppRoutes } from './routes';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeContextProvider } from './contexts/ThemeContext';

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
