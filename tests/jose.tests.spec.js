const { test, expect, chromium } = require('@playwright/test');
const {
  login, navigateToSection, addCategory, verifyCategoryExists, 
  deleteCategory, addBook, verifyBookExists, deleteBook, cleanup
} = require('../utils');
const path = require('path');  

test.describe('Flujo E2E', () => {
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

  
  test('Flujo punto a punto de crear categoría, crear libro, y luego eliminar ambas cosas', async ({ page }) => {

    // Verificamos que se muestra la pantalla de inicio
    await expect(page.getByRole('heading', { name: 'No hay libros creados' })).toBeVisible();

    // Agregar una categoría
    await navigateToSection(page, 'Categorías');
    await addCategory(page, 'Ciencia Ficción', 'Son libros que te crean un mundo nuevo para imaginar.');
    await expect(page).toHaveURL(/\/admin\/categorys/);
   
    // Verificar que la categoría fue creada
    const categoryCreated = await verifyCategoryExists(page, 'Ciencia Ficción');
    expect(categoryCreated).toBe(true);

    // Agregar un libro
    await navigateToSection(page, ' Libros');
    await addBook(page, 'Percy Jackson y el ladron del rayo', path.resolve(__dirname, '../assets/bookImg.png'), '2003', 'Ciencia Ficción');

    // Verificar que el libro fue creado
    const bookCreated = await verifyBookExists(page, 'Percy Jackson y el ladron del rayo');
    expect(bookCreated).toBe(true);
        
  });
});
