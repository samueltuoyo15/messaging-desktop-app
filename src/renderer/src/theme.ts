import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Bright Blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981', // Emerald
      contrastText: '#ffffff',
    },
    background: {
      default: '#09090b', // Zinc 950
      paper: '#18181b',   // Zinc 900
    },
    text: {
      primary: '#f4f4f5', // Zinc 100
      secondary: '#a1a1aa', // Zinc 400
    },
    divider: '#27272a', // Zinc 800
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.95rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#09090b',
          scrollbarColor: '#27272a #09090b',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#09090b',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#27272a',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default material overlay
        },
      },
    },
  },
});
