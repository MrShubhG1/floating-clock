import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
  NativeModules,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettings } from '../context/SettingsContext';
import Svg, { Path, Polygon } from 'react-native-svg';

const { OverlayPermissionModule } = NativeModules;

function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WarningIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Polygon points="12,2 22,22 2,22" stroke="#666666" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <Path d="M12 9v4M12 17h.01" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

const TEAL = '#00BFA5';

export default function SettingsScreen({ navigation }: any) {
  const {
    use12Hour, setUse12Hour,
    showAmPm, setShowAmPm,
    secondFraction, setSecondFraction,
    useServerTime, setUseServerTime,
    clockOpacity, setClockOpacity,
    autoStartOnBoot, setAutoStartOnBoot,
    hideOnLandscape, setHideOnLandscape,
    hasOverlayPermission, setHasOverlayPermission,
  } = useSettings();

  const handleOpenDrawOverApps = async () => {
    if (Platform.OS === 'android') {
      try {
        if (OverlayPermissionModule) {
          await OverlayPermissionModule.requestOverlayPermission();
          // Re-check after coming back
          setTimeout(async () => {
            const granted = await OverlayPermissionModule.checkOverlayPermission();
            setHasOverlayPermission(granted);
            if (granted) Alert.alert('Permission Granted', 'Floating clock can now be displayed.');
          }, 1000);
        } else {
          // Fallback toggle for environments without native module
          setHasOverlayPermission(!hasOverlayPermission);
          Alert.alert('Dev Mode', 'Overlay permission toggled (native module not available).');
        }
      } catch (e) {
        setHasOverlayPermission(!hasOverlayPermission);
      }
    }
  };

  const handleDateTimeSettings = () => {
    if (Platform.OS === 'android' && OverlayPermissionModule) {
      OverlayPermissionModule.openDateTimeSettings?.();
    } else {
      Alert.alert('Date & Time', 'This will open Android Date & Time settings.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* App Settings Section */}
        <Text style={styles.sectionHeader}>App Settings</Text>

        {/* Use 12-hour clock */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Use 12-hour clock</Text>
          <Switch
            value={use12Hour}
            onValueChange={setUse12Hour}
            trackColor={{ false: '#333333', true: TEAL }}
            thumbColor={use12Hour ? '#ffffff' : '#888888'}
          />
        </View>

        {/* Show AM/PM */}
        <View style={[styles.row, !use12Hour && styles.rowDisabled]}>
          <Text style={[styles.rowLabel, !use12Hour && styles.rowLabelDisabled]}>Show AM/PM</Text>
          <Switch
            value={showAmPm && use12Hour}
            onValueChange={setShowAmPm}
            disabled={!use12Hour}
            trackColor={{ false: '#333333', true: TEAL }}
            thumbColor={(showAmPm && use12Hour) ? '#ffffff' : '#888888'}
          />
        </View>

        {/* Second Fraction */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setSecondFraction(secondFraction === 'none' ? '2 digits' : 'none')}
          activeOpacity={0.7}
        >
          <View>
            <Text style={styles.rowLabel}>Second fraction</Text>
            <Text style={styles.rowSub}>{secondFraction === 'none' ? 'No fraction' : '2 digits'}</Text>
          </View>
        </TouchableOpacity>

        {/* Caution text */}
        {secondFraction === '2 digits' && (
          <View style={styles.cautionRow}>
            <WarningIcon />
            <Text style={styles.cautionText}>
              CAUTION: ENABLE SECOND FRACTION MAY AFFECT PERFORMANCE AND BATTERY LIFE
            </Text>
          </View>
        )}

        {/* Auto start on boot */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Auto start app on boot</Text>
          <Switch
            value={autoStartOnBoot}
            onValueChange={setAutoStartOnBoot}
            trackColor={{ false: '#333333', true: TEAL }}
            thumbColor={autoStartOnBoot ? '#ffffff' : '#888888'}
          />
        </View>

        {/* Hide on landscape */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Hide on landscape mode</Text>
          <Switch
            value={hideOnLandscape}
            onValueChange={setHideOnLandscape}
            trackColor={{ false: '#333333', true: TEAL }}
            thumbColor={hideOnLandscape ? '#ffffff' : '#888888'}
          />
        </View>

        {/* Use Server Time */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Use server time</Text>
          <Switch
            value={useServerTime}
            onValueChange={setUseServerTime}
            trackColor={{ false: '#333333', true: TEAL }}
            thumbColor={useServerTime ? '#ffffff' : '#888888'}
          />
        </View>

        {/* Clock Opacity */}
        <View style={styles.sliderSection}>
          <Text style={styles.rowLabel}>Clock Opacity</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.2}
            maximumValue={1.0}
            value={clockOpacity}
            onValueChange={setClockOpacity}
            minimumTrackTintColor={TEAL}
            maximumTrackTintColor='#333333'
            thumbTintColor={TEAL}
          />
        </View>

        {/* Theme (static - always Dark) */}
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Theme</Text>
            <Text style={styles.rowSub}>Dark</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Android Settings Section */}
        <Text style={styles.sectionHeader}>Android Settings</Text>

        {/* Date & Time Settings */}
        <TouchableOpacity style={styles.row} onPress={handleDateTimeSettings} activeOpacity={0.7}>
          <Text style={styles.rowLabel}>Date & Time Settings</Text>
        </TouchableOpacity>

        {/* Draw over other Apps */}
        <TouchableOpacity style={styles.row} onPress={handleOpenDrawOverApps} activeOpacity={0.7}>
          <View>
            <Text style={styles.rowLabel}>Draw over other Apps</Text>
            {hasOverlayPermission ? (
              <Text style={[styles.rowSub, { color: TEAL }]}>Granted ✓</Text>
            ) : (
              <Text style={[styles.rowSub, { color: '#ff4444' }]}>Tap to grant permission</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    marginRight: 16,
  },
  screenTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    color: '#00BFA5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  rowDisabled: {
    opacity: 0.35,
  },
  rowLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  rowLabelDisabled: {
    color: '#888888',
  },
  rowSub: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  cautionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  cautionText: {
    color: '#555555',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
    lineHeight: 15,
  },
  sliderSection: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#1a1a1a',
    marginVertical: 16,
  },
});
