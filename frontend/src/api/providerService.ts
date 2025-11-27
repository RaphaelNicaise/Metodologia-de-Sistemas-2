import type { Provider, CreateProviderData, DeleteResponse } from '../types/provider';

const API_URL = "http://localhost:5000/api/proveedores/";

export const createProviderApi = async (
    providerData: CreateProviderData
): Promise<Provider> => {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
        body: JSON.stringify(providerData)
    });

    const data = await res.json() as Provider;

    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    return data;
};

export const getProvidersApi = async (): Promise<Provider[]> => {
    const res = await fetch(API_URL, {
        method: "GET",
        headers: {
            'Accept': 'application/json',
        },
        credentials: 'omit'
    });

    const data = await res.json() as Provider[];

    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }

    return data || [];
};

export const updateProviderApi = async (
    providerId: number,
    providerData: Partial<CreateProviderData>
): Promise<Provider> => {
    const res = await fetch(`${API_URL}${providerId}`, {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
        body: JSON.stringify(providerData)
    });

    const data = await res.json() as Provider;

    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    return data;
};

export const deleteProviderApi = async (
    providerId: number
): Promise<DeleteResponse> => {
    if (!providerId) {
        const errorMsg = "Se requiere el ID del proveedor para eliminarlo";
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    const res = await fetch(`${API_URL}${providerId}`, {
        method: "DELETE",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        }
    });

    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    return { success: true };
};
