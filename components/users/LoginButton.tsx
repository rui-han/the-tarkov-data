import { Button } from "@mui/material";

export default function LoginButton() {
  return (
    <>
      {/*  Next linting rules might suggest using the Link component instead of an anchor tag. 
    The Link component is meant to perform client-side transitions between pages. 
    As the link points to an API route and not to a page, you should keep it as an anchor tag. */}
      <a
        href="/api/auth/login"
        style={{ color: "inherit", textDecoration: "none" }}
      >
        <Button
          variant="outlined"
          sx={{
            color: "inherit",
            borderColor: "inherit",
            fontSize: { xs: "12px", sm: "16px" },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.5)",
              color: "inherit",
            },
          }}
        >
          LOGIN
        </Button>
      </a>
    </>
  );
}
