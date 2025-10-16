"use client";
import React, { createContext, useContext, useCallback, useState } from "react";
import { Toast, ToastVariant } from "./Toast";

export interface ToastItem {
    id: string;
    message: string;
    title?: string;
    variant: ToastVariant;
    duration?: number;
}

interface ToastContextType {
    showToast: (
        message: string,
        variant?: ToastVariant,
        duration?: number,
        title?: string
    ) => void;
    showSuccess: (message: string, duration?: number, title?: string) => void;
    showError: (message: string, duration?: number, title?: string) => void;
    showWarning: (message: string, duration?: number, title?: string) => void;
    showInfo: (message: string, duration?: number, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
    return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, variant: ToastVariant = "info", duration = 5000, title?: string) => {
            const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            setToasts((prev) => [
                ...prev,
                { id, message, variant, duration, title },
            ]);
        },
        []
    );

    const showSuccess = useCallback((message: string, duration?: number, title?: string) => {
        showToast(message, "success", duration, title);
    }, [showToast]);
    const showError = useCallback((message: string, duration?: number, title?: string) => {
        showToast(message, "error", duration, title);
    }, [showToast]);
    const showWarning = useCallback((message: string, duration?: number, title?: string) => {
        showToast(message, "warning", duration, title);
    }, [showToast]);
    const showInfo = useCallback((message: string, duration?: number, title?: string) => {
        showToast(message, "info", duration, title);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
            {children}
            <div className="toast-container fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-md">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
