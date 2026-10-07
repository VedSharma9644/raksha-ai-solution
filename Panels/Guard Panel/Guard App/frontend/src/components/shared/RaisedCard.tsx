import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { sharedRaisedCardStyles as styles } from '../../styles/shared-raised-card.styles';

type RaisedCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function RaisedCard({ children, style }: RaisedCardProps) {
  return <View style={[styles.base, style]}>{children}</View>;
}
