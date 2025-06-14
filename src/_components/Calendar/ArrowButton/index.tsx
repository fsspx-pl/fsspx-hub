import React from "react";
import Arrow from "./arrow.svg";

interface ArrowButtonProps {
  disabled?: boolean
  className?: string
  onClick?: () => void
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ 
  disabled = false, 
  className = '', 
  onClick 
}) => {
  return (
    <div 
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-color ${!disabled && 'hover:bg-[#e9c9c9] hover:cursor-pointer'} ${className}`}
      onClick={disabled ? undefined : onClick}
    >
      <Arrow className={`w-4 h-3 ${disabled ? "fill-[#696A6D]" : "fill-[#C81910]"}`}/>
    </div>
  );
};

export default ArrowButton;