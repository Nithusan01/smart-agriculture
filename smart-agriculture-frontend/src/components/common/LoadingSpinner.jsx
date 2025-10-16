import React from 'react'

const LoadingSpinner = () => {
  return (
   <div class="relative flex items-center justify-center">
  <span class="absolute inline-flex size-[50%] bg-green-400 rounded-full opacity-75 animate-ping"></span>
  <span class="relative inline-flex size-3 bg-green-500 rounded-full"></span>
</div>


  )
}

export default LoadingSpinner