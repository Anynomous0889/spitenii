export declare class InvoiceItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateInvoiceDto {
    customerId: string;
    dueDate: string;
    items: InvoiceItemDto[];
}
