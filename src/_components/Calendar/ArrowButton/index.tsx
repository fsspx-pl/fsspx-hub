import React from "react";
import Arrow from "./arrow.svg";

const ArrowButton = ({ disabled = false, className = '' }) => {
  return (
    <div className={`w-6 h-6 flex items-center justify-center rounded-full transition-color ${!disabled && 'hover:bg-[#EDBEBF] hover:cursor-pointer'} ${className}`}>
      <Arrow className={`w-3 h-2.5 ${disabled ? "fill-[#696A6D]" : "fill-[#C81910]"}`}/>
    </div>
  );
};

export default ArrowButton;