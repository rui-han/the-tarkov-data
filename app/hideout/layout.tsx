"use client";

import { useState } from "react";
import { GET_HIDEOUT_DATA } from "@/graphql/queries";
import { useSuspenseQuery } from "@apollo/client";
import { FetchedData } from "@/types/hideout";
import HideoutNav from "@/components/hideout/HideoutNav";
import Image from "next/image";
import HideoutFlowchart from "../../public/images/hideout-flowchart.jpeg";
// MUI
import { Box, Modal, Button, Divider, IconButton } from "@mui/material";
import HighlightOffTwoToneIcon from "@mui/icons-material/HighlightOffTwoTone";

export default function HideoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useSuspenseQuery<FetchedData>(GET_HIDEOUT_DATA);

  if (!data) return null;

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  return (
    <>
      <HideoutNav hideoutStations={data.hideoutStations} />
      <Button
        variant="outlined"
        sx={{
          m: "2vh",
          color: "inherit",
          borderColor: "white",
          "&:hover": { borderColor: "red" },
        }}
        onClick={handleModalOpen}
      >
        Show Flowchart
      </Button>
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
            height: "90%",
            width: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
            onClick={handleModalClose}
          >
            <HighlightOffTwoToneIcon sx={{ fontSize: "2rem" }} />
          </IconButton>
          <Image
            src={HideoutFlowchart}
            alt=""
            style={{ width: "95%", height: "auto", marginTop: "3.5vh" }}
          />
        </Box>
      </Modal>
      {/* the width of the Divider matches that of the hideout navbar Breadcrumbs, which is 90% */}
      <Divider sx={{ color: "white", width: "90%" }} />
      {children}
    </>
  );
}
