/// <reference types="cypress" />

describe('Pengolahan Status, Ulasan, Notifikasi, dan Dashboard', () => {
  const baseUrl: string = 'http://localhost:3000';

  it('TP-STATUS-01: Pembaruan Status Siklus Hidup Transaksi Secara Berurutan oleh Seller (Positif)', () => {
    cy.window().then((win: Window) => win.localStorage.setItem('token', 'valid_seller_token'));
    cy.visit(`${baseUrl}/store/orders`);
    
    cy.contains('Menunggu Konfirmasi').parent().within(() => {
      cy.contains('button', 'Proses Pesanan').click();
    });
    
    cy.contains('Diproses').parent().within(() => {
      cy.contains('button', 'Selesaikan Pesanan').click();
    });
    
    cy.contains('Selesai').should('exist');
  });

  it('TP-STATUS-02: Memperbarui Status Pesanan yang Dibatalkan (Negatif API)', () => {
    cy.request({
      method: 'PATCH',
      url: `${baseUrl}/api/v1/orders/888/status`,
      headers: { Authorization: 'Bearer valid_seller_token' },
      body: { status: 'DIPROSES' },
      failOnStatusCode: false
    }).then((response: Cypress.Response<any>) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.eq('Transisi status pesanan tidak valid');
    });
  });

  it('TP-REVIEW-01: Buyer Mengirimkan Ulasan Valid pada Pesanan Selesai (Positif)', () => {
    cy.window().then((win: Window) => win.localStorage.setItem('token', 'valid_buyer_token'));
    cy.visit(`${baseUrl}/orders/me`);
    
    cy.contains('Selesai').parent().within(() => {
      cy.contains('button', 'Beri Ulasan').click();
    });
    
    cy.get('input[name="rating"][value="5"]').click({ force: true });
    cy.get('textarea[name="comment"]').type('Makanannya lezat sekali, mozza-nya mulur sempurna!');
    cy.contains('button', 'Kirim Ulasan').click();
    
    cy.contains('Beri Ulasan').should('be.disabled');
  });

  it('TP-NOTIF-01 & 02: Menandai Seluruh Notifikasi Aktif Sebagai Dibaca', () => {
    cy.window().then((win: Window) => win.localStorage.setItem('token', 'valid_buyer_token'));
    cy.visit(`${baseUrl}/`);
    
    cy.get('.notification-bell').click();
    
    cy.contains('Tandai Semua Dibaca').click();
    
    cy.get('.notification-badge').should('not.exist');
  });

  it('TP-DASH-01: Akurasi Pembaruan Data Ringkasan Pendapatan Seller', () => {
    cy.window().then((win: Window) => win.localStorage.setItem('token', 'valid_seller_token'));
    cy.visit(`${baseUrl}/store`);
    
    cy.contains('Total Pendapatan').parent().should('contain', '45.000');
    cy.contains('Total Pesanan Selesai').parent().should('contain', '1');
  });
});
