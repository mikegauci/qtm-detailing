"use client";

import { useCallback, useState } from "react";

export function useImageLoadError() {
  const [hasError, setHasError] = useState(false);

  const onError = useCallback(() => {
    setHasError(true);
  }, []);

  const reset = useCallback(() => {
    setHasError(false);
  }, []);

  return { hasError, onError, reset };
}
