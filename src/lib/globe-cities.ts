export type City = {
  name: string;
  lat: number;
  lon: number;
};

export const HUB: City = { name: "Noida, IN", lat: 28.54, lon: 77.39 };

export const DESTINATIONS: City[] = [
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Saharsa", lat: 25.8835, lon: 86.6006 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "London", lat: 51.5072, lon: -0.1276 },
  { name: "Frankfurt", lat: 50.1109, lon: 8.6821 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Nairobi", lat: -1.2921, lon: 36.8219 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
];
