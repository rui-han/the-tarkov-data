import React from "react";

import { Breadcrumbs, Link} from "@mui/material";

const Nav = () => {
  return (
    <div>
      <Breadcrumbs>
        <Link href = "/">
          Home
        </Link>
        <Link href = "/">
          About
        </Link>
      </Breadcrumbs>
    </div>
  )
}

export default Nav;