import React from 'react'

function LabelCustomization({title}) {
  return (
    <div style={{fontWeight: 600}}>{title}</div>
  )
}

// function HeaderTableCustomization({title}) {
//     return (
//        <div style={{textAlign:'center', fontWeight: 600, textTransform: 'capitalize'}}>{title}</div>
//     )
//   }
  
export default LabelCustomization;
// export {HeaderTableCustomization}
