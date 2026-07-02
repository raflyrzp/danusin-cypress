/// <reference types="cypress" />

describe('Katalog & Transaksi', () => {
  const baseUrl: string = 'http://localhost:3000';

  beforeEach(() => {
    cy.window().then((win: Window) => {
      win.localStorage.setItem('token', 'valid_buyer_token');
    });
  });

  it('TP-CATALOG-01: Mencari dan Menyaring Produk Aktif (Positif)', () => {
    cy.visit(`${baseUrl}/products`);
    
    cy.get('input[type="search"]').type('Risol{enter}');
    cy.contains('Pre-Order Aktif').click();
    
    cy.contains('Risol Mayo Mozzarella').should('be.visible');
  });

  it('TP-CATALOG-02: Mencari Produk dengan Kata Kunci Karakter Khusus (Negatif)', () => {
    cy.visit(`${baseUrl}/products`);
    
    cy.get('input[type="search"]').type('@#$%^&*(){enter}');
    
    cy.contains('Produk tidak ditemukan').should('be.visible');
  });

  it('TP-TX-01: Membuat Pesanan Baru (Checkout) via COD (Positif)', () => {
    cy.visit(`${baseUrl}/products/1`);
    
    cy.get('#quantity').clear().type('3');
    cy.contains('Lobi Gedung A MIPA').click();
    cy.contains('Rabu').click();
    cy.get('#notes').type('Mayo dipisah');
    cy.contains('COD').click();
    
    cy.contains('button', 'Pesan Sekarang').click();
    
    cy.url().should('include', '/orders/me');
    cy.contains('sukses').should('exist');
  });

  it('TP-TX-02: Membuat Pesanan Melebihi Batas Stok Produk Tersedia (Negatif)', () => {
    cy.visit(`${baseUrl}/products/1`);
    
    cy.get('#quantity').clear().type('5');
    cy.contains('COD').click();
    cy.contains('button', 'Pesan Sekarang').click();
    
    cy.contains('Kuantitas pesanan melebihi sisa stok yang tersedia').should('be.visible');
  });
});
