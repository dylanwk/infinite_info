import { useState, useCallback } from 'react';

function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T | ((prevState: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
     if (typeof window === 'undefined') {
       return defaultValue;
     }
     try {
       const storedValue = localStorage.getItem(key);
       return storedValue ? JSON.parse(storedValue) : defaultValue;
     } catch (error) {
       console.error(`Error reading localStorage key “${key}”:`, error);
       return defaultValue;
     }
  });

  // Debounce localStorage writes slightly for performance if state changes rapidly (unnessesary but nice)
  const debouncedWrite = useCallback(
    debounce((value: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error writing localStorage key “${key}”:`, error);
      }
    }, 200),
    [key]
  );


  const setPersistentState = (value: T | ((prevState: T) => T)) => {
    const valueToStore = value instanceof Function ? value(state) : value;
    setState(valueToStore);
    debouncedWrite(valueToStore);
  };

   // debounce function
  function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
      let timeoutId: NodeJS.Timeout | null = null;
      return (...args: Parameters<F>): void => {
          if (timeoutId) {
              clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => func(...args), waitFor);
      };
  }


  return [state, setPersistentState];
}

export default usePersistentState;