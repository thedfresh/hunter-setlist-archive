import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

export type ToastVariant = "info" | "success" | "warning" | "error";

interface ToastProps {
    id: string;
    title?: string;
    message: string;
    variant?: ToastVariant;
    onClose: (id: string) => void;
    duration?: number;
}

const variantClasses: Record<ToastVariant, string> = {
    info: "toast-info",
    success: "toast-success",
    warning: "toast-warning",
    error: "toast-error",
};

const iconMap: Record<ToastVariant, React.ReactNode> = {
    info: <span className="alert-icon">ℹ️</span>,
    success: <span className="alert-icon">✅</span>,
    warning: <span className="alert-icon">⚠️</span>,
    error: <span className="alert-icon">❌</span>,
};

export const Toast: React.FC<ToastProps> = ({
    id,
    title,
    message,
    variant = "info",
    onClose,
    duration = 5000,
}) => {
    React.useEffect(() => {
        const timer = setTimeout(() => onClose(id), duration);
        return () => clearTimeout(timer);
    }, [id, onClose, duration]);

    return (
        <div
            className={clsx(
                "toast",
                variantClasses[variant],
                "animate-fade-in-out"
            )}
            role="alert"
        >
            {iconMap[variant]}
            <div className="alert-content">
                {title && <div className="alert-title">{title}</div>}
                <div className="alert-description">{message}</div>
            </div>
            <button
                className="alert-close"
                aria-label="Close"
                onClick={() => onClose(id)}
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};
