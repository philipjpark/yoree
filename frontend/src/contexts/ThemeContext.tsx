import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getTheme = (mode: ThemeMode): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#667eea',
        light: '#764ba2',
        dark: '#5568d3',
        contrastText: '#fff',
      },
      secondary: {
        main: '#00D4FF',
        light: '#33DDFF',
        dark: '#00A8CC',
        contrastText: mode === 'dark' ? '#0A0E27' : '#fff',
      },
      background: {
        default: mode === 'dark' ? '#0A0E27' : '#F8FAFC',
        paper: mode === 'dark' ? '#1A1F3A' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#E2E8F0' : '#2C3E50',
        secondary: mode === 'dark' ? '#94A3B8' : '#546E7A',
      },
      success: {
        main: '#00FF88',
        light: '#33FFAA',
        dark: '#00CC6A',
      },
      error: {
        main: '#FF4444',
        light: '#FF6666',
        dark: '#CC0000',
      },
      warning: {
        main: '#FFA726',
        light: '#FFB74D',
        dark: '#F57C00',
      },
      info: {
        main: '#00D4FF',
        light: '#33DDFF',
        dark: '#00A8CC',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 800,
        fontSize: '3.5rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2.75rem',
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '2.25rem',
        letterSpacing: '0em',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.75rem',
        letterSpacing: '0.00735em',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
        letterSpacing: '0em',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.25rem',
        letterSpacing: '0.0075em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #667eea 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            background: mode === 'dark' 
              ? 'rgba(26, 31, 58, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: mode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: mode === 'dark'
                ? '0 8px 30px rgba(102, 126, 234, 0.2)'
                : '0 8px 30px rgba(102, 126, 234, 0.15)',
              transform: 'translateY(-2px)',
              borderColor: 'rgba(102, 126, 234, 0.3)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            background: mode === 'dark'
              ? 'rgba(26, 31, 58, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: mode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              background: mode === 'dark'
                ? 'rgba(26, 31, 58, 0.6)'
                : 'rgba(255, 255, 255, 0.8)',
              '& fieldset': {
                borderColor: mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(102, 126, 234, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#667eea',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: mode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 600,
          },
        },
      },
    },
  });
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const theme = getTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, theme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
