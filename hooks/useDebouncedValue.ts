import { useEffect, useState } from "react";

/**
 * Generic debounce hook
 * Returns a debounced version of the input value
 */
export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
