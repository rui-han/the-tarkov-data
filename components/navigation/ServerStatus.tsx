import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_SERVER_STATUS } from "@/graphql/queries";
import { ServerStatusData } from "@/types/server_status";
import { ListItemText } from "@mui/material";

export default function ServerStatus() {
  const { data, error } = useSuspenseQuery<ServerStatusData>(GET_SERVER_STATUS);

  if (error) {
    console.log(`error loading server status: ${error}`);
  }

  const dotColor =
    Number(data?.status?.generalStatus?.status) === 0 ? "#a2ff86" : "red";

  return (
    <>
      <ListItemText>
        EFT Server
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
