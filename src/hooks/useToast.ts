import { useEffect, useRef, useState } from "react";

const TOAST_VISIBLE_DURATION = 1600;

export function useToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(hideTimeout.current), []);

  const showToast = (message: string) => {
    clearTimeout(hideTimeout.current);
    setToastMessage(message);
    hideTimeout.current = setTimeout(
      () => setToastMessage(null),
      TOAST_VISIBLE_DURATION,
    );
  };

  return { toastMessage, showToast };
}
