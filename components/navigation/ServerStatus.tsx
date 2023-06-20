import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { GET_SERVER_STATUS } from "@/graphql/queries";
import { ServerStatusData } from "@/types/server_status";

export default function ServerStatus() {
  const { data } = useSuspenseQuery<ServerStatusData>(GET_SERVER_STATUS);

  const dotColor =
    Number(data.status.generalStatus.status) == 0 ? "green" : "red";

  return (
    <div>
      <a
        style={{
          color: "inherit",
        }}
        href="https://status.escapefromtarkov.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Server Status
      </a>
      <span
        style={{
          backgroundColor: dotColor,
          borderRadius: "50%",
          width: "12px",
          height: "12px",
          display: "inline-block",
          margin: "0 10px",
        }}
      ></span>
    </div>
  );
}
