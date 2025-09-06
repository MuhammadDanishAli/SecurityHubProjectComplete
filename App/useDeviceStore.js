// store/useDeviceStore.js
import { create } from 'zustand';

export const useDeviceStore = create((set) => ({
  devices: {},

  setDeviceStatus: (deviceName, status) =>
    set((state) => ({
      devices: {
        ...state.devices,
        [deviceName]: { ...(state.devices[deviceName] || {}), connected: status },
      },
    })),

  getDeviceStatus: (deviceName) =>
    (get().devices[deviceName] || {}).connected ?? false,
}));
