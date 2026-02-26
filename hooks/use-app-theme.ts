import { AppPalette, Colors, TextLineHeights, TextSizes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useAppTheme() {
  const scheme = useColorScheme() ?? 'dark';
  const isDark = scheme === 'dark';

  return {
    scheme,
    isDark,
    colors: Colors[scheme],
    palette: AppPalette[scheme],
    textSizes: TextSizes,
    lineHeights: TextLineHeights,
  };
}
