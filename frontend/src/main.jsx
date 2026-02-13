import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// Custom theme for better mobile experience
const theme = extendTheme({
  breakpoints: {
    base: '0em',
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  styles: {
    global: {
      body: {
        overscrollBehavior: 'none',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '*': {
        WebkitTapHighlightColor: 'transparent',
      },
      'button, a, input, select, textarea': {
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
      },
    },
  },
});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ChakraProvider theme={theme}>
         <App />
      </ChakraProvider>
    </BrowserRouter>

  </StrictMode>,
);
