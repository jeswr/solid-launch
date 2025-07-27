// Generate a deterministic color based on app name
export function generateAppColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

// Generate initials from app name
export function generateInitials(name: string): string {
  const words = name.split(' ').filter(word => word.length > 0);
  if (words.length === 0) return '?';
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

// Category icons mapping
export const categoryIcons: Record<string, string> = {
  'Pod Management': '📁',
  'Media & Entertainment': '🎬',
  'Content & Publishing': '📝',
  'Productivity': '⚡',
  'Development Tools': '🛠️',
  'Social & Communication': '💬',
  'Games': '🎮',
  'Education': '🎓',
  'Finance': '💰',
  'Health': '🏥',
  'Other': '📱'
};

// Get icon for category
export function getCategoryIcon(category: string): string {
  return categoryIcons[category] || categoryIcons['Other'];
}

// Check if URL is valid
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}