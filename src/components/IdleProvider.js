"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';

const IDLE_5_MIN = 5 * 60 * 1000;
const IDLE_48_HOURS = 48 * 60 * 60 * 1000;

export default function IdleProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const lastActivityRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    if (!lastActivityRef.current) {
        const stored = localStorage.getItem('kaeluma_last_activity');
        lastActivityRef.current = stored ? parseInt(stored, 10) : Date.now();
    }
    
    const checkIdle = async () => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;
      
      // Log out after 48 hours of total inactivity anywhere on the site
      if (idleTime > IDLE_48_HOURS) {
         localStorage.removeItem('kaeluma_last_activity');
         await supabase.auth.signOut();
         router.push('/login');
         return;
      }
      
      // Return to dashboard after 5 mins of inactivity on protected routes (parent or kid)
      const isProtectedPage = pathname.startsWith('/parent') || pathname.startsWith('/kid');
      if (isProtectedPage && idleTime > IDLE_5_MIN) {
         router.push('/dashboard');
      }
    };
    
    // Check every 30 seconds
    timerRef.current = setInterval(checkIdle, 30000);
    // Initial check on mount/route change
    checkIdle();

    const handleUserActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      localStorage.setItem('kaeluma_last_activity', now.toString());
    };

    // Throttle the storage hits slightly by using passive listeners
    window.addEventListener('scroll', handleUserActivity, { passive: true });
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [pathname, router]);

  return <>{children}</>;
}
