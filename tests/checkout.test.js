// Checkout flow tests for https://www.saucedemo.com
// Covers: form validation, order summary accuracy, navigation, completion

const { test, expect }           = require('@playwright/test');
const { LoginPage }              = require('../pages/LoginPage');
const { InventoryPage }          = require('../pages/InventoryPage');
const { CartPage }               = require('../pages/CartPage');
const { CheckoutStepOnePage }    = require('../pages/CheckoutStepOnePage');
const { CheckoutStepTwoPage }    = require('../pages/CheckoutStepTwoPage');
const { OrderConfirmationPage }  = require('../pages/OrderConfirmationPage');
const {
  USERS, URLS, PRODUCTS,
  CUSTOMER, CHECKOUT_ERRORS, CONFIRMATION,
} = require('../utils/testData');


// SETUP: Login + add a product to cart before each test
test.beforeEach(async ({ page }) => {
  const loginPage     = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage      = new CartPage(page);

  await loginPage.goto();
  await loginPage.login(USERS.standard.username, USERS.standard.password);
  await inventoryPage.addToCartByName(PRODUCTS.backpack);
  await inventoryPage.clickCart();
  await cartPage.clickCheckout();

  // All tests start on Checkout Step One
  await expect(page).toHaveURL(URLS.checkoutStepOne);
});


// GROUP 1: Checkout Step One — Page Load
test.describe('Checkout Step One — Page Load', () => {

  test('Step one page has correct title', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);
    expect(await stepOne.getTitle()).toBe('Checkout: Your Information');
  });

  test('All form fields and buttons are visible', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);

    await expect(stepOne.firstNameInput).toBeVisible();
    await expect(stepOne.lastNameInput).toBeVisible();
    await expect(stepOne.postalCodeInput).toBeVisible();
    await expect(stepOne.continueBtn).toBeVisible();
    await expect(stepOne.cancelBtn).toBeVisible();
  });
});

// GROUP 2: Checkout Step One — Form Validation
test.describe('Form Validation', () => {

  test('Submitting empty form shows first name required error', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);
    await stepOne.clickContinue();

    expect(await stepOne.isErrorVisible()).toBe(true);
    expect(await stepOne.getErrorMessage()).toBe(CHECKOUT_ERRORS.firstNameRequired);
  });

  test('Submitting without first name shows first name required error', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);

    await stepOne.fillForm(
      CUSTOMER.missingFirst.firstName,
      CUSTOMER.missingFirst.lastName,
      CUSTOMER.missingFirst.postalCode
    );
    await stepOne.clickContinue();
    expect(await stepOne.getErrorMessage()).toBe(CHECKOUT_ERRORS.firstNameRequired);
  });

  test('Submitting without last name shows last name required error', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);

    await stepOne.fillForm(
      CUSTOMER.missingLast.firstName,
      CUSTOMER.missingLast.lastName,
      CUSTOMER.missingLast.postalCode
    );
    await stepOne.clickContinue();

    expect(await stepOne.getErrorMessage()).toBe(CHECKOUT_ERRORS.lastNameRequired);
  });

  test('Submitting without postal code shows postal code required error', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);

    await stepOne.fillForm(
      CUSTOMER.missingPostal.firstName,
      CUSTOMER.missingPostal.lastName,
      CUSTOMER.missingPostal.postalCode
    );
    await stepOne.clickContinue();

    expect(await stepOne.getErrorMessage()).toBe(CHECKOUT_ERRORS.postalCodeRequired);
  });

  test('Error message can be dismissed', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);

    await stepOne.clickContinue();
    expect(await stepOne.isErrorVisible()).toBe(true);

    await stepOne.closeError();
    expect(await stepOne.isErrorVisible()).toBe(false);
  });

  test('Valid form submission proceeds to step two', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);

    await stepOne.fillForm(
      CUSTOMER.valid.firstName,
      CUSTOMER.valid.lastName,
      CUSTOMER.valid.postalCode
    );
    await stepOne.clickContinue();

    await expect(page).toHaveURL(URLS.checkoutStepTwo);
  });

});


