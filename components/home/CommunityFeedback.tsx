"use client";

import { useState, useCallback } from "react";

// MUI
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

const MAX_LENGTH = 2000;

export default function CommunityFeedback() {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // snackbar state, shared between success and error cases
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const isOverLimit = feedback.length > MAX_LENGTH;

  // handle feedback submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const trimmed = feedback.trim();
      // don't need to submit empty feedback
      if (trimmed === "" || isOverLimit) return;

      setSubmitting(true);

      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Failed to submit feedback");
        }

        setFeedback("");
        setSnackbarSeverity("success");
        setSnackbarMessage("Thank you for your feedback!");
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarSeverity("error");
        setSnackbarMessage(
          error instanceof Error
            ? error.message
            : "Failed to submit feedback, please try again",
        );
        setSnackbarOpen(true);
      } finally {
        setSubmitting(false);
      }
    },
    [feedback, isOverLimit],
  );

  // close snackbar
  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
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
                disabled={submitting}
                error={isOverLimit}
                helperText={
                  isOverLimit
                    ? `Feedback must be under ${MAX_LENGTH} characters (${feedback.length}/${MAX_LENGTH})`
                    : `${feedback.length}/${MAX_LENGTH}`
                }
                sx={{ marginBottom: 2 }}
              />
              <Button
                color="primary"
                type="submit"
                variant="contained"
                disabled={submitting || feedback.trim() === "" || isOverLimit}
                startIcon={
                  submitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
