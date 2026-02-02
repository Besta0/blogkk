import { useState, useRef, useEffect, memo, CSSProperties } from 'react'
import { motion } from 'framer-motion'

interface LazyImageProps {
  src: string
  alt: string
  placeholderSrc?: string
  aspectRatio?: number
  className?: string
  style?: CSSProperties
  onLoadComplete?: () => void
}

/**
 * LazyImage component with native lazy loading and intersection observer fallback.
 * Provides smooth loading transitions and placeholder support.
 * 
 * Features:
 * - Native lazy loading with loading="lazy"
 * - Intersection Observer fallback for older browsers
 * - Smooth fade-in animation on load
 * - Optional placeholder/blur hash support
 * - Maintains aspect ratio during loading
 */
const LazyImage = memo(function LazyImage({
  src,
  alt,
  placeholderSrc,
  aspectRatio,
  className = '',
  style,
  onLoadComplete,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Use Intersection Observer for lazy loading
  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    // Check if native lazy loading is supported
    if ('loading' in HTMLImageElement.prototype) {
      setIsInView(true)
      return
    }

    // Fallback to Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    )

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoadComplete?.()
  }

  const handleError = () => {
    setHasError(true)
  }

  // Default placeholder - a subtle gradient
  const defaultPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E'

  const containerStyle = aspectRatio
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : undefined

  return (
    <div
      className={`relative overflow-hidden ${aspectRatio ? 'w-full' : ''}`}
      style={containerStyle}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${
            aspectRatio ? '' : className
          }`}
          style={
            placeholderSrc
              ? {
                  backgroundImage: `url(${placeholderSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
      )}

      {/* Error state */}
      {hasError && (
        <div
          className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${
            aspectRatio ? '' : className
          }`}
        >
          <span className="text-gray-400 dark:text-gray-500 text-sm">
            图片加载失败
          </span>
        </div>
      )}

      {/* Actual image */}
      <motion.img
        ref={imgRef}
        src={isInView ? src : defaultPlaceholder}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`${aspectRatio ? 'absolute inset-0 w-full h-full object-cover' : ''} ${className}`}
        style={style}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
})

export default LazyImage
