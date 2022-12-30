import React, { useState } from 'react'

import { IconButton, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';

import SearchResult from './SearchResult';

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState("");

  return (
    <div>
      <TextField placeholder='search for ammunition here' onChange={e => setSearchInput(e.target.value)} />
      <IconButton>
        <SearchIcon />
      </IconButton>
      <SearchResult searchInput={searchInput} />
    </div>
  )
}
