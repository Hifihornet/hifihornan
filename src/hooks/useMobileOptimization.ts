import { useState, useEffect } from 'react';

export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getResponsiveClass = (mobile: string, tablet?: string, desktop?: string) => {
    if (isMobile) return mobile;
    if (isTablet && tablet) return tablet;
    if (desktop) return desktop;
    return mobile;
  };

  const getResponsiveValue = <T,>(mobile: T, tablet?: T, desktop?: T): T => {
    if (isMobile) return mobile;
    if (isTablet && tablet !== undefined) return tablet;
    if (desktop !== undefined) return desktop;
    return mobile;
  };

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize,
    getResponsiveClass,
    getResponsiveValue,
  };
}
