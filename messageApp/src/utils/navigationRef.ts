// NavigationRef.ts
import {NavigationContainerRef} from '@react-navigation/native';
import React from 'react';

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export function navigate(name: string, params?: any) {
  if (navigationRef.current && navigationRef.current.isReady()) {
    navigationRef.current.navigate(name, params);
  }
}

export function getCurrentRouteName() {
  return navigationRef.current?.getCurrentRoute()?.name;
}
