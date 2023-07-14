import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_SERVER_STATUS } from "@/graphql/queries";
import { ServerStatusData } from "@/types/server_status";
import { ListItemText } from "@mui/material";

export default function ServerStatus() {
  const { data } = useSuspenseQuery<ServerStatusData>(GET_SERVER_STATUS);

  const dotColor =
    Number(data.status.generalStatus.status) == 0 ? "#a2ff86" : "red";

  return (
    <>
      <ListItemText>
        Server
        <span
          style={{
            backgroundColor: dotColor,
            borderRadius: "50%",
            width: "12px",
            height: "12px",
            display: "inline-block",
            marginLeft: "16px",
          }}
        />
      </ListItemText>
    </>
  );
}
