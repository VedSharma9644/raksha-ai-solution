import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import {
  loginScreenDefaults,
  type LoginMode,
} from '../../constants/login-screen-defaults';
import { loginAuthCardStyles as styles } from '../../styles/login-auth-card.styles';
import { appColors } from '../../theme';

type LoginAuthCardProps = {
  isHindi: boolean;
  onVerified: () => void;
};

export function LoginAuthCard({ isHindi, onVerified }: LoginAuthCardProps) {
  const [mode, setMode] = useState<LoginMode>('phone');
  const [credential, setCredential] = useState(loginScreenDefaults.phoneDefault);
  const [otp, setOtp] = useState<string[]>([...loginScreenDefaults.otpInitial]);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState(5);
  const [credentialFocused, setCredentialFocused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(loginScreenDefaults.resendSeconds);
  const otpRefs = useRef<Array<TextInputType | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setCredential(
      nextMode === 'phone' ? loginScreenDefaults.phoneDefault : loginScreenDefaults.idDefault,
    );
  };

  const credentialLabel =
    mode === 'phone'
      ? isHindi
        ? loginScreenDefaults.phoneLabelHindi
        : loginScreenDefaults.phoneLabel
      : isHindi
        ? loginScreenDefaults.idLabelHindi
        : loginScreenDefaults.idLabel;

  const updateOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verify = () => {
    const code = otp.join('');
    if (code.length < 6) {
      const emptyIndex = otp.findIndex((digit) => !digit);
      otpRefs.current[emptyIndex >= 0 ? emptyIndex : 0]?.focus();
      return;
    }
    Alert.alert(loginScreenDefaults.successAlertTitle, loginScreenDefaults.successAlertMessage, [
      { text: 'OK', onPress: onVerified },
    ]);
  };

  const countdownLabel =
    secondsLeft > 0
      ? `00:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`
      : loginScreenDefaults.resendReady;

  return (
    <View style={styles.card}>
      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeButton, mode === 'phone' && styles.modeButtonActive]}
          onPress={() => selectMode('phone')}
        >
          <MaterialIcons
            name="smartphone"
            size={18}
            color={mode === 'phone' ? appColors.onPrimary : appColors.secondary}
          />
          <Text style={[styles.modeLabel, mode === 'phone' && styles.modeLabelActive]}>
            {loginScreenDefaults.modePhoneLabel}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'id' && styles.modeButtonActive]}
          onPress={() => selectMode('id')}
        >
          <MaterialIcons
            name="badge"
            size={18}
            color={mode === 'id' ? appColors.onPrimary : appColors.secondary}
          />
          <Text style={[styles.modeLabel, mode === 'id' && styles.modeLabelActive]}>
            {loginScreenDefaults.modeIdLabel}
          </Text>
        </Pressable>
      </View>

      <View style={styles.fieldGroup}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>{credentialLabel}</Text>
          <Text style={styles.fieldHint}>
            {mode === 'phone' ? loginScreenDefaults.phoneHint : loginScreenDefaults.idHint}
          </Text>
        </View>
        <View style={[styles.inputRow, credentialFocused && styles.inputRowFocused]}>
          {mode === 'phone' ? (
            <View style={styles.phonePrefix}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>
          ) : null}
          <TextInput
            style={styles.textInput}
            value={credential}
            onChangeText={setCredential}
            onFocus={() => setCredentialFocused(true)}
            onBlur={() => setCredentialFocused(false)}
            keyboardType={mode === 'phone' ? 'phone-pad' : 'default'}
            maxLength={mode === 'phone' ? 10 : 14}
            placeholder={
              mode === 'phone'
                ? loginScreenDefaults.phonePlaceholder
                : loginScreenDefaults.idPlaceholder
            }
            placeholderTextColor="rgba(112, 121, 121, 0.6)"
            autoCapitalize={mode === 'phone' ? 'none' : 'characters'}
          />
          {credential.length > 0 ? (
            <Pressable style={styles.clearButton} onPress={() => setCredential('')}>
              <MaterialIcons name="cancel" size={18} color={appColors.outline} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.otpSection}>
        <View style={styles.otpHeader}>
          <View style={styles.otpLabelRow}>
            <MaterialIcons name="lock" size={18} color={appColors.primary} />
            <Text style={styles.otpLabel}>{loginScreenDefaults.otpLabel}</Text>
          </View>
          <View style={styles.autoDetectBadge}>
            <Text style={styles.autoDetectText}>{loginScreenDefaults.otpAutoDetect}</Text>
          </View>
        </View>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={`otp-${index}`}
              ref={(ref) => {
                otpRefs.current[index] = ref;
              }}
              style={[styles.otpBox, focusedOtpIndex === index && styles.otpBoxFocused]}
              value={digit}
              onChangeText={(value) => updateOtpDigit(index, value)}
              onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
              onFocus={() => setFocusedOtpIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              placeholder={index === 5 && !digit ? '•' : undefined}
              placeholderTextColor={appColors.outline}
            />
          ))}
        </View>

        <View style={styles.otpFooter}>
          <View style={styles.resendRow}>
            <MaterialIcons name="schedule" size={15} color={appColors.secondary} />
            <Text style={styles.resendText}>
              {loginScreenDefaults.resendPrefix}{' '}
              <Text style={styles.resendCountdown}>{countdownLabel}</Text>
            </Text>
          </View>
          <Pressable
            style={styles.callOtpButton}
            onPress={() =>
              Alert.alert(
                loginScreenDefaults.voiceOtpAlertTitle,
                loginScreenDefaults.voiceOtpAlertMessage,
              )
            }
          >
            <MaterialIcons name="phone-in-talk" size={15} color={appColors.primary} />
            <Text style={styles.callOtpLabel}>{loginScreenDefaults.callOtpLabel}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.verifyButton, pressed && styles.verifyButtonPressed]}
        onPress={verify}
      >
        <MaterialIcons name="login" size={22} color={appColors.onPrimary} />
        <Text style={styles.verifyLabel}>
          {isHindi ? loginScreenDefaults.verifyLabelHindi : loginScreenDefaults.verifyLabel}
        </Text>
      </Pressable>

      <View style={styles.forgotWrap}>
        <Pressable
          style={styles.forgotButton}
          onPress={() =>
            Alert.alert(
              loginScreenDefaults.forgotPinAlertTitle,
              loginScreenDefaults.forgotPinAlertMessage,
            )
          }
        >
          <MaterialIcons name="lock-reset" size={16} color={appColors.tertiary} />
          <Text style={styles.forgotLabel}>{loginScreenDefaults.forgotPinLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
