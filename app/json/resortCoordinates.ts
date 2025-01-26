export const RESORT_COORDINATES = {
  'Palisades Tahoe Olympic Valley': {
    latitude: 39.1969,
    longitude: -120.2358,
    zoom: 13,
    pitch: 80,
    bearing: 0
  },
  'Palisades Tahoe Alpine Meadows': {
    latitude: 39.1646,
    longitude: -120.2389,
    zoom: 13,
    pitch: 60,
    bearing: 0
  },
  'Northstar at Tahoe': {
    latitude: 39.2746,
    longitude: -120.1211,
    zoom: 13,
    pitch: 60,
    bearing: 0
  },
  'Heavenly Mountain': {
    latitude: 38.9353,
    longitude: -119.9400,
    zoom: 13,
    pitch: 60,
    bearing: 0
  },
  'Kirkwood Mountain': {
    latitude: 38.6850,
    longitude: -120.0654,
    zoom: 13,
    pitch: 60,
    bearing: 0
  },
  'Mammoth Mountain': {
    latitude: 37.6308,
    longitude: -119.0326,
    zoom: 13,
    pitch: 60,
    bearing: 0
  }
} as const;

export type ResortName = keyof typeof RESORT_COORDINATES; 