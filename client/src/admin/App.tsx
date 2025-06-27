import { SocketProvider } from './contexts/SocketContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { AppRoutes } from './routes';

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
