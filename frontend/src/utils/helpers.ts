// src/utils/helpers.ts
export const avatarColors = ["#4A90D9", "#6EC6A0", "#F5A623", "#9B59B6", "#E74C3C"];

export const getAvatarColor = (initials: string) => 
  avatarColors[initials.charCodeAt(0) % avatarColors.length];