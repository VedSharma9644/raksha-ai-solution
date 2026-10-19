import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  APP_LANGUAGES,
  type AppLanguageCode,
  useLanguage,
} from '../../i18n';
import { languagePickerModalStyles as styles } from '../../styles/language-picker-modal.styles';
import { appColors } from '../../theme';

type LanguagePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (code: AppLanguageCode) => void;
};

export function LanguagePickerModal({
  visible,
  onClose,
  onSelect,
}: LanguagePickerModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return APP_LANGUAGES;
    return APP_LANGUAGES.filter(
      (lang) =>
        lang.nameEn.toLowerCase().includes(q) ||
        lang.nameNative.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSelect = (code: AppLanguageCode) => {
    setLanguage(code);
    onSelect?.(code);
    setQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{t('profile.languageSelect')}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            >
              <MaterialIcons name="close" size={22} color={appColors.onSurface} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={20} color={appColors.secondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('profile.languageSearch')}
              placeholderTextColor={appColors.secondary}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const selected = item.code === language;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.row,
                    selected && styles.rowSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleSelect(item.code)}
                >
                  <View style={styles.rowText}>
                    <Text style={[styles.nativeName, selected && styles.nativeNameSelected]}>
                      {item.nameNative}
                    </Text>
                    <Text style={styles.englishName}>
                      {item.nameEn}
                      {item.code === 'en' ? '' : ` · ${item.code.toUpperCase()}`}
                    </Text>
                  </View>
                  {selected ? (
                    <MaterialIcons name="check-circle" size={22} color={appColors.primary} />
                  ) : (
                    <MaterialIcons
                      name="radio-button-unchecked"
                      size={22}
                      color={appColors.outlineVariant}
                    />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>{t('common.error')}</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}
