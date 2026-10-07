import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, View } from 'react-native';

import { DEMO_SELFIE_BASE64, punchInAttendance } from '../../api/guard-api';
import { brandAssets } from '../../constants/brand-assets';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { patrolCameraViewportStyles as styles } from '../../styles/patrol-camera-viewport.styles';
import { appColors } from '../../theme';
import { PatrolCameraShutterButton } from './PatrolCameraShutterButton';
import { PatrolCameraTopControls } from './PatrolCameraTopControls';
import { PatrolCaptureSuccessToast } from './PatrolCaptureSuccessToast';
import { PatrolFaceAlignmentGuide } from './PatrolFaceAlignmentGuide';
import { PatrolLiveStatusBadges } from './PatrolLiveStatusBadges';
import { PatrolOfficialPunchWatermark } from './PatrolOfficialPunchWatermark';

export function PatrolCameraViewport() {
  const {
    goBack,
    openAttendanceMarked,
    authToken,
    cameraUnlocked,
    lastKnownLocation,
  } = useGuardAppNavigation();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cameraUnlocked) {
      Alert.alert('Camera locked', 'Complete the site geofence check on Home first.', [
        { text: 'OK', onPress: goBack },
      ]);
    }
  }, [cameraUnlocked, goBack]);

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (!cameraUnlocked || !authToken || submitting) {
      return;
    }

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

    setSubmitting(true);
    setShowSuccessToast(true);

    if (!lastKnownLocation) {
      setSubmitting(false);
      setShowSuccessToast(false);
      Alert.alert(
        'Location required',
        'Verify your site location on Home before capturing a selfie.',
        [{ text: 'OK', onPress: goBack }],
      );
      return;
    }

    const { lat, lng, accuracyMeters } = lastKnownLocation;

    void punchInAttendance(authToken, {
      lat,
      lng,
      accuracyMeters,
      selfieBase64: DEMO_SELFIE_BASE64,
    })
      .then((result) => {
        if (navigateTimeoutRef.current) {
          clearTimeout(navigateTimeoutRef.current);
        }
        navigateTimeoutRef.current = setTimeout(() => {
          setShowSuccessToast(false);
          setSubmitting(false);
          openAttendanceMarked(result);
        }, 700);
      })
      .catch((error: unknown) => {
        setShowSuccessToast(false);
        setSubmitting(false);
        const message = error instanceof Error ? error.message : 'Punch-in failed.';
        Alert.alert('Attendance', message);
      });
  }, [
    authToken,
    cameraUnlocked,
    flashOpacity,
    goBack,
    lastKnownLocation,
    openAttendanceMarked,
    submitting,
  ]);

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
          {submitting ? (
            <ActivityIndicator
              size="large"
              color={appColors.onPrimary}
              style={{ marginVertical: 16 }}
            />
          ) : (
            <PatrolCameraShutterButton onCapturePress={handleCapture} />
          )}
          <PatrolCaptureSuccessToast visible={showSuccessToast} />
        </View>
      </View>
    </View>
  );
}
