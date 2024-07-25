const { test, expect } = require('@playwright/test');
const {
  login, navigateToSection, addCategory, verifyCategoryExists,
  deleteCategory, addBook, verifyBookExists, deleteBook
} = require('../utils');

test.describe('Flujo E2E', () => {
  // Abrimos la página al inicio de cada prueba.
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });
  
  test('Flujo punto a punto de crear categoría, crear libro, y luego eliminar ambas cosas', async ({ page }) => {
    // Entramos con el usuario admin
    await login(page, 'jose', '1234');

    // Verificamos que se muestra la pantalla de inicio
    await expect(page.getByRole('heading', { name: 'No hay libros creados' })).toBeVisible();

    // Agregar una categoría
    await navigateToSection(page, 'Categorías');
    await addCategory(page, 'Ciencia Ficción', 'Son libros que te crean un mundo nuevo para imaginar.');
    await expect(page).toHaveURL('/admin/categorys');
   
    // Verificar que la categoría fue creada
    const categoryCreated = await verifyCategoryExists(page, 'Ciencia Ficción');
    expect(categoryCreated).toBe(true);

    // Agregar un libro
    await navigateToSection(page, 'Libros');
    await addBook(page, 'Percy Jackson y el ladron del rayo', resolve(__dirname, '../assets/bookImg.png'), '2003', 'Ciencia Ficción');

    // Verificar que el libro fue creado
    const bookCreated = await verifyBookExists(page, 'Percy Jackson y el ladron del rayo');
    expect(bookCreated).toBe(true);
    
    // Eliminar el libro
    if (bookCreated) {
      const bookDeleted = await deleteBook(page, 'Percy Jackson y el ladron del rayo');
      expect(bookDeleted).toBe(true);
    }

    // Eliminar la categoría
    if (categoryCreated) {
      const categoryDeleted = await deleteCategory(page, 'Ciencia Ficción');
      expect(categoryDeleted).toBe(true);
    }
    
  });
});
