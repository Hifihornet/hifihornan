import { toast } from "sonner";

export function useErrorToast() {
  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
      action: {
        label: "OK",
        onClick: () => {},
      },
    });
  };

  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  };

  return { showError, showSuccess, showInfo };
}
