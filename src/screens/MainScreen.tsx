import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { NativeModules } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import FloatingClockWidget from '../components/FloatingClockWidget';
import Svg, { Circle, Path, Line } from 'react-native-svg';

const { OverlayPermissionModule } = NativeModules;

// Clock icon SVG component
function ClockIcon({ size = 40, color = '#aaa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// Hourglass icon
function HourglassIcon({ size = 40, color = '#aaa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 2h12M6 22h12M8 2v4l8 8-8 8v4M16 2v4l-8 8 8 8v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Stopwatch icon
function StopwatchIcon({ size = 40, color = '#aaa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth="1.5" />
      <Path d="M12 9v4l2.5 2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M10 3h4M12 3v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// Gear icon
function GearIcon({ size = 40, color = '#aaa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// Info icon
function InfoIcon({ size = 40, color = '#aaa' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Path d="M12 8v4M12 16h.01" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

const MENU_ITEMS = [
  {
    id: 'simple',
    title: 'Simple Clock',
    subtitle: 'Just a simple digital clock.',
    icon: 'simple',
  },
  {
    id: 'minimal',
    title: 'Minimal Clock',
    subtitle: 'Hate the frame? This is here for you.',
    icon: 'minimal',
  },
  {
    id: 'analog',
    title: 'Analog Clock',
    subtitle: 'Want an analog movement?',
    icon: 'analog',
  },
  {
    id: 'countdown',
    title: 'Countdown Timer',
    subtitle: 'Set the duration and count it down.',
    icon: 'countdown',
  },
  {
    id: 'stopwatch',
    title: 'Stopwatch',
    subtitle: 'Measure how long does it take.',
    icon: 'stopwatch',
  },
];

function MenuIcon({ id, active }: { id: string; active: boolean }) {
  const color = active ? '#00BFA5' : '#888888';
  if (id === 'simple') {
    return (
      <View style={[styles.iconBox, active && styles.iconBoxActive]}>
        <Text style={[styles.iconBoxText, active && { color: '#00BFA5' }]}>12:00</Text>
      </View>
    );
  }
  if (id === 'minimal') {
    return (
      <View style={[styles.iconBoxFlat]}>
        <Text style={[styles.iconBoxTextFlat, active && { color: '#00BFA5' }]}>12:00</Text>
      </View>
    );
  }
  if (id === 'analog') return <ClockIcon size={52} color={color} />;
  if (id === 'countdown') return <HourglassIcon size={52} color={color} />;
  if (id === 'stopwatch') return <StopwatchIcon size={52} color={color} />;
  return null;
}

export default function MainScreen({ navigation }: any) {
  const { activeWidget, setActiveWidget, hasOverlayPermission, setHasOverlayPermission } = useSettings();

  // Check overlay permission on mount
  useEffect(() => {
    checkOverlayPermission();
  }, []);

  const checkOverlayPermission = async () => {
    try {
      if (OverlayPermissionModule) {
        const granted = await OverlayPermissionModule.checkOverlayPermission();
        setHasOverlayPermission(granted);
      }
    } catch (e) {
      // Native module not available in dev
    }
  };

  const handleWidgetPress = async (id: string) => {
    if (!hasOverlayPermission) {
      Alert.alert(
        'Permission Required',
        'To show the floating clock, please grant "Draw over other Apps" permission in Settings → Android Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => navigation.navigate('Settings'),
          },
        ]
      );
      return;
    }
    if (activeWidget === id) {
      setActiveWidget(null);
    } else {
      setActiveWidget(id);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* App Logo / Branding */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <View style={styles.logoWave} />
            <ClockIcon size={56} color="#1a3a4a" />
          </View>
          <Text style={styles.appTitle}>Floating Clock</Text>
          <Text style={styles.appSubtitle}>Clock that floating on your screen</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => {
            const isActive = activeWidget === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuCard, isActive && styles.menuCardActive]}
                onPress={() => handleWidgetPress(item.id)}
                activeOpacity={0.75}
              >
                <View style={styles.menuIconWrap}>
                  <MenuIcon id={item.id} active={isActive} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={[styles.menuTitle, isActive && styles.menuTitleActive]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Settings Row */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.75}
          >
            <View style={styles.menuIconWrap}>
              <GearIcon size={52} color="#888888" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuSubtitle}>Adjust an app behavior & system settings.</Text>
            </View>
          </TouchableOpacity>

          {/* About Row */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() =>
              Alert.alert('Floating Clock', 'Version 1.0\nA floating clock widget app for Android.')
            }
            activeOpacity={0.75}
          >
            <View style={styles.menuIconWrap}>
              <InfoIcon size={52} color="#888888" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>About</Text>
              <Text style={styles.menuSubtitle}>App info, developer, software components, etc.</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Widget Overlay */}
      {activeWidget && hasOverlayPermission && (
        <FloatingClockWidget
          mode={activeWidget as any}
          onClose={() => setActiveWidget(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#b8dff5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#7fc4e8',
  },
  logoWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#7fc4e8',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 14,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    color: '#555555',
    fontSize: 13,
    marginTop: 4,
  },
  menuList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 10,
  },
  menuCardActive: {
    borderColor: '#00BFA5',
    backgroundColor: '#0a1a18',
  },
  menuIconWrap: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconBoxActive: {
    borderColor: '#00BFA5',
  },
  iconBoxText: {
    color: '#cccccc',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    fontWeight: '700',
  },
  iconBoxFlat: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxTextFlat: {
    color: '#888888',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 15,
    fontWeight: '600',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  menuTitleActive: {
    color: '#ffffff',
  },
  menuSubtitle: {
    color: '#666666',
    fontSize: 13,
  },
  activeBadge: {
    backgroundColor: 'rgba(0,191,165,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: '#00BFA5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
