
// Definimos la URL base para no repetirla en cada función
const API_URL = "http://localhost:5000/api/productos/";

export const createProductApi = async (productData) => {
    
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
        body: JSON.stringify(productData)
    });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }
    return data;
};


export const getProductsApi = async () => {
    
    const res = await fetch(API_URL, {
        method: "GET",
        headers: {
            'Accept': 'application/json',
        },
        credentials: 'omit'
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(`Error http: ${res.status} ${res.statusText}`);
    }

    return data || [];
};


export const deleteProductApi = async (productId) => {

    if (!productId) {
        const errorMsg = "Se requiere el ID del producto para eliminarlo";
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    const res = await fetch(`${API_URL}${productId}`, {
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