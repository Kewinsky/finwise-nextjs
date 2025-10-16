export function generateInitials(name?: string, email?: string): string {
  // If name exists and is not empty/whitespace
  if (name && name.trim()) {
    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    // Return max 2 characters
    return initials.slice(0, 2);
  }

  // Fallback to email first character
  if (email) {
    return email.charAt(0).toUpperCase();
  }

  // Final fallback
  return 'U';
}

export function getDisplayName(name?: string, email?: string): string {
  if (name && name.trim()) {
    return name.trim();
  }

  if (email) {
    return email;
  }

  return 'User';
}
