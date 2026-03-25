import React from "react";

const LoadingButton = ({
  children,
  loading = false,
  loadingText = "Please wait...",
  className = "",
  disabled = false,
  type = "button",
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${className} ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`.trim()}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
};

export default LoadingButton;
