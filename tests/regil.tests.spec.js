// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Create User', () => {
  async function login(page) {
    await page.goto('http://localhost:3000/login'); // Change URL to your application's login page
    // Fill in login form
    await page.fill('input[name="user"]', 'rbatista');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000'); // Change URL to the page you expect after login
  }

  test('Create a new user with valid data', async ({ page }) => {
    test.setTimeout(30000); // Increase timeout to 30 seconds
    await login(page);

    // Navigate to "Usuarios" page
    await page.click('text=Usuarios');

    // Click on "Añadir Usuario"
    await page.click('text=Añadir un usuario');

    // Fill in the user creation form
    await page.fill('input[name="name"]', 'Juan');
    await page.fill('input[name="lastname"]', 'Perez');
    await page.fill('input[name="user"]', 'juanperez');
    await page.fill('input[name="email"]', 'juan.perez@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmpassword"]', 'password123');
    await page.selectOption('select[name="rol"]', 'false'); // Select "User" role

    // Click on "Crear"
    await page.click('button[type="submit"]');

    // Verify the confirmation message
    await expect(page.locator('text=Usuario creado correctamente')).toBeVisible();

    // Verify the new user appears in the list of users
    await page.goto('http://localhost:3000/admin/users'); // Navigate to the user list page if needed
    const newUser = await page.locator('text=juanperez');
    await expect(newUser).toBeVisible();
  });
});

test.describe('Edit User', () => {
  async function login(page) {
    await page.goto('http://localhost:3000/login'); // Change URL to your application's login page
    await page.fill('input[name="user"]', 'rbatista');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000'); // Change URL to the page you expect after login
  }

  test('Edit an existing user with valid data', async ({ page }) => {
    test.setTimeout(30000); // Increase timeout to 30 seconds
    await login(page);

    // Navigate to "Usuarios" page
    await page.click('text=Usuarios');

    // Click on the edit button for the first user in the list
    await page.click('text=Editar', { timeout: 5000 });

    // Fill in the edit user form with new data
    await page.fill('input[name="name"]', 'Juan Updated');
    await page.fill('input[name="lastname"]', 'Perez Updated');
    await page.fill('input[name="email"]', 'juan.updated@example.com');
    await page.selectOption('select[name="rol"]', 'true'); // Select "Admin" role

    // Click on "Guardar"
    await page.click('button[type="submit"]');

    // Verify the confirmation message
    await expect(page.locator('text=Usuario actualizado correctamente')).toBeVisible();

    // Verify the updated user appears in the list of users
    await page.goto('http://localhost:3000/admin/users'); // Navigate to the user list page if needed
    const updatedUser = await page.locator('text=juan.updated@example.com');
    await expect(updatedUser).toBeVisible();
  });
});

test.describe('User Deletion', () => {
  // Function to login before tests
  async function login(page) {
    // Navigate to the login page
    await page.goto('http://localhost:3000/login'); // Change URL to your application's login page

    // Fill in login form
    await page.fill('input[name="user"]', 'rbatista');
    await page.fill('input[name="password"]', '1234');

    // Submit the login form
    await page.click('button[type="submit"]');

    // Wait for successful login by checking for a user-specific element (e.g., the presence of the logout button)
    await page.waitForURL('http://localhost:3000'); // Change URL to the page you expect after login
  }

  // Function to ensure at least one user exists to delete
  async function ensureUserExists(page, username = 'testuser') {
    // Navigate to the Users page
    await page.click('text=Usuarios');
    
    // Wait for the user list to load
    await page.waitForSelector('table.table', { timeout: 20000 });
  
    // Check if the user exists by username
    const userLocator = page.locator(`tr:has(td:has-text("${username}"))`);
    if (await userLocator.count() === 0) {
      // Add a user if none exists
      console.log('No users found. Adding a new user.');
  
      // Click the "Add User" link
      await page.click('a[href="/admin/add-users"]');
      
      // Fill in the form to add a user
      await page.fill('input[name="name"]', 'Test');
      await page.fill('input[name="lastname"]', 'User');
      await page.fill('input[name="user"]', username);
      await page.fill('input[name="email"]', 'testuser@example.com');
      await page.fill('input[name="password"]', 'password123'); // Assuming a password is required
      await page.fill('input[name="confirmpassword"]', 'password123'); // Confirm password
      
      // Select role from dropdown
      await page.selectOption('select[name="rol"]', 'false'); // Select 'User' role (change if needed)
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for a confirmation message or redirect (adjust selector if needed)
      await page.waitForSelector('text=Usuario añadido correctamente', { timeout: 20000 });
    } else {
      console.log(`User with username "${username}" already exists.`);
    }
  }
  
  test('Delete existing user', async ({ page }) => {
    test.setTimeout(20000); // Increase timeout to 60 seconds
    await login(page);
    await ensureUserExists(page);
  
    // Click on "Usuarios" in the menu
    await page.click('text=Usuarios');
    
    // Wait for the user list to be visible
    await page.waitForSelector('table.table', { timeout: 20000 });
  
    // Log the HTML content to verify
    const htmlContent = await page.content();
    console.log(htmlContent);
  
    // Locate the user row by username
    const userRow = page.locator('tr:has(td:has-text("testuser"))'); // Search by username
    const count = await userRow.count();
    console.log(`Found ${count} rows with username "testuser"`);
    if (count === 0) {
      throw new Error('User row not found');
    }
    
    // Find and click the delete button in the row
    const deleteButton = userRow.locator('form[action="/admin/drop-users"] button.delete-user');
    await deleteButton.click();
  
    // Verify the confirmation message
    await expect(page.locator('text=Usuario eliminado correctamente')).toBeVisible();
  
    // Verify the user is no longer in the list
    await expect(userRow).toHaveCount(0);
  });
  
});


