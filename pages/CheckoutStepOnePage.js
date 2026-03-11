// Represents Checkout Step 1 — customer information form

class CheckoutStepOnePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    //Locators 
    this.pageTitle      = page.locator('.title');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput  = page.locator('[data-test="lastName"]');
    this.postalCodeInput= page.locator('[data-test="postalCode"]');
    this.continueBtn    = page.locator('[data-test="continue"]');
    this.cancelBtn      = page.locator('[data-test="cancel"]');
    this.errorMessage   = page.locator('[data-test="error"]');
    this.errorCloseBtn  = page.locator('.error-button');
  }

  //Actions 

  async fillFirstName(value) {
    await this.firstNameInput.fill(value);
  }

  async fillLastName(value) {
    await this.lastNameInput.fill(value);
  }

  async fillPostalCode(value) {
    await this.postalCodeInput.fill(value);
  }

  async fillForm(firstName, lastName, postalCode) {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillPostalCode(postalCode);
  }

  async clickContinue() {
    await this.continueBtn.click();
  }

  async clickCancel() {
    await this.cancelBtn.click();
  }

  async closeError() {
    await this.errorCloseBtn.click();
  }

  //Getters
  async getTitle() {
    return await this.pageTitle.innerText();
  }

  async getErrorMessage() {
    return await this.errorMessage.innerText();
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }
}

module.exports = { CheckoutStepOnePage };
