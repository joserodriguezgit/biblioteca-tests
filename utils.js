
async function login(page, username, password) {
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Contraceña').fill(password);
  await page.getByText('Ingresar').click();
}

async function navigateToSection(page, sectionName) {
  const menuOption = await getByText(page, sectionName);
  await Promise.all([page.waitForNavigation(), menuOption.click()]);
}

async function addCategory(page, categoryName, categoryDescription) {
  await getByText(page, 'Añadir una categoría').click();
  const nameInput = await getByPlaceholderText(page, 'Ejemplo: Novela de aventuras');
  await nameInput.fill(categoryName);
  
  const descriptionInput = await getByPlaceholderText(
    page,
    'Ejemplo: La novela de aventuras es la esencia misma de la ficción, puesto que se gesta con el sencillo objetivo de entretener.'
  );
  await descriptionInput.fill(categoryDescription);

  const createButton = await getByText(page, 'Crear');
  await Promise.all([page.waitForNavigation(), createButton.click()]);
}

async function verifyCategoryExists(page, categoryName) {
  const categoryContainer = await page.locator('#category-container');
  const categoryElement = await categoryContainer.getByText(categoryName);
  
  return await categoryElement.count() > 0;
}

async function deleteCategory(page, categoryName) {
  const categoryContainer = await page.locator('#category-container');
  const categoryElement = await categoryContainer.getByText(categoryName);
  
  if (await categoryElement.count() > 0) {
    const categoryCard = await categoryElement.locator('xpath=ancestor::div[contains(@class, "card")]');
    const deleteButton = await categoryCard.locator('.delete-category');
    await Promise.all([page.waitForNavigation(), deleteButton.click()]);
    const deletedCategory = await categoryContainer.getByText(categoryName);
    return await deletedCategory.count() === 0;
  }
  return false;
}

async function addBook(page, bookName, bookDescription) {
    await getByText(page, 'Añadir un libro').click();
    const nameInput = await page.getByPlaceholder('Ejemplo: Percy Jackson y el ladron del rayo');
    await nameInput.fill(bookName);
    
    const descriptionInput = await getByPlaceholderText(
      page,
      'Ejemplo: La novela de aventuras es la esencia misma de la ficción, puesto que se gesta con el sencillo objetivo de entretener.'
    );
    await descriptionInput.fill(bookDescription);
  
    const createButton = await page.getByText('Crear');
    await Promise.all([page.waitForNavigation(), createButton.click()]);
}

async function verifyBookExists(page, bookName) {
    const { getByText } = queries;
    const bookContainer = await page.locator('#book-container');
    const bookElement = await getByText(bookContainer, bookName);
    return await bookElement.count() > 0;
  }
  
async function deleteBook(page, bookName) {
const { getByText } = queries;
const bookContainer = await page.locator('#book-container');
const bookElement = await getByText(bookContainer, bookName);

if (await bookElement.count() > 0) {
    const bookCard = await bookElement.locator('xpath=ancestor::div[contains(@class, "card")]');
    const deleteButton = await bookCard.locator('.delete-book');
    await Promise.all([page.waitForNavigation(), deleteButton.click()]);
    const deletedBook = await getByText(bookContainer, bookName);
    return await deletedBook.count() === 0;
}
return false;
}
  
export default {
    login,
    navigateToSection,
    addCategory,
    verifyCategoryExists,
    deleteCategory,
    addBook,
    verifyBookExists,
    deleteBook
  };
  