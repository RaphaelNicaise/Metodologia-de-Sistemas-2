import { useState, useEffect } from 'react';
import { getProvidersApi } from '../api/providerService';
import type { Provider } from '../types/provider';

const useGetProviders = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProvidersApi();
            setProviders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching providers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    return { providers, loading, error, refetch: fetchProviders };
};

export default useGetProviders;
