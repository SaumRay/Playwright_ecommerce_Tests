// Login flow tests for https://www.saucedemo.com

const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { USERS, URLS, ERROR_MESSAGES } = require('../utils/testData');

test.describe('Successful Login', () => {

  test('Standard user can log in and lands on inventory page', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(URLS.inventory);
    await expect(page.locator('.title')).toHaveText('Products');
    const productCount = await inventoryPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('Performance glitch user can eventually log in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.performanceGlitch.username, USERS.performanceGlitch.password);
    await expect(page).toHaveURL(URLS.inventory, { timeout: 10000 });
  });
});

test.describe('Failed Login Scenarios', () => {

  test('Locked out user sees a lock-out error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);
    await expect(page).toHaveURL(URLS.login);
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.lockedOut);
  });

  test('Invalid credentials show an error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.invalid.username, USERS.invalid.password);
    await expect(page).toHaveURL(URLS.login);
    expect(await loginPage.getErrorMessage()).toContain('do not match any user');
  });

  test('Valid username with wrong password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.wrongPassword.username, USERS.wrongPassword.password);
    expect(await loginPage.isErrorVisible()).toBe(true);
  });
});

test.describe('Edge Cases', () => {

  test('Submitting with empty username shows username-required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', USERS.standard.password);
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.usernameRequired);
  });

  test('Submitting with empty password shows password-required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, '');
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.passwordRequired);
  });

  test('Submitting with both fields empty shows username-required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clickLogin();
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.usernameRequired);
  });

  test('Error banner can be dismissed by clicking the X button', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.invalid.username, USERS.invalid.password);
    expect(await loginPage.isErrorVisible()).toBe(true);
    await loginPage.closeError();
    expect(await loginPage.isErrorVisible()).toBe(false);
  });
});

test.describe('UI Validations', () => {

  test('Login page has correct title and all elements visible', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page).toHaveTitle('Swag Labs');
    await expect(loginPage.loginLogo).toHaveText('Swag Labs');
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toHaveValue('Login');
  });

  test('Password field masks the input', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    expect(await loginPage.passwordInput.getAttribute('type')).toBe('password');
  });

  test('User can log out and is returned to login page', async ({ page }) => {
    const loginPage     = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(URLS.inventory);
    await inventoryPage.logout();
    await expect(page).toHaveURL(URLS.login);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
