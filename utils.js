const { chromium } = require('playwright');
const { format } = require('date-fns');

async function login(page, username, password) {
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Contraceña').fill(password);
  await page.getByText('Ingresar').click();
}

async function navigateToSection(page, sectionName) {
  const menuOption = await page.getByRole('link', { name: sectionName, exact: true });
  await menuOption.click();
}

async function addCategory(page, categoryName, categoryDescription) {
  await page.getByText('Añadir una categoria').click();
  const nameInput = await page.getByPlaceholder('Ejemplo: Novela de aventuras');
  await nameInput.fill(categoryName);
  
  const descriptionInput = await page.getByPlaceholder(
    'Ejemplo: La novela de aventuras es la esencia misma de la ficción, puesto que se gesta con el sencillo objetivo de entretener.'
  );
  await descriptionInput.fill(categoryDescription);

  const createButton = await page.getByText('Crear');
  await createButton.click();
}

async function verifyCategoryExists(page, categoryName) {
  const categoryContainer = await page.locator('#category-container');
  const categoryElement = await categoryContainer.getByText(categoryName);
  
  return await categoryElement.count() > 0;
}

async function deleteCategory(page, categoryName) {
  const categoryContainer = await page.locator('#category-container');
  const categoryElement = await categoryContainer.getByText(categoryName, { exact: true });
  
  if (await categoryElement.count() > 0) {
    const categoryCard = await categoryElement.locator('xpath=ancestor::div[contains(@class, "card")]');
    const deleteButton = await categoryCard.locator('.delete-category');
    await deleteButton.click();
    const deletedCategory = await categoryContainer.getByText(categoryName, { exact: true });
    return await deletedCategory.count() === 0;
  }
  return false;
}

async function addBook(page, bookName, bookImagePath, bookYear, bookCategory) {
  await page.getByText('Añadir un libro').click();
  await page.getByPlaceholder('Ejemplo: Percy Jackson y el ladron del rayo').fill(bookName);
  await page.setInputFiles('input[name="image"]', bookImagePath);
  await page.getByPlaceholder('Ejemplo: 2003 ').fill(bookYear);
  await page.selectOption('#categorys', { label: bookCategory });
  await page.getByText('Crear').click();
  const successMessage = await page.locator('.alert.alert-success').innerText();
  return successMessage.includes('Libro añadido correctamente');
}

async function verifyBookExists(page, bookName) {
    const bookContainer = await page.locator('#book-container');
    const bookElement = await bookContainer.getByText(bookName);
    return await bookElement.count() > 0;
  }
  
async function deleteBook(page, bookName) {
const bookContainer = await page.locator('#book-container');
const bookElement = await bookContainer.getByText(bookName);

if (await bookElement.count() > 0) {
    const bookCard = await bookElement.locator('xpath=ancestor::div[contains(@class, "card")]');
    const deleteButton = await bookCard.locator('.delete-book');
    await deleteButton.click();
    const deletedBook = await bookContainer.getByText(bookName);
    return await deletedBook.count() === 0;
}
return false;
}
  
async function listAllBooks(page) {
  const bookContainer = await page.locator('#book-container');
  const bookElements = await bookContainer.locator('.card-title');
  return await bookElements.allInnerTexts();
}

async function listAllCategories(page) {
  const categoryContainer = await page.locator('#category-container');
  const categoryElements = await categoryContainer.locator('.card-title');
  return await categoryElements.allInnerTexts();
}

async function cleanup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');
  await login(page, 'jose', '1234');

  // Delete all books
  await navigateToSection(page, 'Libros');
  const books = await listAllBooks(page);
  for (const book of books) {
    await deleteBook(page, book);
  }

  // Delete all categories
  await navigateToSection(page, 'Categorías');
  const categories = await listAllCategories(page);
  for (const category of categories) {
    await deleteCategory(page, category);
  }

  await browser.close();
}

async function verifyBookExistsInHomePage(page, bookTitle) {
  const bookContainer = await page.locator('.album .container .row');
  const bookElement = await bookContainer.locator(`text=${bookTitle}`);
  return (await bookElement.count()) > 0;
}

async function clickBookInHomePage(page, bookTitle) {
  const bookContainer = await page.locator('.album .container .row');
  const bookElement = await bookContainer.locator(`text=${bookTitle}`);
  if (await bookElement.count() > 0) {
    await bookElement.first().click();
  }
}

async function requestLoan(page) {
  await page.click('button:has-text("Solicitar")');
}

async function verifyBookInLoanList(page, bookTitle) {
  const loanContainer = await page.locator('.row-cols-1.row-cols-sm-2.row-cols-md-3.g-3');
  await loanContainer.waitFor({ state: 'attached' });
  const bookElement = await loanContainer.locator(`text=${bookTitle}`).first();
  return (await bookElement.count() > 0);
}

async function returnBook(page, bookTitle) {
  // Locate the parent container of the book
  const loanContainer = await page.locator('.row-cols-1.row-cols-sm-2.row-cols-md-3.g-3');
  await loanContainer.waitFor({ state: 'attached' });
  const bookElement = await loanContainer.locator(`text=${bookTitle}`).first();
  if (await bookElement.count() > 0) {
    // Locate the parent of the bookElement to find the return button
    const parentElement = bookElement.first().locator('xpath=ancestor::div[contains(@class, "card")]');
    const formElement = await parentElement.locator('form').locator('button:has-text("Devolver")');

    await formElement.click();

    // Wait for the status to change
    const currentDate = format(new Date(), 'EEE MMM dd yyyy');
    const returnedText = await parentElement.locator(`text=Devuelto: ${currentDate}`).first();
    return (await returnedText.count() > 0);
  }
  return false;
}

module.exports = {
  login,
  navigateToSection,
  addCategory,
  verifyCategoryExists,
  deleteCategory,
  addBook,
  verifyBookExists,
  deleteBook,
  listAllBooks,
  listAllCategories,
  cleanup,
  verifyBookExistsInHomePage,
  clickBookInHomePage,
  requestLoan,
  returnBook,
  verifyBookInLoanList
};