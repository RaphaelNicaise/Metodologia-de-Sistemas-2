import { useState } from 'react';
import { createProviderApi } from '../api/providerService';
import type { CreateProviderData, Provider } from '../types/provider';

const useCreateProvider = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProvider = async (providerData: CreateProviderData): Promise<Provider> => {
        try {
            setLoading(true);
            setError(null);
            const newProvider = await createProviderApi(providerData);
            return newProvider;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creating provider';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createProvider, loading, error };
};

export default useCreateProvider;
