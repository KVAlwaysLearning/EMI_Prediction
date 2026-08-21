import {
  PredictionRequestPayload,
  EligibilityResponseData,
  MaxEmiResponseData,
  CombinedPredictionResponseData,
  StoredRecord,
} from '../types';

export const API_URL = (import.meta as any).env?.VITE_API_URL || '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorMessage = errJson.detail;
      else if (errJson.error) errorMessage = errJson.error;
    } catch {
      // ignore
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export async function getHealth(): Promise<{
  status: string;
  service: string;
  onnx_available: boolean;
  python_models_trained: boolean;
  active_engine: string;
}> {
  return request('/api/health', {
    method: 'GET',
  });
}

export async function predictEligibility(payload: PredictionRequestPayload): Promise<EligibilityResponseData> {
  return request<EligibilityResponseData>('/api/predict/eligibility', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function predictMaxEmi(payload: PredictionRequestPayload): Promise<MaxEmiResponseData> {
  return request<MaxEmiResponseData>('/api/predict/max-emi', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function predictCombined(payload: PredictionRequestPayload): Promise<CombinedPredictionResponseData> {
  return request<CombinedPredictionResponseData>('/api/predict/combined', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function makeAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

export async function getRecords(token?: string): Promise<StoredRecord[]> {
  return request<StoredRecord[]>('/api/records', {
    method: 'GET',
    headers: makeAuthHeaders(token),
  });
}

export async function createRecord(payload: Partial<StoredRecord>, token?: string): Promise<StoredRecord> {
  return request<StoredRecord>('/api/records', {
    method: 'POST',
    headers: makeAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateRecord(id: string, payload: Partial<StoredRecord>, token?: string): Promise<StoredRecord> {
  return request<StoredRecord>(`/api/records/${id}`, {
    method: 'PUT',
    headers: makeAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteRecord(id: string, token?: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/records/${id}`, {
    method: 'DELETE',
    headers: makeAuthHeaders(token),
  });
}
