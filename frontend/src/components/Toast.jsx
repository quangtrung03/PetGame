import React, { useEffect } from 'react';

const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform animate-slide-in max-w-sm";
    
    const typeStyles = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      info: "bg-blue-500 text-white",
      warning: "bg-yellow-500 text-white"
    };

    return `${baseStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  const getIcon = () => {
    const icons = {
      success: "✅",
      error: "❌", 
      info: "ℹ️",
      warning: "⚠️"
    };
    return icons[type] || icons.info;
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getIcon()}</span>
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
