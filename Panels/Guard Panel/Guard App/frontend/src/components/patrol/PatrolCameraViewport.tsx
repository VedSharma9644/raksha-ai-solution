import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import { showAlert } from '../../alerts/appAlert';
import {
  intervalCheckinAttendance,
  punchInAttendance,
  punchOutAttendance,
} from '../../api/guard-api';
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
    setLastKnownLocation,
    setCameraUnlocked,
    patrolMode,
  } = useGuardAppNavigation();
  const isPunchOut = patrolMode === 'punch_out';
  const isIntervalCheckin = patrolMode === 'interval_checkin';
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!cameraUnlocked) {
      showAlert('Camera locked', 'Complete the site geofence check on Home first.', [
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

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        showAlert(
          'Camera permission',
          'Allow camera access to capture your attendance selfie.',
        );
        return;
      }
    }

    if (!cameraRef.current || !cameraReady) {
      showAlert('Camera', 'Camera is still starting. Try again in a moment.');
      return;
    }

    setSubmitting(true);

    try {
      const locationPermission =
        await Location.requestForegroundPermissionsAsync();
      if (!locationPermission.granted) {
        showAlert(
          'Location required',
          'Enable GPS to capture attendance with a fresh site location.',
          [{ text: 'OK', onPress: goBack }],
        );
        setCameraUnlocked(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracyMeters = position.coords.accuracy ?? 5;
      setLastKnownLocation({ lat, lng, accuracyMeters });

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
      const payload = {
        lat,
        lng,
        accuracyMeters,
        selfieUri: compressed.uri,
        selfieBase64: compressed.base64,
      };
      const result = isPunchOut
        ? await punchOutAttendance(authToken, payload)
        : isIntervalCheckin
          ? await intervalCheckinAttendance(authToken, payload)
          : await punchInAttendance(authToken, payload);

      openAttendanceMarked(result);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : isPunchOut
            ? 'Punch-out failed.'
            : isIntervalCheckin
              ? 'Interval check-in failed.'
              : 'Punch-in failed.';
      showAlert('Attendance', message);
    } finally {
      setSubmitting(false);
    }
  }, [
    authToken,
    cameraReady,
    cameraUnlocked,
    goBack,
    isIntervalCheckin,
    isPunchOut,
    openAttendanceMarked,
    permission?.granted,
    requestPermission,
    setCameraUnlocked,
    setLastKnownLocation,
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
            : isIntervalCheckin
              ? 'Allow the camera to capture your interval check-in selfie.'
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
            : isIntervalCheckin
              ? 'Interval check-in selfie • Must be inside site geofence • No gallery upload'
              : patrolSessionDefaults.securityNotice}
        </Text>
        <Pressable
          accessibilityLabel={
            isPunchOut
              ? 'Capture end shift photo'
              : isIntervalCheckin
                ? 'Capture interval check-in photo'
                : 'Capture attendance punch photo'
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
                  : isIntervalCheckin
                    ? 'Capture & Check In'
                    : 'Capture & Punch In'
                : 'Starting camera…'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
