import React from 'react'

function Neonline() {
  const lineneon = {
    height: `5px`,
    borderRadius: `100px`,
    backgroundColor: `#ffffff`,
    boxShadow: `0px 0px 20px 1px #E2346E`,
  };

  return (
    <div className='container neon'>
      <div style={{ ...lineneon }}></div>
    </div>
  )
}

export default Neonline