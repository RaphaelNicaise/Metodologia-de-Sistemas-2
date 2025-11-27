import { useState } from 'react';
import { updateProviderApi } from '../api/providerService';
import type { CreateProviderData, Provider } from '../types/provider';

const useUpdateProvider = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProvider = async (
        providerId: number,
        providerData: Partial<CreateProviderData>
    ): Promise<Provider> => {
        try {
            setLoading(true);
            setError(null);
            const updatedProvider = await updateProviderApi(providerId, providerData);
            return updatedProvider;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error updating provider';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateProvider, loading, error };
};

export default useUpdateProvider;
