import { useState } from 'react';
import { deleteProviderApi } from '../api/providerService';

const useDeleteProvider = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteProvider = async (providerId: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await deleteProviderApi(providerId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error deleting provider';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deleteProvider, loading, error };
};

export default useDeleteProvider;
