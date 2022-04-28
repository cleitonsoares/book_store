export interface BookDTO {
    id?: number;
    name: string;
    published_at: Date;
    created_at?: Date;
    updated_at?: Date;
    publisher_id?: number;
    authors: AuthorDTO[],
    publisher: {
        name: string
    }
}

export interface AuthorDTO {
    name: string
}

export interface InventoryRequestDTO {
    quantity: number
}