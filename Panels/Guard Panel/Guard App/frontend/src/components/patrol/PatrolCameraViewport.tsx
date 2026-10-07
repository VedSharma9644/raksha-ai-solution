import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, View } from 'react-native';

import { brandAssets } from '../../constants/brand-assets';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { patrolCameraViewportStyles as styles } from '../../styles/patrol-camera-viewport.styles';
import { PatrolCameraShutterButton } from './PatrolCameraShutterButton';
import { PatrolCameraTopControls } from './PatrolCameraTopControls';
import { PatrolCaptureSuccessToast } from './PatrolCaptureSuccessToast';
import { PatrolFaceAlignmentGuide } from './PatrolFaceAlignmentGuide';
import { PatrolLiveStatusBadges } from './PatrolLiveStatusBadges';
import { PatrolOfficialPunchWatermark } from './PatrolOfficialPunchWatermark';

export function PatrolCameraViewport() {
  const { goBack, openAttendanceMarked } = useGuardAppNavigation();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setShowSuccessToast(true);

    if (navigateTimeoutRef.current) {
      clearTimeout(navigateTimeoutRef.current);
    }

    navigateTimeoutRef.current = setTimeout(() => {
      setShowSuccessToast(false);
      openAttendanceMarked();
    }, 900);
  }, [flashOpacity, openAttendanceMarked]);

  return (
    <View style={styles.viewport}>
      <Image
        source={{ uri: brandAssets.patrolCameraPreviewUri }}
        style={styles.previewImage}
        resizeMode="cover"
      />

      <LinearGradient
        colors={['rgba(33, 49, 69, 0.8)', 'transparent', 'rgba(33, 49, 69, 0.95)']}
        locations={[0, 0.45, 1]}
        style={styles.gradientOverlay}
      />

      <Animated.View pointerEvents="none" style={[styles.captureFlash, { opacity: flashOpacity }]} />

      <View style={styles.layeredContent}>
        <PatrolCameraTopControls
          onCancelPress={goBack}
          flashEnabled={flashEnabled}
          onToggleFlash={() => setFlashEnabled((current) => !current)}
          onFlipCamera={() => undefined}
        />

        <View>
          <PatrolFaceAlignmentGuide />
          <PatrolLiveStatusBadges />
        </View>

        <View>
          <PatrolOfficialPunchWatermark />
          <PatrolCameraShutterButton onCapturePress={handleCapture} />
          <PatrolCaptureSuccessToast visible={showSuccessToast} />
        </View>
      </View>
    </View>
  );
}
