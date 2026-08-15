// src/utils/rtl.utils.ts

export const RTL_LANGUAGES = ['ar'];
export const LTR_LANGUAGES = ['fr', 'en'];
export const SUPPORTED_LANGUAGES = ['fr', 'en', 'ar'];
export const DEFAULT_LANGUAGE = 'fr';

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language);
}

export function getDirection(language: string): 'rtl' | 'ltr' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

// CSS logical properties helper
export function getLogicalProperty(
  property: 'margin' | 'padding' | 'border',
  side: 'left' | 'right' | 'start' | 'end',
  value: string,
  isRTL: boolean
): Record<string, string> {
  const mapping: Record<string, Record<string, string>> = {
    margin: {
      left: isRTL ? 'marginRight' : 'marginLeft',
      right: isRTL ? 'marginLeft' : 'marginRight',
      start: 'marginInlineStart',
      end: 'marginInlineEnd',
    },
    padding: {
      left: isRTL ? 'paddingRight' : 'paddingLeft',
      right: isRTL ? 'paddingLeft' : 'paddingRight',
      start: 'paddingInlineStart',
      end: 'paddingInlineEnd',
    },
    border: {
      left: isRTL ? 'borderRight' : 'borderLeft',
      right: isRTL ? 'borderLeft' : 'borderRight',
    },
  };

  const prop = mapping[property]?.[side];
  return prop ? { [prop]: value } : {};
}

// Flip icon for RTL
export function flipIcon(
  iconName: string,
  isRTL: boolean
): string {
  if (!isRTL) return iconName;

  const flipMap: Record<string, string> = {
    'ChevronLeft': 'ChevronRight',
    'ChevronRight': 'ChevronLeft',
    'ArrowLeft': 'ArrowRight',
    'ArrowRight': 'ArrowLeft',
    'ChevronDown': 'ChevronUp',
    'ChevronUp': 'ChevronDown',
  };

  return flipMap[iconName] || iconName;
}

// Get CSS direction class for Tailwind
export function getDirectionClass(isRTL: boolean): 'rtl' | 'ltr' {
  return isRTL ? 'rtl' : 'ltr';
}