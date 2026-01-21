import { useState } from "react";
// components
import { TaskTableColumns } from "./TaskTableColumns";
// types
import { TaskTableProps } from "@/types/task";
// MUI
import { DataGrid } from "@mui/x-data-grid";
import { Container, Paper } from "@mui/material";

export default function TaskTable({ data }: TaskTableProps) {
  const [pageSize, setPageSize] = useState<number>(10);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          height: "85vh",
          overflow: "hidden",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <DataGrid
          rows={data}
          columns={TaskTableColumns}
          pagination
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[10, 25, 50]}
          rowHeight={200}
          checkboxSelection
          disableSelectionOnClick
          getRowId={(row) => row.id}
          sx={{
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </Paper>
    </Container>
  );
}
