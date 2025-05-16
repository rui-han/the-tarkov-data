import { createTheme } from "@mui/material";
import { lighten, darken } from "@mui/material/styles";

const BASE_PRIMARY = "#9a8866";

// dark theme with customization
export const darkTheme = createTheme({
  palette: {
    mode: "dark",

    // PRIMARY: warm brown
    primary: {
      main: BASE_PRIMARY, // #9a8866
      light: lighten(BASE_PRIMARY, 0.2), // ~#b39f7f
      dark: darken(BASE_PRIMARY, 0.2), // ~#7b6f54
      contrastText: "#FFF",
    },

    // SECONDARY: a muted teal to complement the brown
    secondary: {
      main: "#66a69a",
      light: lighten("#66a69a", 0.2), // ~#89bdb3
      dark: darken("#66a69a", 0.2), // ~#528378
      contrastText: "#FFF",
    },

    // Standard semantic colors
    error: {
      main: "#f44336",
      light: lighten("#f44336", 0.2),
      dark: darken("#f44336", 0.2),
      contrastText: "#FFF",
    },
    warning: {
      main: "#ffb300",
      light: lighten("#ffb300", 0.2),
      dark: darken("#ffb300", 0.2),
      contrastText: "rgba(0,0,0,0.87)",
    },
    info: {
      main: "#29b6f6",
      light: lighten("#29b6f6", 0.2),
      dark: darken("#29b6f6", 0.2),
      contrastText: "#FFF",
    },
    success: {
      main: "#66bb6a",
      light: lighten("#66bb6a", 0.2),
      dark: darken("#66bb6a", 0.2),
      contrastText: "rgba(0,0,0,0.87)",
    },

    // Backgrounds
    background: {
      default: "#1d1d1f",
      paper: "#2b2b2d",
    },

    // Text
    text: {
      primary: BASE_PRIMARY,
      secondary: "rgba(224, 220, 207, 0.6)",
      disabled: "rgba(224, 220, 207, 0.3)",
    },

    // Divider
    divider: "rgba(224, 220, 207, 0.12)",
  },

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 500 },
    h2: { fontWeight: 500 },
    button: { textTransform: "none" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
        },
      },
    },
    // Force contained-primary hover to use a custom shade
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          "&:hover": {
            backgroundColor: darken(BASE_PRIMARY, 0.15),
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: darken("#2b2b2d", 0.1),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
