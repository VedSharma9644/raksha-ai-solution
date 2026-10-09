import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';

import { punchInAttendance, punchOutAttendance } from '../../api/guard-api';
import { patrolSessionDefaults } from '../../constants/patrol-session-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { patrolCameraViewportStyles as styles } from '../../styles/patrol-camera-viewport.styles';
import { appColors } from '../../theme';
import { compressAttendanceSelfie } from '../../utils/compress-attendance-selfie';
import { PatrolFaceAlignmentGuide } from './PatrolFaceAlignmentGuide';
import { PatrolLiveStatusBadges } from './PatrolLiveStatusBadges';

export function PatrolCameraViewport() {
  const {
    goBack,
    openAttendanceMarked,
    authToken,
    cameraUnlocked,
    lastKnownLocation,
    patrolMode,
  } = useGuardAppNavigation();
  const isPunchOut = patrolMode === 'punch_out';
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!cameraUnlocked) {
      Alert.alert('Camera locked', 'Complete the site geofence check on Home first.', [
        { text: 'OK', onPress: goBack },
      ]);
    }
  }, [cameraUnlocked, goBack]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = useCallback(async () => {
    if (!cameraUnlocked || !authToken || submitting) {
      return;
    }

    if (!lastKnownLocation) {
      Alert.alert(
        'Location required',
        'Verify your site location on Home before capturing a selfie.',
        [{ text: 'OK', onPress: goBack }],
      );
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera permission',
          'Allow camera access to capture your attendance selfie.',
        );
        return;
      }
    }

    if (!cameraRef.current || !cameraReady) {
      Alert.alert('Camera', 'Camera is still starting. Try again in a moment.');
      return;
    }

    setSubmitting(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        exif: false,
        shutterSound: false,
      });

      if (!photo?.uri) {
        throw new Error('Could not capture selfie. Please try again.');
      }

      const compressed = await compressAttendanceSelfie(photo.uri);
      const { lat, lng, accuracyMeters } = lastKnownLocation;
      const payload = {
        lat,
        lng,
        accuracyMeters,
        selfieUri: compressed.uri,
        selfieBase64: compressed.base64,
      };
      const result = isPunchOut
        ? await punchOutAttendance(authToken, payload)
        : await punchInAttendance(authToken, payload);

      openAttendanceMarked(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : isPunchOut
            ? 'Punch-out failed.'
            : 'Punch-in failed.';
      Alert.alert('Attendance', message);
    } finally {
      setSubmitting(false);
    }
  }, [
    authToken,
    cameraReady,
    cameraUnlocked,
    goBack,
    isPunchOut,
    lastKnownLocation,
    openAttendanceMarked,
    permission?.granted,
    requestPermission,
    submitting,
  ]);

  if (!permission) {
    return (
      <View style={[styles.viewport, styles.permissionPane]}>
        <ActivityIndicator size="large" color={appColors.onPrimary} />
        <Text style={styles.permissionBody}>Starting camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.viewport, styles.permissionPane]}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionBody}>
          {isPunchOut
            ? 'Allow the camera to capture your end-of-shift selfie.'
            : 'Allow the camera to capture your live punch-in selfie.'}
        </Text>
        <Pressable
          style={styles.permissionButton}
          onPress={() => {
            void requestPermission();
          }}
        >
          <Text style={styles.permissionButtonLabel}>Allow Camera</Text>
        </Pressable>
        <Pressable onPress={goBack} style={styles.permissionCancel}>
          <Text style={styles.permissionCancelLabel}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.viewport}>
      <View style={styles.previewShell}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flashEnabled ? 'on' : 'off'}
          mirror={facing === 'front'}
          onCameraReady={() => setCameraReady(true)}
          mode="picture"
        />

        <View style={styles.previewOverlay} pointerEvents="box-none">
          <View style={styles.previewTopRow} pointerEvents="box-none">
            <Pressable
              accessibilityLabel="Toggle flash"
              onPress={() => setFlashEnabled((current) => !current)}
              style={styles.roundIconButton}
            >
              <MaterialIcons
                name={flashEnabled ? 'flash-on' : 'flash-off'}
                size={22}
                color={appColors.inverseOnSurface}
              />
            </Pressable>
            <Pressable
              accessibilityLabel="Flip camera"
              onPress={() => {
                setCameraReady(false);
                setFacing((current) => (current === 'front' ? 'back' : 'front'));
              }}
              style={styles.roundIconButton}
            >
              <MaterialIcons
                name="flip-camera-ios"
                size={22}
                color={appColors.inverseOnSurface}
              />
            </Pressable>
          </View>

          <View style={styles.guideBlock} pointerEvents="none">
            <PatrolFaceAlignmentGuide />
            <PatrolLiveStatusBadges />
          </View>
          <View />
        </View>
      </View>

      {/* Footer sits outside CameraView so Android/Expo Go always shows the button */}
      <View style={styles.footer}>
        <Text style={styles.captureHint}>
          {isPunchOut
            ? 'End shift selfie • Must be inside site geofence • No gallery upload'
            : patrolSessionDefaults.securityNotice}
        </Text>
        <Pressable
          accessibilityLabel={
            isPunchOut ? 'Capture end shift photo' : 'Capture attendance punch photo'
          }
          disabled={submitting || !cameraReady}
          onPress={() => {
            void handleCapture();
          }}
          style={({ pressed }) => [
            styles.captureButton,
            (!cameraReady || submitting) && styles.captureButtonDisabled,
            pressed && styles.captureButtonPressed,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={appColors.onPrimary} />
          ) : (
            <MaterialIcons
              name={isPunchOut ? 'logout' : 'photo-camera'}
              size={22}
              color={appColors.onPrimary}
            />
          )}
          <Text style={styles.captureLabel}>
            {submitting
              ? 'Uploading selfie…'
              : cameraReady
                ? isPunchOut
                  ? 'Capture & End Shift'
                  : 'Capture & Punch In'
                : 'Starting camera…'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
