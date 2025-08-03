import type { Team } from '../types/index';

// Apply team-specific CSS variables for dynamic theming
export function applyTeamTheme(team: Team | null) {
  if (!team) {
    // Reset to default theme
    document.documentElement.style.removeProperty('--team-primary');
    document.documentElement.style.removeProperty('--team-secondary');
    document.documentElement.style.removeProperty('--team-primary-rgb');
    document.documentElement.style.removeProperty('--team-secondary-rgb');
    return;
  }

  // Convert hex to RGB for opacity support
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  };

  // Set CSS variables
  document.documentElement.style.setProperty('--team-primary', team.primaryColor);
  document.documentElement.style.setProperty('--team-secondary', team.secondaryColor);
  document.documentElement.style.setProperty('--team-primary-rgb', hexToRgb(team.primaryColor));
  document.documentElement.style.setProperty('--team-secondary-rgb', hexToRgb(team.secondaryColor));

  // Add team-specific class for additional styling
  document.body.className = `team-${team.id}`;
}

// Get contrast color for text on team color backgrounds
export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Generate team-specific gradient
export function getTeamGradient(team: Team, direction: 'to-r' | 'to-b' = 'to-r'): string {
  return `linear-gradient(${direction === 'to-r' ? 'to right' : 'to bottom'}, ${team.primaryColor}, ${team.secondaryColor})`;
}

// Team-specific component classes
export const teamClasses = {
  header: 'bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)]',
  headerText: 'text-white drop-shadow-md',
  primaryBg: 'bg-[var(--team-primary)]',
  secondaryBg: 'bg-[var(--team-secondary)]',
  primaryText: 'text-[var(--team-primary)]',
  secondaryText: 'text-[var(--team-secondary)]',
  primaryBorder: 'border-[var(--team-primary)]',
  secondaryBorder: 'border-[var(--team-secondary)]',
  primaryButton: 'bg-[var(--team-primary)] hover:bg-[var(--team-primary)]/90 text-white',
  secondaryButton: 'bg-[var(--team-secondary)] hover:bg-[var(--team-secondary)]/90',
  primaryBadge: 'bg-[var(--team-primary)]/10 text-[var(--team-primary)] border border-[var(--team-primary)]/20',
  secondaryBadge: 'bg-[var(--team-secondary)]/10 text-[var(--team-secondary)] border border-[var(--team-secondary)]/20',
  gradientBg: 'bg-gradient-to-br from-[var(--team-primary)] to-[var(--team-secondary)]',
  gradientText: 'bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)] bg-clip-text text-transparent',
  hoverPrimary: 'hover:bg-[var(--team-primary)]/10 hover:border-[var(--team-primary)]',
  hoverSecondary: 'hover:bg-[var(--team-secondary)]/10 hover:border-[var(--team-secondary)]',
  focusPrimary: 'focus:ring-[var(--team-primary)] focus:border-[var(--team-primary)]',
  focusSecondary: 'focus:ring-[var(--team-secondary)] focus:border-[var(--team-secondary)]',
};

// Get team-appropriate accent color (for highlights, badges, etc)
export function getTeamAccentColor(team: Team): string {
  // Some teams have specific accent colors based on their identity
  const accentOverrides: Record<string, string> = {
    'michigan': '#FFCB05', // Maize
    'oregon': '#FEE123', // Yellow
    'lsu': '#FDD023', // Gold
    'notre-dame': '#C99700', // Gold
    'florida': '#FA4616', // Orange
    'tennessee': '#FF8200', // Orange
    'texas': '#BF5700', // Burnt Orange
  };

  return accentOverrides[team.id] || team.secondaryColor;
}