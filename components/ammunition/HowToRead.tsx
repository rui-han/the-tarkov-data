import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const data = [
  {
    effectivenessLevel: "0  Pointless",
    bulletsStopped: "20+",
    explanation: "Can't penetrate in any reasonable amount of hits",
    bgColor: "#b3242580",
  },
  {
    effectivenessLevel: "1  It's possible, but...",
    bulletsStopped: "13 to 20",
    explanation:
      "Typically doesn't penetrate at all for a large number of hits, or starts with a very low chance and barely increases",
    bgColor: "#dd333380",
  },
  {
    effectivenessLevel: "2  Magdump only",
    bulletsStopped: "9 to 13",
    explanation:
      "Has a very low or no penetration chance initially and very slowly gains chance",
    bgColor: "#EB6C0D80",
  },
  {
    effectivenessLevel: "3  Slightly effective",
    bulletsStopped: "5 to 9",
    explanation:
      "Has a low penetration chance initially and slowly gains chance, or quickly damages armor until it penetrates",
    bgColor: "#ac660080",
  },
  {
    effectivenessLevel: "4  Effective",
    bulletsStopped: "3 to 5",
    explanation:
      "Starts with a low-medium penetration chance but quickly increases",
    bgColor: "#FB9C0E80",
  },
  {
    effectivenessLevel: "5  Very effective",
    bulletsStopped: "1 to 3",
    explanation:
      "Penetrates a large percent of the time initially, often quickly going to > 90%",
    bgColor: "#00640080",
  },
  {
    effectivenessLevel: "6  Usually ignores",
    bulletsStopped: "<1",
    explanation: "Initially penetrates > 80% of the time",
    bgColor: "#00990080",
  },
];

export default function HowToRead() {
  return (
    <TableContainer
      component={Paper}
      sx={{ width: "90%", m: "3vh" }}
      elevation={4}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Effectiveness Level</TableCell>
            <TableCell align="center">
              Average Amount of Bullets Stopped
            </TableCell>
            <TableCell align="center">Explanation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((data, index) => (
            <TableRow key={index}>
              <TableCell sx={{ backgroundColor: data.bgColor }}>
                {data.effectivenessLevel}
              </TableCell>
              <TableCell align="center">{data.bulletsStopped}</TableCell>
              <TableCell>{data.explanation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
