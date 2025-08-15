
export const banks = [
    { name: 'BBVA', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Santander', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'CaixaBank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Sabadell', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Bankinter', cardTypes: ['Visa', 'Mastercard', 'American Express'] },
    { name: 'ING', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Deutsche Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Abanca', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Unicaja', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Kutxabank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Citibank', cardTypes: ['Visa', 'Mastercard', 'American Express'] },
    { name: 'N26', cardTypes: ['Mastercard'] },
    { name: 'Revolut', cardTypes: ['Visa', 'Mastercard'] },
];

export const getCardTypeByNumber = (number) => {
    if (/^4/.test(number)) {
        return 'Visa';
    }
    if (/^5[1-5]/.test(number)) {
        return 'Mastercard';
    }
    if (/^3[47]/.test(number)) {
        return 'American Express';
    }
    if (/^6(?:011|5)/.test(number)) {
        return 'Discover';
    }
    return 'Desconocido';
};
