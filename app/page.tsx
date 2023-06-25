"use client";

import { Grid, Box } from "@mui/material";
import { TwitterTimelineEmbed } from "react-twitter-embed";
import YouTube from "react-youtube";

export default function Home() {
  return (
    <>
      <Grid
        container
        mt="1vh"
        spacing={4}
        display="flex"
        justifyContent="center"
      >
        <Grid item xs={5}>
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="bstategames"
            theme="dark"
            tweetLimit={5}
            options={{ height: "700" }}
          />
        </Grid>
        <Grid item xs={5}>
          <TwitterTimelineEmbed
            sourceType="profile"
            screenName="LVNDMARK_tv"
            theme="dark"
            tweetLimit={5}
            options={{ height: "700" }}
          />
        </Grid>
        {/* <div style={{ width: "100%" }}>
          <YouTube
            videoId="q9OIT7W24V8"
            opts={{
              width: "100%",
              height: "0",
              padding: "56.25% 0 0 0", // Responsive aspect ratio (16:9)
              position: "relative",
            }}
          />
        </div> */}
        <Grid item xs={5}>
          <YouTube videoId="q9OIT7W24V8" />
        </Grid>
        <Grid item xs={5}>
          <YouTube videoId="_cdGKiXsQ8o" />
        </Grid>
      </Grid>
    </>
  );
}
