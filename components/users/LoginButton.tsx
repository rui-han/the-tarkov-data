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
          }}
        >
          LOGIN
        </Button>
      </a>
    </>
  );
}
