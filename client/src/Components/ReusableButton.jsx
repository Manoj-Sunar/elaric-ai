import React from "react";
import { motion } from "framer-motion";

const ReusableButton = ({
  label = "Click Me",
  onClick = () => {},
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  customClass = "",
}) => {
  const variants = {
    primary: "bg-gray-600 hover:bg-gray-600 text-white",
    secondary: "bg-gray-700 hover:bg-gray-800 text-white border border-gray-700",
    outline: "bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white border border-red-600",
  };
  const sizes = {
    sm: "text-sm px-3 py-1",
    md: "text-medium px-5 py-2",
    lg: "text-lg px-6 py-3",
  };
  const finalClasses = `
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    transition-all duration-300 font-semibold shadow-md hover:shadow-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${customClass}
  `;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={finalClasses.trim()}
    >
      {label}
    </motion.button>
  );
};

export default ReusableButton;
