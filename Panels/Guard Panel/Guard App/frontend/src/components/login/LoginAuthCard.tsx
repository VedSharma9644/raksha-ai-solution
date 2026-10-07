import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { loginGuard, requestLoginOtp, verifyLoginOtp } from '../../api/guard-api';
import {
  loginScreenDefaults,
  type LoginMode,
  type LoginStep,
} from '../../constants/login-screen-defaults';
import { useGuardAppNavigation } from '../../navigation/useGuardAppNavigation';
import { loginAuthCardStyles as styles } from '../../styles/login-auth-card.styles';
import { appColors } from '../../theme';

type LoginAuthCardProps = {
  isHindi: boolean;
};

export function LoginAuthCard({ isHindi }: LoginAuthCardProps) {
  const { signIn } = useGuardAppNavigation();
  const [mode, setMode] = useState<LoginMode>('id');
  const [step, setStep] = useState<LoginStep>('credentials');
  const [credential, setCredential] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [resetPhone, setResetPhone] = useState<string>('');
  const [maskedPhone, setMaskedPhone] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>([...loginScreenDefaults.otpInitial]);
  const [credentialFocused, setCredentialFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [otpFocusIndex, setOtpFocusIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const otpRefs = useRef<Array<TextInputType | null>>([]);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }
    const timer = setTimeout(() => setResendSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const selectMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setCredential('');
    setPassword('');
    setStep('credentials');
  };

  const credentialLabel =
    mode === 'phone'
      ? isHindi
        ? loginScreenDefaults.phoneLabelHindi
        : loginScreenDefaults.phoneLabel
      : isHindi
        ? loginScreenDefaults.idLabelHindi
        : loginScreenDefaults.idLabel;

  const otpValue = otpDigits.join('');

  const loginWithPassword = async () => {
    if (!credential.trim() || !password) {
      Alert.alert(
        'Login',
        mode === 'phone'
          ? 'Mobile number and password are required.'
          : 'Guard ID and password are required.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginGuard(credential.trim(), password);
      signIn(result.token, result.guard);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed.';
      Alert.alert('Login failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const sendResetOtp = async (phoneOverride?: string) => {
    const phone = (phoneOverride ?? resetPhone).replace(/\D/g, '');
    if (phone.length !== 10) {
      Alert.alert('OTP', 'Enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestLoginOtp(phone);
      setResetPhone(phone);
      setMaskedPhone(result.maskedPhone);
      setOtpDigits(['', '', '', '', '', '']);
      setStep('otp');
      setResendSeconds(loginScreenDefaults.resendSeconds);
      if (result.debugOtp) {
        Alert.alert('OTP sent', `Debug OTP: ${result.debugOtp}\nSent to ${result.maskedPhone}`);
      } else {
        Alert.alert('OTP sent', `Code sent to ${result.maskedPhone}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP.';
      Alert.alert('OTP', message);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (otpValue.length !== 6) {
      Alert.alert('OTP', 'Enter the 6-digit OTP.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await verifyLoginOtp(resetPhone, otpValue);
      signIn(result.token, result.guard);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OTP verification failed.';
      Alert.alert('OTP', message);
    } finally {
      setSubmitting(false);
    }
  };

  const onOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
      setOtpFocusIndex(index + 1);
    }
  };

  const onOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      setOtpFocusIndex(index - 1);
    }
  };

  const primaryAction = () => {
    if (step === 'credentials') {
      void loginWithPassword();
      return;
    }
    if (step === 'forgotPhone') {
      void sendResetOtp();
      return;
    }
    void verifyOtp();
  };

  const primaryLabel =
    step === 'forgotPhone'
      ? loginScreenDefaults.sendOtpLabel
      : step === 'otp'
        ? loginScreenDefaults.verifyOtpLabel
        : isHindi
          ? loginScreenDefaults.verifyLabelHindi
          : loginScreenDefaults.verifyLabel;

  return (
    <View style={styles.card}>
      {step === 'credentials' ? (
        <>
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
                maxLength={mode === 'phone' ? 10 : 20}
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

          <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>{loginScreenDefaults.passwordLabel}</Text>
              <Text style={styles.fieldHint}>{loginScreenDefaults.passwordHint}</Text>
            </View>
            <View style={[styles.inputRow, passwordFocused && styles.inputRowFocused]}>
              <MaterialIcons name="lock" size={18} color={appColors.primary} />
              <TextInput
                style={[styles.textInput, { marginLeft: 8 }]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                placeholder={loginScreenDefaults.passwordPlaceholder}
                placeholderTextColor="rgba(112, 121, 121, 0.6)"
                autoCapitalize="none"
              />
            </View>
          </View>
        </>
      ) : null}

      {step === 'forgotPhone' ? (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{loginScreenDefaults.forgotTitle}</Text>
          <Text style={[styles.fieldHint, { marginBottom: 12 }]}>
            {loginScreenDefaults.forgotSubtitle}
          </Text>
          <View style={[styles.inputRow, phoneFocused && styles.inputRowFocused]}>
            <View style={styles.phonePrefix}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={resetPhone}
              onChangeText={setResetPhone}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder={loginScreenDefaults.phonePlaceholder}
              placeholderTextColor="rgba(112, 121, 121, 0.6)"
            />
          </View>
        </View>
      ) : null}

      {step === 'otp' ? (
        <View style={styles.otpSection}>
          <View style={styles.otpHeader}>
            <View style={styles.otpLabelRow}>
              <MaterialIcons name="sms" size={16} color={appColors.primary} />
              <Text style={styles.otpLabel}>{loginScreenDefaults.otpLabel}</Text>
            </View>
            <View style={styles.autoDetectBadge}>
              <Text style={styles.autoDetectText}>
                {loginScreenDefaults.otpSentPrefix} {maskedPhone || resetPhone}
              </Text>
            </View>
          </View>

          <View style={styles.otpRow}>
            {otpDigits.map((digit, index) => (
              <TextInput
                key={`otp-${index}`}
                ref={(ref) => {
                  otpRefs.current[index] = ref;
                }}
                style={[styles.otpBox, otpFocusIndex === index && styles.otpBoxFocused]}
                value={digit}
                onChangeText={(value) => onOtpChange(index, value)}
                onKeyPress={({ nativeEvent }) => onOtpKeyPress(index, nativeEvent.key)}
                onFocus={() => setOtpFocusIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.otpFooter}>
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>
                {resendSeconds > 0
                  ? `${loginScreenDefaults.resendPrefix} `
                  : ''}
              </Text>
              {resendSeconds > 0 ? (
                <Text style={styles.resendCountdown}>{resendSeconds}s</Text>
              ) : (
                <Pressable onPress={() => void sendResetOtp(resetPhone)}>
                  <Text style={[styles.resendText, styles.resendCountdown]}>
                    {loginScreenDefaults.resendReady}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.verifyButton, pressed && styles.verifyButtonPressed]}
        onPress={primaryAction}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={appColors.onPrimary} />
        ) : (
          <MaterialIcons
            name={step === 'otp' ? 'verified-user' : step === 'forgotPhone' ? 'sms' : 'login'}
            size={22}
            color={appColors.onPrimary}
          />
        )}
        <Text style={styles.verifyLabel}>{primaryLabel}</Text>
      </Pressable>

      <View style={styles.forgotWrap}>
        {step === 'credentials' ? (
          <Pressable
            style={styles.forgotButton}
            onPress={() => {
              setResetPhone(mode === 'phone' ? credential.replace(/\D/g, '') : '');
              setStep('forgotPhone');
            }}
          >
            <MaterialIcons name="lock-reset" size={16} color={appColors.tertiary} />
            <Text style={styles.forgotLabel}>{loginScreenDefaults.forgotPinLabel}</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.forgotButton}
            onPress={() => {
              setStep('credentials');
              setOtpDigits(['', '', '', '', '', '']);
              setResendSeconds(0);
            }}
          >
            <MaterialIcons name="arrow-back" size={16} color={appColors.tertiary} />
            <Text style={styles.forgotLabel}>{loginScreenDefaults.backToLoginLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
