import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="explore" options={{ title: 'Explorer', href: null }} />
      <Tabs.Screen name="shader-studio" options={{ title: 'Shader', href: null }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz', href: null }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn', href: null }} />
      <Tabs.Screen name="build-steps" options={{ title: 'Build Steps', href: null }} />
      <Tabs.Screen name="real-life" options={{ title: 'Real Life', href: null }} />
      <Tabs.Screen name="about-team" options={{ title: 'About Team', href: null }} />
      <Tabs.Screen name="audio-reactive" options={{ title: 'Audio', href: null }} />
      <Tabs.Screen name="builder" options={{ title: 'Builder', href: null }} />
      <Tabs.Screen name="portal" options={{ title: 'Portal', href: null }} />
      <Tabs.Screen name="daily" options={{ title: 'Daily', href: null }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', href: null }} />
      <Tabs.Screen name="energy" options={{ title: 'Energy', href: null }} />
      <Tabs.Screen name="laborator" options={{ title: 'Lab', href: null }} />
      <Tabs.Screen name="mathsandjeans" options={{ title: 'Maths Lab', href: null }} />
    </Tabs>
  );
}
