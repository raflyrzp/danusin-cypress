describe('Manajemen Toko', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'valid_buyer_token');
    });
    cy.visit(`${baseUrl}/buyer/upgrade`);
  });

  it('TP-STORE-01: Upgrade ke Akun Seller dengan Data Lengkap dan Valid (Positif)', () => {
    cy.get('#store_name').type('Dapur Informatika');
    cy.get('#description').type('Menjual jajanan sehat buatan mahasiswa Informatika');
    cy.get('#whatsapp').type('081234567890');
    
    cy.contains('Lobi Gedung A MIPA').click();
    cy.contains('Kantin MIPA').click();
    cy.contains('Senin').click();
    cy.contains('Rabu').click();
    cy.contains('Jumat').click();
    
    cy.contains('button', 'Aktifkan Toko Saya').click();
    
    cy.url().should('include', '/store');
  });

  it('TP-STORE-02: Upgrade ke Akun Seller Tanpa Menentukan Lokasi Pengambilan (Negatif)', () => {
    cy.get('#store_name').type('Dapur Informatika');
    cy.get('#description').type('Menjual jajanan sehat buatan mahasiswa Informatika');
    cy.get('#whatsapp').type('081234567890');
    
    cy.contains('Senin').click();
    
    cy.contains('button', 'Aktifkan Toko Saya').click();
    
    cy.contains('Lokasi pengambilan minimal harus memilih 1 lokasi').should('be.visible');
    cy.url().should('include', '/buyer/upgrade');
  });
});
