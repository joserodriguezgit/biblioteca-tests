const { test, expect, chromium } = require('@playwright/test');
const {
  login, navigateToSection, addCategory, verifyCategoryExists, deleteCategory, addBook,
  verifyBookExists, deleteBook, cleanup, verifyBookExistsInHomePage, clickBookInHomePage,
  requestLoan, returnBook, verifyBookInLoanList, searchBook
} = require('../utils');
const path = require('path');  

test.describe('Búsqueda y Favoritos', () => {
  // Creamos una instancia separada a todas las pruebas para el setup inicial y la limpieza al final
  let browser, page;
  
  // Limpiamos los datos de prueba antes de iniciar
  test.beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
    await login(page, 'jose', '1234');
    await cleanup(page);
  });

  // Limpiamos los datos de prueba al finalizar
  test.afterAll(async () => {
    await cleanup(page);
    await browser.close();
  });

  // Abrimos la página al inicio de cada prueba.
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await login(page, 'jose', '1234');
  });

  test('Realizar búsqueda de libro', async ({ page }) => {

    // Verificamos que se muestra la pantalla de inicio
    await expect(page.getByRole('heading', { name: 'No hay libros creados' })).toBeVisible();

    // Agregar una categoría
    await navigateToSection(page, 'Categorías');
    await addCategory(page, 'Deportes', 'Libros sobre actividades deportivas y más.');
    await expect(page).toHaveURL(/\/admin\/categorys/);
   
    // Verificar que la categoría fue creada
    const categoryCreated = await verifyCategoryExists(page, 'Deportes');
    expect(categoryCreated).toBe(true);

    // Agregar un libro
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Nba 1', path.resolve(__dirname, '../assets/bookImg.png'), '2023', 'Deportes');

    // Verificar que el libro fue creado
    const bookCreated = await verifyBookExists(page, 'Nba 1');
    expect(bookCreated).toBe(true);

    // Agregar otro libro
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Nba 2', path.resolve(__dirname, '../assets/bookImg2.png'), '2024', 'Deportes');

    // Verificar que el libro fue creado
    const book2Created = await verifyBookExists(page, 'Nba 2');
    expect(book2Created).toBe(true);

    // Agregar un tercer libro
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Mlb 1', path.resolve(__dirname, '../assets/bookImg3.png'), '2020', 'Deportes');

    // Verificar que el libro fue creado
    const book3Created = await verifyBookExists(page, 'Mlb 1');
    expect(book3Created).toBe(true);

    // Realizar búsqueda de libro
    await navigateToSection(page, 'Home');
    await searchBook(page, 'Nba 2')

    const bookExists = await verifyBookExistsInHomePage(page, 'Nba 1');
    expect(bookExists).toBe(false);
    const book2Exists = await verifyBookExistsInHomePage(page, 'Nba 2');
    expect(book2Exists).toBe(true);
    const book3Exists = await verifyBookExistsInHomePage(page, ' Mlb 1');
    expect(book3Exists).toBe(false);

  });
});