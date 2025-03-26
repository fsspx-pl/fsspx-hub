import { VestmentColor } from '@/feast';

export const vestmentColorToTailwind = (color: VestmentColor): string => {
  const colorMap: Record<VestmentColor, string> = {
    [VestmentColor.WHITE]: 'text-black',
    [VestmentColor.RED]: 'text-red-500',
    [VestmentColor.VIOLET]: 'text-purple-500',
    [VestmentColor.GREEN]: 'text-green-500',
    [VestmentColor.BLACK]: 'text-black',
  };
  return colorMap[color];
};
