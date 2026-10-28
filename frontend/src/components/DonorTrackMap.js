import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const toRad = (x) => (x * Math.PI) / 180;
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const emojiIcon = (emoji) =>
  L.divIcon({
    html: `<div style="font-size:26px;line-height:26px">${emoji}</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 26]
  });

function DonorTrackMap({ hospital, donor }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const donorMarkerRef = useRef(null);

  const [hospitalPos, setHospitalPos] = useState(
    hospital && hospital.lat != null ? { lat: hospital.lat, lng: hospital.lng } : null
  );

  const hospitalQuery = hospital
    ? [hospital.name, hospital.address, hospital.city].filter(Boolean).join(', ')
    : '';
  const dLat = donor ? donor.lat : null;
  const dLng = donor ? donor.lng : null;

  // Find the exact hospital location from its address (OpenStreetMap)
  useEffect(() => {
    if (!hospitalQuery) return;
    let cancelled = false;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(hospitalQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data && data[0]) {
          setHospitalPos({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [hospitalQuery]);

  // Create the map once
  useEffect(() => {
    const map = L.map(mapDivRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      hospitalMarkerRef.current = null;
      donorMarkerRef.current = null;
    };
  }, []);

  // Update markers whenever positions change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const points = [];

    if (hospitalPos) {
      const pos = [hospitalPos.lat, hospitalPos.lng];
      if (!hospitalMarkerRef.current) {
        hospitalMarkerRef.current = L.marker(pos, { icon: emojiIcon('🏥') }).addTo(map).bindPopup('Hospital');
      } else {
        hospitalMarkerRef.current.setLatLng(pos);
      }
      points.push(pos);
    }

    if (dLat != null && dLng != null) {
      const pos = [dLat, dLng];
      if (!donorMarkerRef.current) {
        donorMarkerRef.current = L.marker(pos, { icon: emojiIcon('🚗') }).addTo(map).bindPopup('Donor');
      } else {
        donorMarkerRef.current.setLatLng(pos);
      }
      points.push(pos);
    }

    if (points.length === 2) map.fitBounds(points, { padding: [40, 40] });
    else if (points.length === 1) map.setView(points[0], 13);
  }, [hospitalPos, dLat, dLng]);

  let info = 'Waiting for the donor to share live location…';
  if (hospitalPos && dLat != null) {
    const km = haversine(dLat, dLng, hospitalPos.lat, hospitalPos.lng);
    const mins = Math.max(1, Math.round((km / 30) * 60)); // rough average 30 km/h
    info = `🚗 Donor is about ${km.toFixed(1)} km from the hospital (approx. ${mins} min away)`;
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{info}</div>
      <div ref={mapDivRef} style={{ height: 300, width: '100%', borderRadius: 8 }} />
    </div>
  );
}

export default DonorTrackMap;