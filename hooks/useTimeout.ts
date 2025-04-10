import { useState, useEffect, useRef, useCallback } from 'react';
import { INACTIVITY_TIMEOUT_MS } from '@/lib/constants';

interface UseTimeoutProps {
    timeoutMs?: number;
    onTimeout?: () => void;
    onContinue?: () => void;
}

export const useTimeout = ({
    timeoutMs = INACTIVITY_TIMEOUT_MS,
    onTimeout,
    onContinue
}: UseTimeoutProps = {}) => {
    const [isTimedOut, setIsTimedOut] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityTimeRef = useRef<number>(Date.now());

    const handleContinue = useCallback(() => {

        setIsTimedOut(false);
        lastActivityTimeRef.current = Date.now();

        if (onContinue) {
            onContinue();
        }
    }, [onContinue]);

    // for managing the interval and listeners
    useEffect(() => {
        lastActivityTimeRef.current = Date.now();

        // --- Activity Tracking ---
        const trackActivity = () => {
            if (!isTimedOut) {
                lastActivityTimeRef.current = Date.now();
            }
        };
        const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        activityEvents.forEach(event => window.addEventListener(event, trackActivity));

        // --- Interval Check ---
        const startInterval = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            intervalRef.current = setInterval(() => {
                if (Date.now() - lastActivityTimeRef.current > timeoutMs) {
                    setIsTimedOut(currentState => {
                        if (!currentState) {
                            console.log('Inactivity timeout reached.');
                            if (onTimeout) {
                                onTimeout();
                            }
                            if (intervalRef.current) {
                                console.log('Clearing interval due to timeout.');
                                clearInterval(intervalRef.current);
                                intervalRef.current = null;
                            }
                            return true; 
                        }
                        return currentState; 
                    });
                }
            }, 10000); // check every 10 seconds
        }

        if (!isTimedOut) {
            startInterval();
        }


        // --- Cleanup ---
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            activityEvents.forEach(event => window.removeEventListener(event, trackActivity));
        };
    }, [timeoutMs, onTimeout, isTimedOut]);

    return { isTimedOut, handleContinue };
};