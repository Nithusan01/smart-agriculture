import React from 'react'

const LoadingSpinner = () => {
  return (
   <div className="relative flex items-center justify-center">
  <span className="absolute inline-flex size-[50%] bg-green-400 rounded-full opacity-75 animate-ping"></span>
  <span className="relative inline-flex size-3 bg-green-500 rounded-full"></span>
</div>


  )
}

export default LoadingSpinner