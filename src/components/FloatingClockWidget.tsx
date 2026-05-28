import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSettings } from '../context/SettingsContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type WidgetMode = 'simple' | 'minimal' | 'analog' | 'countdown' | 'stopwatch';

interface Props {
  mode: WidgetMode;
  onClose: () => void;
}

function SmallClockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#cccccc" strokeWidth="2" />
      <Path d="M12 7v5l3 3" stroke="#cccccc" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function AnalogClock({ size = 80, hours, minutes, seconds }: {
  size?: number; hours: number; minutes: number; seconds: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  const secondAngle = (seconds / 60) * 360 - 90;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360 - 90;
  const hourAngle = ((hours % 12 + minutes / 60) / 12) * 360 - 90;

  const toXY = (angle: number, len: number) => ({
    x: cx + len * Math.cos((angle * Math.PI) / 180),
    y: cy + len * Math.sin((angle * Math.PI) / 180),
  });

  const s = toXY(secondAngle, r * 0.85);
  const m = toXY(minuteAngle, r * 0.7);
  const h = toXY(hourAngle, r * 0.5);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r} stroke="#444" strokeWidth="1.5" fill="transparent" />
      <Circle cx={cx} cy={cy} r={2} fill="#00BFA5" />
      <Path d={`M ${cx} ${cy} L ${h.x} ${h.y}`} stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <Path d={`M ${cx} ${cy} L ${m.x} ${m.y}`} stroke="#cccccc" strokeWidth="1.8" strokeLinecap="round" />
      <Path d={`M ${cx} ${cy} L ${s.x} ${s.y}`} stroke="#00BFA5" strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}

export default function FloatingClockWidget({ mode, onClose }: Props) {
  const { use12Hour, showAmPm, secondFraction, useServerTime, clockOpacity } = useSettings();
  const [timeString, setTimeString] = useState('');
  const [rawTime, setRawTime] = useState({ h: 0, m: 0, s: 0 });
  const [pos, setPos] = useState({ x: 40, y: 100 });
  const posRef = useRef({ x: 40, y: 100 });

  // Stopwatch state
  const [swRunning, setSwRunning] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown state
  const [cdSeconds, setCdSeconds] = useState(60);
  const [cdRunning, setCdRunning] = useState(false);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clock time updater
  useEffect(() => {
    const update = () => {
      let now = new Date();
      if (useServerTime) now = new Date(now.getTime() + 1500);

      let h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();

      setRawTime({ h, m, s });

      const mStr = String(m).padStart(2, '0');
      const sStr = String(s).padStart(2, '0');
      let msStr = '';
      if (secondFraction === '2 digits') {
        msStr = '.' + String(Math.floor(ms / 10)).padStart(2, '0');
      }

      let ampm = '';
      if (use12Hour) {
        ampm = h >= 12 ? ' pm' : ' am';
        h = h % 12 || 12;
      }
      const hStr = String(h).padStart(2, '0');
      const suffix = use12Hour && showAmPm ? ampm : '';

      setTimeString(`${hStr}:${mStr}:${sStr}${msStr}${suffix}`);
    };

    const id = setInterval(update, 30);
    update();
    return () => clearInterval(id);
  }, [use12Hour, showAmPm, secondFraction, useServerTime]);

  // Stopwatch
  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => setSwElapsed(e => e + 10), 10);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  // Countdown
  useEffect(() => {
    if (cdRunning) {
      cdRef.current = setInterval(() => {
        setCdSeconds(s => {
          if (s <= 0) { setCdRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (cdRef.current) clearInterval(cdRef.current);
    }
    return () => { if (cdRef.current) clearInterval(cdRef.current); };
  }, [cdRunning]);

  // Drag responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const newX = Math.max(0, Math.min(SCREEN_W - 180, posRef.current.x + gs.dx));
        const newY = Math.max(0, Math.min(SCREEN_H - 60, posRef.current.y + gs.dy));
        setPos({ x: newX, y: newY });
      },
      onPanResponderRelease: (_, gs) => {
        posRef.current = {
          x: Math.max(0, Math.min(SCREEN_W - 180, posRef.current.x + gs.dx)),
          y: Math.max(0, Math.min(SCREEN_H - 60, posRef.current.y + gs.dy)),
        };
      },
    })
  ).current;

  const formatStopwatch = () => {
    const ms = swElapsed % 1000;
    const s = Math.floor(swElapsed / 1000) % 60;
    const m = Math.floor(swElapsed / 60000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(Math.floor(ms / 10)).padStart(2, '0')}`;
  };

  const formatCountdown = () => {
    const m = Math.floor(cdSeconds / 60);
    const s = cdSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (mode) {
      case 'simple':
        return (
          <View style={styles.pillInner}>
            <SmallClockIcon />
            <Text style={styles.timeText}>{timeString}</Text>
          </View>
        );
      case 'minimal':
        return (
          <View style={styles.pillInner}>
            <Text style={styles.timeTextMinimal}>{timeString}</Text>
          </View>
        );
      case 'analog':
        return (
          <View style={styles.analogInner}>
            <AnalogClock size={70} hours={rawTime.h} minutes={rawTime.m} seconds={rawTime.s} />
          </View>
        );
      case 'stopwatch':
        return (
          <TouchableOpacity style={styles.pillInner} onPress={() => setSwRunning(r => !r)}>
            <SmallClockIcon />
            <Text style={styles.timeText}>{formatStopwatch()}</Text>
            <Text style={styles.ctrlHint}>{swRunning ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        );
      case 'countdown':
        return (
          <TouchableOpacity style={styles.pillInner} onPress={() => setCdRunning(r => !r)}>
            <SmallClockIcon />
            <Text style={[styles.timeText, cdSeconds === 0 && { color: '#ff4444' }]}>
              {formatCountdown()}
            </Text>
            <Text style={styles.ctrlHint}>{cdRunning ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        );
    }
  };

  const isAnalog = mode === 'analog';

  return (
    <View
      style={[
        styles.widget,
        {
          left: pos.x,
          top: pos.y,
          opacity: clockOpacity,
          borderRadius: isAnalog ? 50 : 100,
          padding: isAnalog ? 6 : 0,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {renderContent()}
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    position: 'absolute',
    zIndex: 9999,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: 'rgba(200,200,200,0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 20,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  analogInner: {
    padding: 4,
  },
  timeText: {
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  timeTextMinimal: {
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctrlHint: {
    color: '#00BFA5',
    fontSize: 12,
    marginLeft: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#333333',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  closeText: {
    color: '#aaaaaa',
    fontSize: 9,
    lineHeight: 10,
  },
});