// GROUP 3: Checkout Step Two — Order Summary
test.describe('📦 Order Summary (Step Two)', () => {

  async function goToStepTwo(page) {
    const stepOne = new CheckoutStepOnePage(page);
    await stepOne.fillForm(
      CUSTOMER.valid.firstName,
      CUSTOMER.valid.lastName,
      CUSTOMER.valid.postalCode
    );
    await stepOne.clickContinue();
    await expect(page).toHaveURL(URLS.checkoutStepTwo);
  }

  test('Step two page has correct title', async ({ page }) => {
    await goToStepTwo(page);
    const stepTwo = new CheckoutStepTwoPage(page);
    expect(await stepTwo.getTitle()).toBe('Checkout: Overview');
  });

  test('Ordered item appears in the summary', async ({ page }) => {
    await goToStepTwo(page);
    const stepTwo = new CheckoutStepTwoPage(page);

    const names = await stepTwo.getAllItemNames();
    expect(names).toContain(PRODUCTS.backpack);
  });

  test('Item count in summary matches items added to cart', async ({ page }) => {
    await goToStepTwo(page);
    const stepTwo = new CheckoutStepTwoPage(page);

    expect(await stepTwo.getCartItemCount()).toBe(1);
  });

  test('Total = item total + tax', async ({ page }) => {
    await goToStepTwo(page);
    const stepTwo = new CheckoutStepTwoPage(page);

    const itemTotal = await stepTwo.getItemTotal();
    const tax       = await stepTwo.getTax();
    const total     = await stepTwo.getTotal();

    expect(total).toBeCloseTo(itemTotal + tax, 2);
  });

  test('Payment and shipping info labels are visible', async ({ page }) => {
    await goToStepTwo(page);
    const stepTwo = new CheckoutStepTwoPage(page);

    await expect(stepTwo.paymentInfo).toBeVisible();
    await expect(stepTwo.shippingInfo).toBeVisible();
  });

  test('Finish and Cancel buttons are visible', async ({ page }) => {
    await goToStepTwo(page);
    const stepTwo = new CheckoutStepTwoPage(page);

    await expect(stepTwo.finishBtn).toBeVisible();
    await expect(stepTwo.cancelBtn).toBeVisible();
  });

  test('Multiple items all appear in order summary', async ({ page }) => {
    // Going back to inventory to add more items
    await page.goto(URLS.inventory);
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCartByName(PRODUCTS.bikeLight);
    await inventoryPage.addToCartByName(PRODUCTS.onesie);
    await inventoryPage.clickCart();

    const cartPage = new CartPage(page);
    await cartPage.clickCheckout();

    await goToStepTwo(page);
    const stepTwo = new CheckoutStepTwoPage(page);

    // 3 items total (backpack from beforeEach + 2 more)
    expect(await stepTwo.getCartItemCount()).toBe(3);

    const names = await stepTwo.getAllItemNames();
    expect(names).toContain(PRODUCTS.backpack);
    expect(names).toContain(PRODUCTS.bikeLight);
    expect(names).toContain(PRODUCTS.onesie);
  });
});

// GROUP 4: Order Completion
test.describe('Order Completion', () => {

  async function completeCheckout(page) {
    const stepOne = new CheckoutStepOnePage(page);
    await stepOne.fillForm(
      CUSTOMER.valid.firstName,
      CUSTOMER.valid.lastName,
      CUSTOMER.valid.postalCode
    );
    await stepOne.clickContinue();
    const stepTwo = new CheckoutStepTwoPage(page);
    await stepTwo.clickFinish();
  }

  test('Clicking Finish lands on confirmation page', async ({ page }) => {
    await completeCheckout(page);
    await expect(page).toHaveURL(URLS.confirmation);
  });

  test('Confirmation page shows correct title', async ({ page }) => {
    await completeCheckout(page);
    const confirmPage = new OrderConfirmationPage(page);
    expect(await confirmPage.getTitle()).toBe(CONFIRMATION.title);
  });

  test('Confirmation page shows thank you header', async ({ page }) => {
    await completeCheckout(page);
    const confirmPage = new OrderConfirmationPage(page);
    expect(await confirmPage.getConfirmationHeader()).toBe(CONFIRMATION.header);
  });

  test('Confirmation page shows the pony express image', async ({ page }) => {
    await completeCheckout(page);
    const confirmPage = new OrderConfirmationPage(page);
    expect(await confirmPage.isConfirmationImageVisible()).toBe(true);
  });

  test('Back Home button returns to inventory page', async ({ page }) => {
    await completeCheckout(page);
    const confirmPage = new OrderConfirmationPage(page);
    await confirmPage.clickBackHome();
    await expect(page).toHaveURL(URLS.inventory);
  });

  test('Cart is empty after completing an order', async ({ page }) => {
    await completeCheckout(page);
    const confirmPage   = new OrderConfirmationPage(page);
    const inventoryPage = new InventoryPage(page);

    await confirmPage.clickBackHome();

    // Cart badge should be gone
    expect(await inventoryPage.getCartCount()).toBe(0);
  });
});

// GROUP 5: Checkout Navigation
test.describe('🔀 Checkout Navigation', () => {

  test('Cancel on step one returns to cart', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);
    await stepOne.clickCancel();
    await expect(page).toHaveURL(URLS.cart);
  });

  test('Cancel on step two returns to inventory', async ({ page }) => {
    const stepOne = new CheckoutStepOnePage(page);
    await stepOne.fillForm(
      CUSTOMER.valid.firstName,
      CUSTOMER.valid.lastName,
      CUSTOMER.valid.postalCode
    );
    await stepOne.clickContinue();

    const stepTwo = new CheckoutStepTwoPage(page);
    await stepTwo.clickCancel();

    await expect(page).toHaveURL(URLS.inventory);
  });
});
