"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface ExternalLinkConfirmDialogProps {
  open: boolean;
  label: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog shown before navigating
 * to an external website.
 */
export default function ExternalLinkConfirmDialog({
  open,
  label,
  onClose,
  onConfirm,
}: ExternalLinkConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Leave this site?</DialogTitle>

      <DialogContent>
        <DialogContentText>
          You are about to open an external link:
          <br />
          <strong>{label}</strong>
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} autoFocus>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
