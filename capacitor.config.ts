import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.pixelarcade.pingapp',
  appName: 'pingapp',
  webDir: 'dist',
  server: {
    allowNavigation: [
      '*.firebaseapp.com',
      '*.firebaseio.com',
      '*.googleapis.com',
      '*.google.com'
    ]
  }
};

export default config;
