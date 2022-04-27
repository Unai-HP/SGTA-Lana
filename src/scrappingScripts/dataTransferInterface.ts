export function dataTransferInterface(data: any): any {
    return {
        data: data,
        type: 'dataTransfer'
    };
}
// Test function
dataTransferInterface({
    "Hello": "World"
});
