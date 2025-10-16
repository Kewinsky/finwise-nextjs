import { Delius, Montserrat, JetBrains_Mono, Merriweather, Space_Grotesk } from 'next/font/google';

// Font configurations
export const delius = Delius({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-delius',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
});

export const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
});

// Font configuration helper
export const fontConfig = {
  system: {
    name: 'System',
    className: 'font-system',
    variable: null,
    font: null,
  },
  delius: {
    name: 'Delius',
    className: delius.className,
    variable: delius.variable,
    font: delius,
  },
  montserrat: {
    name: 'Montserrat',
    className: montserrat.className,
    variable: montserrat.variable,
    font: montserrat,
  },
  jetbrainsMono: {
    name: 'Console',
    className: jetbrainsMono.className,
    variable: jetbrainsMono.variable,
    font: jetbrainsMono,
  },
  merriweather: {
    name: 'Merriweather',
    className: merriweather.className,
    variable: merriweather.variable,
    font: merriweather,
  },
  spaceGrotesk: {
    name: 'Space Grotesk',
    className: spaceGrotesk.className,
    variable: spaceGrotesk.variable,
    font: spaceGrotesk,
  },
} as const;

export type FontKey = keyof typeof fontConfig;

// Helper function to get font configuration
export function getFontConfig(fontKey: FontKey) {
  return fontConfig[fontKey];
}

// Helper function to get all available fonts
export function getAvailableFonts() {
  return Object.entries(fontConfig).map(([key, config]) => ({
    value: key,
    label: config.name,
  }));
}

// Helper function to apply font to document
export function applyFont(fontKey: FontKey) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Remove all font classes
  Object.values(fontConfig).forEach((config) => {
    if (config.className) {
      root.classList.remove(config.className);
    }
  });

  // Add selected font
  const selectedFont = fontConfig[fontKey] || fontConfig.delius;
  if (selectedFont && selectedFont.className) {
    root.classList.add(selectedFont.className);
  }
}

// Helper function to get font CSS variables for layout
export function getFontVariables() {
  return [
    delius.variable,
    montserrat.variable,
    jetbrainsMono.variable,
    merriweather.variable,
    spaceGrotesk.variable,
  ].join(' ');
}
