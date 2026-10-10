import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.axiom.strength',
  appName: 'Axiom Strength',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
