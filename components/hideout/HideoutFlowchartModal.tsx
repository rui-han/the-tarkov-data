import { useState } from "react";
import Image from "next/image";
import HideoutFlowchart from "../../public/images/hideout-flowchart.jpeg";
// MUI
import { Box, Modal, Button, IconButton, Slider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

export default function HideoutFlowchartModal() {
  // states
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  // handle zoom flowchart
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoom(newValue as number);
  };

  return (
    <>
      {/* show flowchart button */}
      <Button
        variant="outlined"
        sx={{
          m: "2vh",
          color: "inherit",
          borderColor: "inherit",
          "&:hover": {
            color: "inherit",
            borderColor: "inherit",
            textDecoration: "underline",
          },
        }}
        onClick={handleModalOpen}
      >
        Show Flowchart
      </Button>
      {/* the modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: "100%",
            width: "100%",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
            }}
            onClick={handleModalClose}
          >
            <CloseIcon />
          </IconButton>

          {/* zoomable image */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
            }}
          >
            <Image
              src={HideoutFlowchart}
              alt=""
              style={{
                width: `${zoom}%`,
                height: "auto",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </Box>

          {/* zoom control */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 2,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <IconButton onClick={handleZoomOut} sx={{ color: "white" }}>
              <ZoomOutIcon />
            </IconButton>
            <Slider
              value={zoom}
              onChange={handleZoomChange}
              aria-labelledby="zoom-slider"
              min={50}
              max={200}
              sx={{ width: "50%", mx: 2, color: "white" }}
            />
            <IconButton onClick={handleZoomIn} sx={{ color: "white" }}>
              <ZoomInIcon />
            </IconButton>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
