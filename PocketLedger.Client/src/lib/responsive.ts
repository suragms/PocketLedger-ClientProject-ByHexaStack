export const BREAKPOINTS = {
  mobile: 320,
  mobileLg: 414,
  tabletSm: 640,
  tablet: 768,
  tabletLg: 1024,
  desktop: 1280,
  desktopLg: 1536,
} as const;

export const SIDEBAR = {
  expanded: 256,
  collapsed: 80,
} as const;

export const MOBILE_NAV_HEIGHT = 64;
export const HEADER_HEIGHT = 64;

export function isMobileWidth(width: number): boolean {
  return width < BREAKPOINTS.tablet;
}

export function isTabletWidth(width: number): boolean {
  return width >= BREAKPOINTS.tabletSm && width < BREAKPOINTS.desktop;
}

export function isDesktopWidth(width: number): boolean {
  return width >= BREAKPOINTS.desktop;
}
