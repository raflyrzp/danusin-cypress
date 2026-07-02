/// <reference types="cypress" />

describe('Pembayaran Digital & Webhook', () => {
  const baseUrl: string = 'http://localhost:3000';

  it('TP-PAY-01 & TP-PAY-02: Simulasi Eksekusi Midtrans (Backend API Automation)', () => {
    const mockOrderId: number = 999;
    
    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/v1/orders/payments/webhook`,
      body: {
        order_id: `DANUS-${mockOrderId}`,
        transaction_status: 'settlement',
        gross_amount: '45000'
      }
    }).then((response: Cypress.Response<any>) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      method: 'POST',
      url: `${baseUrl}/api/v1/orders/payments/webhook`,
      body: {
        order_id: `DANUS-${mockOrderId}`,
        transaction_status: 'expire',
      }
    }).then((response: Cypress.Response<any>) => {
      expect(response.status).to.eq(200);
    });
  });
});
