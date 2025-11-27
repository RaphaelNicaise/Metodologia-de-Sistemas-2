export interface Provider {
    id: number;
    name: string;
    contact_email: string;
    phone_number: string;
    address: string;
    description: string;
}

export interface DeleteResponse {
    success: boolean;
}

export type CreateProviderData = Omit<Provider, 'id'>;
