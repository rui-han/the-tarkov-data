import { useState, useCallback } from "react";
import Image from "next/image";
import HideoutFlowchart from "../../public/images/hideout-flowchart.jpeg";
// MUI
import { Box, Modal, Button, IconButton, Slider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

export default function HideoutFlowchartModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(100);

  // modal open/close handlers
  const handleModalOpen = useCallback(() => setModalOpen(true), []);
  const handleModalClose = useCallback(() => setModalOpen(false), []);

  // zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 300));
  }, []);
  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 80));
  }, []);
  const handleZoomChange = useCallback(
    (event: Event, newValue: number | number[]) => {
      setZoom(newValue as number); // Update zoom level based on slider input
    },
    [],
  );

  // styles
  const modalStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const boxStyle = {
    position: "relative",
    height: "90vh",
    width: "90vw",
    maxWidth: "1200px", // for better control on large screens
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
    display: "flex",
    flexDirection: "column",
  };
  const imageContainerStyle = {
    flex: 1,
    overflow: "auto", // enable scrolling if image exceeds container size
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  };
  const imageWrapperStyle = {
    position: "relative",
    width: "auto",
    height: "auto",
  };

  return (
    <>
      {/* button to open the modal */}
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
      {/* modal displaying the flowchart */}
      <Modal open={modalOpen} onClose={handleModalClose} sx={modalStyle}>
        <Box sx={boxStyle}>
          {/* close button for the modal */}
          <IconButton
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
              zIndex: 1,
            }}
            onClick={handleModalClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </IconButton>
          {/* container for the flowchart image */}
          <Box sx={imageContainerStyle}>
            <Box sx={imageWrapperStyle}>
              <Image
                src={HideoutFlowchart}
                alt="Hideout Flowchart"
                style={{
                  width: `${zoom}%`, // dynamic width based on zoom level
                  height: "auto",
                  maxWidth: "none",
                  transition: "width 0.3s ease-in-out", // smooth transition for zoom
                }}
                priority // preload image for faster rendering
                quality={85} // balance between quality and performance
                placeholder="blur" // blur placeholder while image loads
                onError={() => console.error("Failed to load flowchart image")} // error handling
              />
            </Box>
          </Box>
          {/* zoom controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 2,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <IconButton
              onClick={handleZoomOut}
              sx={{ color: "white" }}
              aria-label="Zoom out"
            >
              <ZoomOutIcon />
            </IconButton>
            <Slider
              value={zoom}
              onChange={handleZoomChange}
              aria-label="Zoom level slider"
              min={80}
              max={300}
              sx={{ width: "50%", mx: 2, color: "white" }}
            />
            <IconButton
              onClick={handleZoomIn}
              sx={{ color: "white" }}
              aria-label="Zoom in"
            >
              <ZoomInIcon />
            </IconButton>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
