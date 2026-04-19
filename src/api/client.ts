
export const BASE_URL = 'http://localhost:8080/api/v1';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Driver {
  id: string;
  userId: string;
  fullName: string;
  drivingLicenseCategories: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  registrationPlateNumber: string;
  vehicleType: number;
}

export interface RoadTrip {
  id: string;
  carId: string;
  vehicleName: string;
  driverName: string;
  startDate: string;
  endDate: string;
  distance: number;
  averageFuelConsumption: number;
}



export interface ErrorResponse {
  type: 'error'; // Discriminator for your logic
  statusCode: number;
  message: string;
  errors: {
    generalErrors: string[];
  };
}

export interface SuccessResponse {
  type: 'success'; // Discriminator
  data: any;
}
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getUserRole = (): number | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if(payload.is_admin == "true") return 2;
    if(payload.is_manager == "true") return 1;
    if(payload.is_driver == "true") return 0;

    return null;
  } catch (e) {
    return null;
  }
};

export function serializeErrors(resp: ErrorResponse): string[] {
  return Object.entries(resp.errors).map(
      ([field, messages]) => `${field}: ${messages.join(', ')}`
  );
}

async function handleResponse(res: Response): Promise<ErrorResponse | SuccessResponse> {
  const text = await res.text();
  //Unatuhorized
  if(res.status == 401){
    const errors = ["Unauthorized"];
    return {type: "error", errors: errors};
  }
  if (!res.ok) {
    try {
      const errorData = JSON.parse(text);
      return { type: 'error', ...errorData };
    } catch {
      return { type: 'error', statusCode: res.status, message: "Failed to parse error", errors: [] };
    }
  }

  try {
    const data = text ? JSON.parse(text) : {};
    return { type: 'success', data: data };
  } catch (e) {
    return { type: 'success', data: text };
  }
}

export const api = {
  async post(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async get(endpoint: string) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },
  async put(endpoint: string, data: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  async delete(endpoint: string, data?: any) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse(res);
  }
};
