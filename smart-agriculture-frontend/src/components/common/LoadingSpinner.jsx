import React from "react";
import { Leaf } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Rotating ring */}
      <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>

      {/* Leaf icon in the center */}
      <Leaf className="absolute text-green-600 w-10 h-10" />
    </div>
  );
};

export default LoadingSpinner;
