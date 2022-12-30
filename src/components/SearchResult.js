import React from 'react'

import RawAmmunitionData from '../data/ammunition.json'

const AmmunitionData = Object.values(RawAmmunitionData)

export default function SearchResult(props) {
  let searchInput = props.searchInput;

  let filteredData = AmmunitionData.filter(data => {
    if (searchInput === '') {
      return searchInput;
    } else if (data.name.toLowerCase().includes(searchInput.toLowerCase())) {
      return data.name
    }
  })

  return (
    <div>
      {
        filteredData.map((data, index) => (
          <div key={index} style={{borderStyle: "dashed"}}>
            <p>Name: {data.name}</p>
            <p>Damage: {data.ballistics.damage}</p>
            <p>Armor Damage: {data.ballistics.armorDamage}</p>
          </div>
        ))
      }
    </div>
  )
}
