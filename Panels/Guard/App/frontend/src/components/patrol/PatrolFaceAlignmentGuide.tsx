import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { patrolSessionDefaults } from '../../constants/patrol-session-defaults';
import { appColors } from '../../theme';
import { patrolFaceAlignmentGuideStyles as styles } from '../../styles/patrol-face-alignment-guide.styles';

type PatrolFaceAlignmentGuideProps = {
  guideText?: string;
};

export function PatrolFaceAlignmentGuide({
  guideText = patrolSessionDefaults.faceGuideText,
}: PatrolFaceAlignmentGuideProps) {
  return (
    <View style={styles.section}>
      <View style={styles.frame}>
        <Svg viewBox="0 0 260 320" style={styles.svg}>
          <Ellipse
            cx="130"
            cy="160"
            rx="112"
            ry="142"
            stroke="#FFFFFF"
            strokeOpacity={0.85}
            strokeWidth={2.5}
            strokeDasharray="10 8"
            fill="none"
          />
          <Ellipse
            cx="130"
            cy="160"
            rx="118"
            ry="148"
            stroke={appColors.primaryFixedDim}
            strokeOpacity={0.4}
            strokeWidth={2}
            fill="none"
          />
          <Path
            d="M 40 50 L 25 50 L 25 65"
            stroke={appColors.primaryFixed}
            strokeLinecap="round"
            strokeWidth={3.5}
            fill="none"
          />
          <Path
            d="M 220 50 L 235 50 L 235 65"
            stroke={appColors.primaryFixed}
            strokeLinecap="round"
            strokeWidth={3.5}
            fill="none"
          />
          <Path
            d="M 40 270 L 25 270 L 25 255"
            stroke={appColors.primaryFixed}
            strokeLinecap="round"
            strokeWidth={3.5}
            fill="none"
          />
          <Path
            d="M 220 270 L 235 270 L 235 255"
            stroke={appColors.primaryFixed}
            strokeLinecap="round"
            strokeWidth={3.5}
            fill="none"
          />
        </Svg>

        <View style={styles.promptBox}>
          <MaterialIcons name="face" size={28} color={appColors.primaryFixed} />
          <Text style={styles.promptText}>{guideText}</Text>
        </View>
      </View>
    </View>
  );
}
