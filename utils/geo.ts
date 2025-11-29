// Simple Euclidean distance for prototype (approximate km)
// 1 deg lat ~= 111km
export const calculateDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(2));
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const normalizeCoordinate = (value: number, min: number, max: number): number => {
  return ((value - min) / (max - min)) * 100;
};