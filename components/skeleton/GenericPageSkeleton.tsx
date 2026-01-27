import {
  Box,
  Skeleton,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";

export default function GenericPageSkeleton() {
  return (
    // Use 100% to respect the parent container's boundaries
    <Box sx={{ p: 3, width: "100%", boxSizing: "border-box" }}>
      {/* 1. Header Section - 30% width looks more like a title */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Skeleton variant="text" width="15%" height={20} animation="wave" />
        <Skeleton variant="text" width="35%" height={45} animation="wave" />
      </Stack>

      {/* 2. Search & Controls - Fill the grid columns */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            {/* Search bars usually take full width of their assigned grid */}
            <Skeleton
              variant="rounded"
              width="100%"
              height={50}
              animation="wave"
            />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Skeleton
              variant="rounded"
              width="100%"
              height={50}
              animation="wave"
            />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Skeleton
              variant="rounded"
              width="100%"
              height={50}
              animation="wave"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 3. Data Table */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ border: "none" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {/* Table headers usually 60-70% to mimic short labels */}
              {[70, 40, 50, 60, 40].map((w, i) => (
                <TableCell key={i}>
                  <Skeleton variant="text" width={`${w}%`} animation="wave" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(6)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {/* Randomize cell widths slightly for a more organic feel */}
                <TableCell>
                  <Skeleton variant="text" width="80%" animation="wave" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="60%" animation="wave" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="90%" animation="wave" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="75%" animation="wave" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="50%" animation="wave" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
