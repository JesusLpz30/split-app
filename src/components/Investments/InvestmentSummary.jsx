import React from 'react';

const InvestmentSummary = ({ investments }) => {
    const totalInitialInvestment = investments.reduce((sum, inv) => sum + (inv.investmentInitialAmount || 0), 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.investmentCurrentValue || 0), 0);
    const totalGainLoss = totalCurrentValue - totalInitialInvestment;

    return (
        <div className="investment-summary-card">
            <h4>Resumen de Inversiones</h4>
            <p>Total Invertido: ${totalInitialInvestment.toFixed(2)}</p>
            <p>Valor Actual Total: ${totalCurrentValue.toFixed(2)}</p>
            <p>Ganancia/Pérdida Total: <span style={{ color: totalGainLoss >= 0 ? 'green' : 'red' }}>${totalGainLoss.toFixed(2)}</span></p>
        </div>
    );
};

export default InvestmentSummary;
