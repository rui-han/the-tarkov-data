import { Box, TablePagination } from "@mui/material";
import { AmmoTablePaginationProps } from "@/types/ammo";

const AmmoTablePagination = ({
  totalRows,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
}: AmmoTablePaginationProps) => {
  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Box>
  );
};

export default AmmoTablePagination;
