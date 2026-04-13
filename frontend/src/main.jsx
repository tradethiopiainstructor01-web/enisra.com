import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { installTidioBlocker } from './utils/blockTidioWidget.js'

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  breakpoints: {
    base: '0em',
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  styles: {
    global: (props) => ({
      body: {
        overscrollBehavior: 'none',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      },
      '*': {
        WebkitTapHighlightColor: 'transparent',
      },
      'button, a, input, select, textarea': {
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
      },
    }),
  },
  colors: {
    brand: {
      50: '#e6f2ff',
      100: '#b3d9ff',
      200: '#80bfff',
      300: '#4da6ff',
      400: '#1a8cff',
      500: '#0073e6',
      600: '#005ab3',
      700: '#004080',
      800: '#00264d',
      900: '#000d1a',
    },
  },
});

installTidioBlocker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ChakraProvider theme={theme}>
         <App />
      </ChakraProvider>
    </BrowserRouter>

  </StrictMode>,
);
