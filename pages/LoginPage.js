// Page Object Model (POM) for the Saucedemo Login Page

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    //Locators
    this.usernameInput    = page.locator('#user-name');
    this.passwordInput    = page.locator('#password');
    this.loginButton      = page.locator('#login-button');
    this.errorMessage     = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
    this.loginLogo        = page.locator('.login_logo');
  }

  //Actions

  /** Navigate to the login page */
  async goto() {
    await this.page.goto('/');
  }

  /** Fill in username */
  async enterUsername(username) {
    await this.usernameInput.fill(username);
  }

  /** Fill in password */
  async enterPassword(password) {
    await this.passwordInput.fill(password);
  }

  /** Click the Login button */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * Full login action — fills credentials and submits
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /** Dismiss the error banner */
  async closeError() {
    await this.errorCloseButton.click();
  }

  //Getters (for assertions)

  /** Returns the visible error message text */
  async getErrorMessage() {
    return await this.errorMessage.innerText();
  }

  /** Returns true if the error banner is visible */
  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }
}

module.exports = { LoginPage };
