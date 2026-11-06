import { Text } from 'react-native';

import { sharedSectionHeadingStyles as styles } from '../../styles/shared-section-heading.styles';

type SectionHeadingProps = {
  title: string;
};

export function SectionHeading({ title }: SectionHeadingProps) {
  return <Text style={styles.title}>{title}</Text>;
}
