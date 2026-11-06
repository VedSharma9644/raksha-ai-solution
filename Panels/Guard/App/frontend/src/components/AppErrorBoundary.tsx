import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '../theme';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Keeps a JS render crash from blanking/killing the process in release builds.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('AppErrorBoundary', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: appColors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'PublicSans_700Bold',
            color: appColors.onSurface,
            textAlign: 'center',
          }}
        >
          Something went wrong
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'PublicSans_400Regular',
            color: appColors.secondary,
            textAlign: 'center',
          }}
        >
          {this.state.error.message}
        </Text>
        <Pressable
          onPress={() => this.setState({ error: null })}
          style={{
            marginTop: 8,
            backgroundColor: appColors.primaryContainer,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: appColors.onPrimary,
              fontFamily: 'PublicSans_700Bold',
            }}
          >
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }
}
