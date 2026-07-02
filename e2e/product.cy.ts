/// <reference types="cypress" />
import 'cypress-file-upload';

describe('Pengelolaan Produk & Manajemen Gambar', () => {
  const baseUrl: string = 'http://localhost:3000';

  beforeEach(() => {
    cy.window().then((win: Window) => {
      win.localStorage.setItem('token', 'valid_seller_token');
    });
  });

  it('TP-PRODUCT-01: Membuat Produk Pre-Order Baru dengan Detail Rentang Tanggal Valid (Positif)', () => {
    cy.visit(`${baseUrl}/store/products/new`);
    
    cy.get('#name').type('Risol Mayo Mozzarella');
    cy.get('#description').type('Risol dengan isi mayo melimpah dan keju mozzarella premium');
    cy.get('#price').clear().type('15000');
    cy.get('#stock').clear().type('50');
    
    cy.contains('Lobi Gedung A MIPA').click();
    cy.contains('Rabu').click();
    
    cy.get('#po_open_date').type('2026-07-03');
    cy.get('#po_close_date').type('2026-07-05');
    cy.get('#delivery_date').type('2026-07-07');
    
    cy.contains('button', 'Simpan Produk').click();
    
    cy.contains('Produk berhasil dibuat').should('be.visible');
    cy.url().should('include', '/store/products');
  });

  it('TP-PRODUCT-02: Membuat Produk PO dengan Tanggal Tutup Mendahului Buka PO (Negatif)', () => {
    cy.visit(`${baseUrl}/store/products/new`);
    
    cy.get('#po_open_date').type('2026-07-03');
    cy.get('#po_close_date').type('2026-07-02');
    cy.get('#delivery_date').type('2026-07-07');
    
    cy.contains('button', 'Simpan Produk').click();
    
    cy.contains('Tanggal tutup PO tidak boleh sebelum tanggal buka PO').should('be.visible');
  });

  it('TP-UPLOAD-01: Mengunggah Gambar Produk dengan Format dan Ukuran Valid (Positif)', () => {
    cy.visit(`${baseUrl}/store/products`);
    cy.contains('button', 'Pilih Gambar').click();
    
    cy.get('input[type="file"]').attachFile('risol.jpg');
    cy.contains('button', 'Upload').click();
    
    cy.get('img.preview-image').should('be.visible');
  });

  it('TP-UPLOAD-02: Mengunggah Berkas Gambar Berformat Tidak Valid (Negatif)', () => {
    cy.visit(`${baseUrl}/store/products`);
    cy.contains('button', 'Pilih Gambar').click();
    
    cy.get('input[type="file"]').attachFile('katalog_produk.pdf');
    cy.contains('button', 'Upload').click();
    
    cy.contains('Format file tidak didukung').should('be.visible');
  });
});
