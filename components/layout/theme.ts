import { createTheme } from "@mui/material";
import { lighten, darken } from "@mui/material/styles";

const BASE_PRIMARY = "#9a8866";
const BG_PAPER = "#2d2d2f"; // The dark grey used in Drawer
const TEXT_PRIMARY = "#c7c5b3"; // The beige/grey text color

export const darkTheme = createTheme({
  palette: {
    mode: "dark",

    // PRIMARY: warm brown
    primary: {
      main: BASE_PRIMARY,
      light: lighten(BASE_PRIMARY, 0.2),
      dark: darken(BASE_PRIMARY, 0.2),
      contrastText: "#FFF",
    },

    // SECONDARY: muted teal
    secondary: {
      main: "#66a69a",
      light: lighten("#66a69a", 0.2),
      dark: darken("#66a69a", 0.2),
      contrastText: "#FFF",
    },

    // BACKGROUNDS
    background: {
      default: "#1d1d1f", // Very dark site background
      paper: BG_PAPER, // Matches Drawer color
    },

    // TEXT
    text: {
      primary: TEXT_PRIMARY, // Main text color (Tarkov beige)
      secondary: "rgba(224, 220, 207, 0.6)",
      disabled: "rgba(224, 220, 207, 0.3)",
    },

    // DIVIDER
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
          // Standard webkit font smoothing for better readability
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },

    // BUTTON: Custom hover state for primary buttons
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          "&:hover": {
            backgroundColor: darken(BASE_PRIMARY, 0.15),
          },
        },
      },
    },

    // APPBAR
    MuiAppBar: {
      styleOverrides: {
        root: {
          // The gradient from Nav.tsx
          background: `linear-gradient(to right, ${BG_PAPER}, #3d3d3f)`,
          boxShadow: "none", // Optional: Cleaner look without shadow
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        },
      },
    },

    // DRAWER: Ensure drawer paper matches the theme background
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: BG_PAPER,
          borderRight: "1px solid rgba(255,255,255,0.05)",
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
