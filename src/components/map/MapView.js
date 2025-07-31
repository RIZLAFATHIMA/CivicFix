import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = ({ issues, userLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Default to India

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Your Location</b>')
        .openPopup();
    }

    // Add issue markers
    const bounds = [];
    
    issues.forEach((issue) => {
      if (issue.latitude && issue.longitude) {
        const marker = L.marker([issue.latitude, issue.longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${issue.title}</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px;">${issue.description}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #666;">
                <span>Status: ${issue.status}</span>
                <span>Upvotes: ${issue.upvotes?.[0]?.count || 0}</span>
              </div>
            </div>
          `);

        bounds.push([issue.latitude, issue.longitude]);
      }
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      if (userLocation) {
        bounds.push([userLocation.lat, userLocation.lng]);
      }
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    } else if (userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [issues, userLocation]);

  return (
    <div 
      ref={mapRef} 
      style={{ height: '500px', width: '100%' }}
      className="rounded-lg"
    />
  );
};

export default MapView; 