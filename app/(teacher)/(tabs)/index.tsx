import { TeacherDashboard } from '@/components/screens/teacher/TeacherDashboard';
import React from 'react';
import { View } from 'react-native';

export default function TeacherHomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <TeacherDashboard />
    </View>
  );
}
