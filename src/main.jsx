import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { GroupProvider } from './context/GroupContext.jsx';
import { AlertProvider } from './context/AlertContext.jsx';

// Importa las funciones necesarias de los paquetes correctos
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Opcional: Configuración de un tema personalizado
const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
};

const theme = extendTheme({ colors });

// Renderiza la aplicación con el proveedor y el tema
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GroupProvider>
        <AlertProvider>
          <ThemeProvider>
            <ChakraProvider theme={theme}>
              <App />
            </ChakraProvider>
          </ThemeProvider>
        </AlertProvider>
      </GroupProvider>
    </AuthProvider>
  </React.StrictMode>
);
