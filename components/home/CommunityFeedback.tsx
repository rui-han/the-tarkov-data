import { useState, useCallback } from "react";

// MUI
import { useTheme } from "@mui/material";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

export default function CommunityFeedback() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const theme = useTheme();

  // handle feedback submission
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // don't need to submit empty feedback
      if (feedback.trim() === "") return;
      console.log("Feedback submitted:", feedback);
      setFeedback("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000); // hide message after 5 seconds
    },
    [feedback],
  );

  // close snackbar
  const handleSnackbarClose = useCallback(() => {
    setSubmitted(false);
  }, []);

  return (
    <Grid container spacing={2} sx={{ padding: 2 }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Community Feedback
        </Typography>
      </Grid>
      <Grid item xs={12} sm={10} md={8} lg={6} sx={{ width: "100%" }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              We value your feedback!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Please share your thoughts and suggestions to help us improve.
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Your Feedback"
                multiline
                rows={4}
                fullWidth
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <Button type="submit" variant="contained">
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
      <Snackbar
        open={submitted}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Thank you for your feedback!
        </Alert>
      </Snackbar>
    </Grid>
  );
}
