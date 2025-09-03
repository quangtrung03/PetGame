import React, { memo, useMemo, useCallback } from 'react';

/**
 * Performance optimization utilities for React components
 */

// Higher-order component for memoization with custom comparison
export const withMemo = (Component, propsAreEqual = null) => {
  return memo(Component, propsAreEqual);
};

// Custom hooks for performance optimization
export const useStableCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

export const useStableMemo = (factory, deps) => {
  return useMemo(factory, deps);
};

// Optimized component wrapper for frequent re-renders
export const OptimizedComponent = ({ children, shouldUpdate = () => true, ...props }) => {
  return memo(({ children, ...restProps }) => {
    return typeof children === 'function' ? children(restProps) : children;
  }, (prevProps, nextProps) => {
    return !shouldUpdate(prevProps, nextProps);
  })({ children, ...props });
};

// Performance monitoring component
export const PerformanceMonitor = ({ name, children }) => {
  const renderStart = performance.now();
  
  React.useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;
    
    if (renderTime > 16) { // 60fps threshold
      console.warn(`⚠️ Slow render: ${name} took ${renderTime.toFixed(2)}ms`);
    }
  });

  return children;
};

// Lazy loading wrapper with error boundary
export const LazyWrapper = ({ 
  children, 
  fallback = <div className="animate-pulse">Loading...</div>,
  errorFallback = <div className="text-red-500">Failed to load component</div>
}) => {
  return (
    <React.Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </React.Suspense>
  );
};

// Simple error boundary for lazy components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Optimized list component for large datasets
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleItems = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    
    return items.slice(Math.max(0, start - overscan), end).map((item, index) => ({
      item,
      index: start + index,
      top: (start + index) * itemHeight
    }));
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isIntersecting];
};

// Optimized image component with lazy loading
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PC9zdmc+',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [imageRef, isInView] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  React.useEffect(() => {
    if (isInView && src && imageSrc === placeholder) {
      const img = new Image();
      img.onload = () => setImageSrc(src);
      img.src = src;
    }
  }, [isInView, src, imageSrc, placeholder]);

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${imageSrc === placeholder ? 'opacity-50' : 'opacity-100'} ${className}`}
      loading="lazy"
      {...props}
    />
  );
});

// Debounced input hook
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default {
  withMemo,
  useStableCallback,
  useStableMemo,
  OptimizedComponent,
  PerformanceMonitor,
  LazyWrapper,
  VirtualizedList,
  useIntersectionObserver,
  OptimizedImage,
  useDebouncedValue
};
