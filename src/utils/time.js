/**
 * Utility functions for formatting relative time and date comparisons.
 */

export function getRelativeTimeString(dateStr, mounted = true) {
  if (!dateStr) return 'Never'
  
  // If not mounted (server-side pre-render), return a simple locale date string to avoid hydration mismatches
  if (!mounted) {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'Never'
      return date.toLocaleDateString()
    } catch (e) {
      return 'Never'
    }
  }

  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    
    if (diffMs < 0) return 'Just now'
    
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays}d ago`
    
    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths < 12) return `${diffMonths}mo ago`
    
    return `${Math.floor(diffMonths / 12)}y ago`
  } catch (e) {
    return 'Never'
  }
}
