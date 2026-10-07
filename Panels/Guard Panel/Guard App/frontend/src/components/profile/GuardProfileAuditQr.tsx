import Svg, { Rect } from 'react-native-svg';

import { appColors } from '../../theme';

type GuardProfileAuditQrProps = {
  size?: number;
};

export function GuardProfileAuditQr({ size = 64 }: GuardProfileAuditQrProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill={appColors.primary}>
      <Rect x="10" y="10" width="28" height="28" rx="4" fill={appColors.primary} />
      <Rect x="16" y="16" width="16" height="16" rx="2" fill="#ffffff" />
      <Rect x="20" y="20" width="8" height="8" fill={appColors.primary} />
      <Rect x="62" y="10" width="28" height="28" rx="4" fill={appColors.primary} />
      <Rect x="68" y="16" width="16" height="16" rx="2" fill="#ffffff" />
      <Rect x="72" y="20" width="8" height="8" fill={appColors.primary} />
      <Rect x="10" y="62" width="28" height="28" rx="4" fill={appColors.primary} />
      <Rect x="16" y="68" width="16" height="16" rx="2" fill="#ffffff" />
      <Rect x="20" y="72" width="8" height="8" fill={appColors.primary} />
      <Rect x="44" y="12" width="10" height="10" rx="1" fill={appColors.primary} />
      <Rect x="44" y="28" width="10" height="24" rx="1" fill={appColors.primary} />
      <Rect x="12" y="44" width="24" height="10" rx="1" fill={appColors.primary} />
      <Rect x="62" y="44" width="26" height="10" rx="1" fill={appColors.primary} />
      <Rect x="44" y="62" width="14" height="14" rx="1" fill={appColors.primary} />
      <Rect x="64" y="64" width="12" height="24" rx="1" fill={appColors.primary} />
      <Rect x="80" y="74" width="10" height="14" rx="1" fill={appColors.primary} />
    </Svg>
  );
}
