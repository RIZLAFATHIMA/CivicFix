"use client";
import { useMapEvents } from 'react-leaflet';

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};