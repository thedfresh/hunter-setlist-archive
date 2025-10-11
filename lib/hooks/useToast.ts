import { useToastContext } from "../../components/ui/ToastProvider";

export function useToast() {
    const ctx = useToastContext();
    return {
        showToast: ctx.showToast,
        showSuccess: ctx.showSuccess,
        showError: ctx.showError,
        showWarning: ctx.showWarning,
        showInfo: ctx.showInfo,
    };
}
