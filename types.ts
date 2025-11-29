export enum IncidentStatus {
  New = 'New',
  Acknowledged = 'Acknowledged',
  Dispatched = 'Dispatched',
  Resolved = 'Resolved',
}

export enum Severity {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum SentVia {
  GSM = 'GSM',
  LoRa = 'LoRa',
  Satellite = 'Satellite',
}

export interface Incident {
  incident_id: string;
  timestamp_utc: string;
  status: IncidentStatus;
  severity: Severity;
  gps_lat: number;
  gps_lng: number;
  address: string;
  speed_kmh: number;
  accel_peak_g: number;
  gyro_peak_dps: number;
  sensor_source: string;
  report_type: 'auto' | 'manual';
  victim_name: string | null;
  victim_age: number | null;
  assigned_responder: string | null;
  responder_eta_min: number | null;
  ambulance_id: string | null;
  sent_via: SentVia;
  notes: string;
  is_new_alert?: boolean; // UI state for pulsing
}

export interface Responder {
  responder_id: string;
  name: string;
  status: 'Available' | 'En route' | 'Busy' | 'Offline';
  last_lat: number;
  last_lng: number;
  battery_pct: number;
  vehicle_id: string;
}

export interface ResponderSuggestion extends Responder {
  distance_km: number;
  est_time_min: number;
}

export type ViewState = 'overview' | 'resources' | 'analytics' | 'settings';