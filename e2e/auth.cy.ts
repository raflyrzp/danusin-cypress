/// <reference types="cypress" />

describe('Autentikasi & Otorisasi', () => {
  const baseUrl: string = 'http://localhost:3000';

  it('TP-AUTH-01: Registrasi Akun Baru dengan Data Valid (Positif)', () => {
    cy.visit(`${baseUrl}/register`);
    
    cy.get('#nim').type('2108107010001');
    cy.get('#name').type('John Doe');
    cy.get('#major').type('Informatika');
    cy.get('#faculty').type('MIPA');
    cy.get('#batch_year').type('2021');
    cy.get('#whatsapp').type('081234567890');
    cy.get('#email').type('johndoe@student.unsyiah.ac.id');
    cy.get('#password').type('PasswordMhs123');
    
    cy.get('input[type="checkbox"]').check();
    
    cy.contains('button', 'Daftar Sekarang').click();
    
    cy.contains('Registrasi berhasil').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('TP-AUTH-02: Registrasi Akun Menggunakan NIM yang Sudah Terdaftar (Negatif)', () => {
    cy.visit(`${baseUrl}/register`);
    
    cy.get('#nim').type('2108107010001');
    cy.get('#name').type('Jane Doe');
    cy.get('#major').type('Informatika');
    cy.get('#faculty').type('MIPA');
    cy.get('#batch_year').type('2021');
    cy.get('#whatsapp').type('081234567891');
    cy.get('#email').type('janedoe@student.unsyiah.ac.id');
    cy.get('#password').type('PasswordMhs123');
    cy.get('input[type="checkbox"]').check();
    
    cy.contains('button', 'Daftar Sekarang').click();
    
    cy.contains('NIM sudah terdaftar').should('be.visible');
    cy.url().should('include', '/register');
  });

  it('TP-AUTH-03: Login Pengguna Menggunakan Email dan Password Valid (Positif)', () => {
    cy.visit(`${baseUrl}/login`);
    
    cy.get('#credential').type('johndoe@student.unsyiah.ac.id');
    cy.get('#password').type('PasswordMhs123');
    cy.contains('button', 'Masuk').click();
    
    cy.contains('Login berhasil').should('be.visible');
    cy.window().then((win: Window) => {
      expect(win.localStorage.getItem('token')).to.exist;
    });
    cy.url().should('eq', `${baseUrl}/`);
  });

  it('TP-AUTH-04: Akses Halaman Terproteksi Seller oleh Pengguna Berperan Buyer (Negatif)', () => {
    cy.window().then((win: Window) => {
      win.localStorage.setItem('token', 'dummy_buyer_jwt_token');
    });
    
    cy.visit(`${baseUrl}/store`, { failOnStatusCode: false });
    
    cy.url().should('not.include', '/store');
    cy.url().should('eq', `${baseUrl}/`);
  });
});