test.describe('User Creation with Invalid Data', () => {
  // Function to login before tests
  async function login(page) {
    // Navigate to the login page
    await page.goto('http://localhost:3000/login'); // Change URL to your application's login page

    await page.fill('input[name="user"]', 'rbatista');
    await page.fill('input[name="password"]', '1234');
    
    // Submit the login form
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL('http://localhost:3000'); // Change URL to the page you expect after login
  }

  test('Create user with missing or incorrect data', async ({ page }) => {
    // Set a longer timeout for the test
    test.setTimeout(30000); // Increase timeout to 30 seconds
    
    await login(page);

    // Navigate to the Users page
    await page.click('text=Usuarios');
    await page.click('a[href="/admin/add-users"]');

    // Fill the form with invalid data
    await page.fill('input[name="name"]', ''); // Leave name empty
    await page.fill('input[name="lastname"]', ''); // Leave lastname empty
    await page.fill('input[name="user"]', ''); // Leave username empty
    await page.fill('input[name="email"]', 'invalid-email'); // Enter invalid email
    await page.fill('input[name="password"]', ''); // Leave password empty
    await page.fill('input[name="confirmpassword"]', ''); // Leave confirm password empty
    await page.selectOption('select[name="rol"]', 'false'); // Select role

  //Submit the form
    await page.click('button[type="submit"]');

    // Verify the confirmation message
    await expect(page.locator('text=Todos los campos son obligatorios')).toBeVisible();
    
  });
});

test.describe('Book Creation', () => {
  async function login(page) {
    await page.goto('http://localhost:3000/login'); // Change URL to your application's login page
    await page.fill('input[name="user"]', 'rbatista');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000'); // Change URL to the page you expect after login
  }

  test('Create a new book with valid data', async ({ page }) => {
    test.setTimeout(30000); // Increase timeout to 30 seconds
    await login(page);

    // Navigate to "Libros" page
    await page.click('text=Libros');
    
    // Click "Añadir un libro"
    await page.click('a[href="/admin/add-books"]');

    // Fill the book creation form
    await page.fill('input[name="name"]', 'Percy Jackson y el ladrón del rayo');
    await page.setInputFiles('input[name="image"]', path.join(__dirname, 'bookImg.png')); // Replace with the path to an image file
    await page.fill('input[name="date"]', '2005');
    await page.selectOption('select[name="category"]', '1'); // Replace with a valid category value

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify the confirmation message
    await expect(page.locator('text=Libro añadido correctamente')).toBeVisible();
  });
});

test.describe('Edit Book', () => {
  async function login(page) {
    await page.goto('http://localhost:3000/login'); // Change URL to your application's login page
    await page.fill('input[name="user"]', 'rbatista');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000'); // Change URL to the page you expect after login
  }

  test('Edit an existing book with valid data', async ({ page }) => {
    test.setTimeout(30000); // Increase timeout to 30 seconds
    await login(page);

    // Navigate to "Libros" page
    await page.click('text=Libros');

    // Click the edit button for the first book in the list
    const editButton = page.locator('a:has-text("Editar")').first();
    await editButton.click();

    // Fill the edit form with new data
    await page.fill('input[name="name"]', 'Percy Jackson y el mar de los monstruos');
    await page.setInputFiles('input[name="image"]',  path.join(__dirname, 'bookImg2.png')); // Replace with the path to a new image file
    await page.fill('input[name="date"]', '2006');
    await page.selectOption('select[name="category"]', '2'); // Replace with a valid category value

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify the confirmation message
    await expect(page.locator('text=Libro editado correctamente')).toBeVisible();

    // Verify the updated book appears in the list of books
    await page.click('text=Libros'); // Ensure the page is refreshed to see the updated book
    await expect(page.locator('text=Percy Jackson y el mar de los monstruos')).toBeVisible();
  });
});



test.describe('Delete Book', () => {
  async function login(page) {
    await page.goto('http://localhost:3000/login'); // Change URL to your application's login page
    await page.fill('input[name="user"]', 'rbatista');
    await page.fill('input[name="password"]', '1234');
    
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000'); // Change URL to the page you expect after login
  }

  test('Delete an existing book', async ({ page }) => {
    test.setTimeout(30000); // Increase timeout to 30 seconds
    await login(page);

    // Navigate to "Libros" page
    await page.click('text=Libros');

    // Locate the first book's delete button and click it
    const deleteButton = page.locator('button.delete-book').first();
    await deleteButton.click();


    // Verify the confirmation message
    await expect(page.locator('text=Libro eliminado correctamente')).toBeVisible();

    // Verify the book is no longer in the list
    const deletedBook = await page.locator('text=Percy Jackson y el ladron del rayo').count(); // Replace with the title of the book to be deleted
    expect(deletedBook).toBe(0);
  });
});
