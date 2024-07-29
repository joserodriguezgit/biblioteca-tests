const { test, expect, chromium } = require('@playwright/test');
const {
  login, navigateToSection, addCategory, verifyCategoryExists, deleteCategory, addBook,
  verifyBookExists, deleteBook, cleanup, verifyBookExistsInHomePage, clickBookInHomePage,
  requestLoan, returnBook, verifyBookInLoanList
} = require('../utils');
const path = require('path');  

test.describe('Flujos E2E', () => {
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
    await cleanup(page);
  });

  
  test('Crear categoría y crear libro, y luego eliminar ambas cosas', async ({ page }) => {

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
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Percy Jackson y el ladron del rayo', path.resolve(__dirname, '../assets/bookImg.png'), '2003', 'Ciencia Ficción');

    // Verificar que el libro fue creado
    const bookCreated = await verifyBookExists(page, 'Percy Jackson y el ladron del rayo');
    expect(bookCreated).toBe(true);

    // Eliminar el libro
    await deleteBook(page, 'Percy Jackson y el ladron del rayo');

    // Eliminar la categoría
    await navigateToSection(page, 'Categorías');
    await deleteCategory(page, 'Ciencia Ficción');

    // Verificar que la categoría fue eliminada
    const categoryExists = await verifyCategoryExists(page, 'Ciencia Ficción');
    expect(categoryExists).toBe(false);

    // Verificar que el libro fue eliminado
    await navigateToSection(page, 'Libros');
    const bookExists = await verifyBookExists(page, 'Percy Jackson y el ladron del rayo');
    expect(bookExists).toBe(false);


  });

  test('Crear una categoría y un libro, eliminar la categoría sin haber eliminado el libro', async ({ page }) => {

    // Verificamos que se muestra la pantalla de inicio
    await expect(page.getByRole('heading', { name: 'No hay libros creados' })).toBeVisible();

    // Agregar una categoría
    await navigateToSection(page, 'Categorías');
    await addCategory(page, 'Ficción', 'Esta es una descripción de prueba.');
    await expect(page).toHaveURL(/\/admin\/categorys/);
   
    // Verificar que la categoría fue creada
    const categoryCreated = await verifyCategoryExists(page, 'Ficción');
    expect(categoryCreated).toBe(true);

    // Agregar un libro
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Percy Jackson y el ladron del PLD', path.resolve(__dirname, '../assets/bookImg.png'), '2003', 'Ficción');

    // Verificar que el libro fue creado
    const bookCreated = await verifyBookExists(page, 'Percy Jackson y el ladron del PLD');
    expect(bookCreated).toBe(true);

    // Eliminar la categoría
    await navigateToSection(page, 'Categorías');
    await deleteCategory(page, 'Ficción');

        // Verificar que fue eliminado el libro de la categoría eliminada.
        await navigateToSection(page, 'Libros');
        const bookExists = await verifyBookExists(page, 'Percy Jackson y el ladron del PLD');
        expect(bookExists).toBe(false);
  });

  test('Crear más de una categoría con múltiples libros, eliminar una categoría sin haber eliminado sus libros', async ({ page }) => {

    // Verificamos que se muestra la pantalla de inicio
    await expect(page.getByRole('heading', { name: 'No hay libros creados' })).toBeVisible();

    // Agregar una categoría
    await navigateToSection(page, 'Categorías');
    await addCategory(page, 'Ciencia', 'Son libros que te muestran un mundo que ya existe y es maravilloso.');
    await expect(page).toHaveURL(/\/admin\/categorys/);
   
    // Verificar que la categoría fue creada
    const categoryCreated = await verifyCategoryExists(page, 'Ciencia');
    expect(categoryCreated).toBe(true);

    // Agregar una categoría
    await navigateToSection(page, 'Categorías');
    await addCategory(page, 'Comedia', 'Son libros que dan risa.');
    await expect(page).toHaveURL(/\/admin\/categorys/);
    
    // Verificar que la categoría fue creada
    const category2Created = await verifyCategoryExists(page, 'Comedia');
    expect(category2Created).toBe(true);

    // Agregar un libro de Ciencia
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Percy Jackson y el ladron del barrio', path.resolve(__dirname, '../assets/bookImg.png'), '2003', 'Ciencia');

    // Verificar que el libro fue creado
    const bookCreated = await verifyBookExists(page, 'Percy Jackson y el ladron del barrio');
    expect(bookCreated).toBe(true);

    // Agregar otro libro de Ciencia
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Otro Libro', path.resolve(__dirname, '../assets/bookImg2.png'), '2001', 'Ciencia');

    // Verificar que el segundo libro fue creado
    const book2Created = await verifyBookExists(page, 'Otro Libro');
    expect(book2Created).toBe(true);

    // Agregar un libro de Comedia
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Libro de Comedia', path.resolve(__dirname, '../assets/bookImg3.png'), '1999', 'Comedia');

    // Verificar que el tercer libro fue creado
    const book3Created = await verifyBookExists(page, 'Libro de Comedia');
    expect(book3Created).toBe(true);

    // Eliminar la categoría de Ciencia
    await navigateToSection(page, 'Categorías');
    await deleteCategory(page, 'Ciencia');

    // Verificar que la categoría fue eliminada
    const categoryExists = await verifyCategoryExists(page, 'Ciencia');
    expect(categoryExists).toBe(false);

    // Verificar que los libros correctos fueron eliminados
    await navigateToSection(page, 'Libros');
    const bookExists = await verifyBookExists(page, 'Percy Jackson y el ladron del barrio');
    expect(bookExists).toBe(false);
    const book2Exists = await verifyBookExists(page, 'Otro Libro');
    expect(book2Exists).toBe(false);
    const book3Exists = await verifyBookExists(page, 'Libro de Comedia');
    expect(book3Exists).toBe(true);
  });

  test('Crear categoría y libro, y luego reservar el libro y devolverlo', async ({ page }) => {
    const bookTitle = 'Percy Jackson y el ladron del corazón';

    // Verificamos que se muestra la pantalla de inicio
    await expect(page.getByRole('heading', { name: 'No hay libros creados' })).toBeVisible();

    // Agregar una categoría
    await navigateToSection(page, 'Categorías');
    await addCategory(page, 'Romance', 'Vainas de las que lee mi esposa.');
    await expect(page).toHaveURL(/\/admin\/categorys/);
   
    // Verificar que la categoría fue creada
    const categoryCreated = await verifyCategoryExists(page, 'Romance');
    expect(categoryCreated).toBe(true);

    // Agregar un libro de Romance
    await navigateToSection(page, 'Libros');
    await addBook(page, bookTitle, path.resolve(__dirname, '../assets/bookImg.png'), '2003', 'Romance');

    // Verificar que el libro fue creado
    const bookCreated = await verifyBookExists(page, bookTitle);
    expect(bookCreated).toBe(true);

    // Verificar que el libro se muestre en la pantalla principal
    await navigateToSection(page, 'Home');
    await verifyBookExistsInHomePage(page, bookTitle);

    // Seleccionar el libro para ver sus detalles
    await clickBookInHomePage(page, bookTitle);

    // Verificar que la pantalla de detalles del libro abra correctamente y reservar el libro
    await requestLoan(page);
    await expect(page).toHaveURL(/\/loans/);

    // Verificar que el libro aparezca en la lista de libros prestados
    const inLoanList = await verifyBookInLoanList(page, bookTitle);
    expect(inLoanList).toBe(true);

    //Devolver el libro y verificar que se actualicen los datos
    const returnedSuccessfully = await returnBook(page, bookTitle);
    expect(returnedSuccessfully).toBe(true);

    // Verificar que el libro se muestre nuevamente en la pantalla principal
    await navigateToSection(page, 'Home');
    await verifyBookExistsInHomePage(page, bookTitle);

  });

});
