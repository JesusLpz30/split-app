
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
    { name: 'HSBC', cardTypes: ['Visa', 'Mastercard', 'American Express'] },
    { name: 'JPMorgan Chase', cardTypes: ['Visa', 'Mastercard', 'American Express', 'Discover'] },
    { name: 'Bank of America', cardTypes: ['Visa', 'Mastercard', 'American Express', 'Discover'] },
    { name: 'Wells Fargo', cardTypes: ['Visa', 'Mastercard', 'American Express', 'Discover'] },
    { name: 'Goldman Sachs', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Morgan Stanley', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'BNP Paribas', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Crédit Agricole', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Mizuho Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Sumitomo Mitsui', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'UBS', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Credit Suisse', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Standard Chartered', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Barclays', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Lloyds Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'RBS', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Commonwealth Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'NAB', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'ANZ', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Westpac', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'TD Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'RBC', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Scotiabank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'BMO', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'CIBC', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'DBS Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'OCBC Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'UOB', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'ICBC', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'China Construction Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Agricultural Bank of China', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Bank of China', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'HDFC Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'ICICI Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Axis Bank', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'State Bank of India', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Itaú Unibanco', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Banco Bradesco', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Banco do Brasil', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'BTG Pactual', cardTypes: ['Visa', 'Mastercard'] },
    { name: 'Nubank', cardTypes: ['Visa', 'Mastercard'] },
];

export const getCardTypeByNumber = (number) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');

    // Visa: Starts with 4
    if (/^4/.test(cleanNumber)) {
        return 'Visa';
    }
    // Mastercard: Starts with 51-55, 2221-2720
    if (/^(5[1-5]|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(cleanNumber)) {
        return 'Mastercard';
    }
    // American Express: Starts with 34 or 37
    if (/^3[47]/.test(cleanNumber)) {
        return 'American Express';
    }
    // Discover: Starts with 6011, 644-649, 65
    if (/^(6011|64[4-9]|65)/.test(cleanNumber)) {
        return 'Discover';
    }
    // Diners Club: Starts with 300-305, 309, 36, 38-39
    if (/^(30[0-5]|309|36|38|39)/.test(cleanNumber)) {
        return 'Diners Club';
    }
    // JCB: Starts with 3528-3589
    if (/^35(2[8-9]|[3-8][0-9])/.test(cleanNumber)) {
        return 'JCB';
    }
    // UnionPay: Starts with 62
    if (/^62/.test(cleanNumber)) {
        return 'UnionPay';
    }

    return 'Desconocido';
};
