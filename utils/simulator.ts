import { Incident, IncidentStatus, Severity, SentVia } from '../types';
import { BOUNDS } from '../constants';

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateRandomIncident = (count: number): Incident => {
  const id = `INC-${String(Date.now()).slice(-4)}-${Math.floor(Math.random() * 100)}`;
  const lat = randomInRange(BOUNDS.minLat, BOUNDS.maxLat);
  const lng = randomInRange(BOUNDS.minLng, BOUNDS.maxLng);
  
  // Weighted Severity
  const randSev = Math.random();
  let severity = Severity.Low;
  let peakG = randomInRange(0, 10);
  
  if (randSev < 0.2) {
    severity = Severity.High;
    peakG = randomInRange(30, 80);
  } else if (randSev < 0.6) {
    severity = Severity.Medium;
    peakG = randomInRange(10, 30);
  }

  // Weighted Sent Via
  const randVia = Math.random();
  let sentVia = SentVia.GSM;
  if (randVia > 0.8) sentVia = SentVia.Satellite;
  else if (randVia > 0.5) sentVia = SentVia.LoRa;

  const speed = Math.floor(randomInRange(0, 120));

  return {
    incident_id: id,
    timestamp_utc: new Date().toISOString(),
    status: IncidentStatus.New,
    severity,
    gps_lat: lat,
    gps_lng: lng,
    address: `Simulated Loc ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    speed_kmh: speed,
    accel_peak_g: parseFloat(peakG.toFixed(1)),
    gyro_peak_dps: Math.floor(randomInRange(0, 250)),
    sensor_source: `DEV-${Math.floor(randomInRange(100, 999))}`,
    report_type: 'auto',
    victim_name: null,
    victim_age: null,
    assigned_responder: null,
    responder_eta_min: null,
    ambulance_id: null,
    sent_via: sentVia,
    notes: 'Automated sensor alert detected.',
    is_new_alert: true,
  };
};