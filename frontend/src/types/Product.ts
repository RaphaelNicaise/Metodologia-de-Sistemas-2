export interface Product{
    id:number;
    name:string;
    barcode:string;
    price:number;
    stock:number;
    url_image?:string;
    category:string;
}

export interface DeleteResponse{
    success:boolean;
}

export type CreateProductData = Omit<Product, 'id'>;
