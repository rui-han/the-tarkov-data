"use client";

import { Grid } from "@mui/material";

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
          <a
            className="twitter-timeline"
            data-lang="en"
            data-height="700"
            data-theme="dark"
            href="https://twitter.com/bstategames?ref_src=twsrc%5Etfw"
          >
            Tweets by bstategames
          </a>
          <script
            async
            src="https://platform.twitter.com/widgets.js"
            charSet="utf-8"
          ></script>
        </Grid>
        <Grid item xs={5}>
          <a
            className="twitter-timeline"
            data-lang="en"
            data-height="700"
            data-theme="dark"
            href="https://twitter.com/NoiceGuy_?ref_src=twsrc%5Etfw"
          >
            Tweets by NoiceGuy_
          </a>
          <script
            async
            src="https://platform.twitter.com/widgets.js"
            charSet="utf-8"
          ></script>
        </Grid>
        <Grid item>
          <iframe
            style={{ width: "80vw", height: "80vh" }}
            src="https://www.youtube.com/embed/q9OIT7W24V8"
            title="Escape from Tarkov. Raid. Full film."
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </Grid>
      </Grid>
    </>
  );
}
