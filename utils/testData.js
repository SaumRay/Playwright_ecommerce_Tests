// Centralised test data — change credentials here, and all tests update automatically

const USERS = {
  standard:         { username: 'standard_user',          password: 'secret_sauce' },
  lockedOut:        { username: 'locked_out_user',         password: 'secret_sauce' },
  problem:          { username: 'problem_user',            password: 'secret_sauce' },
  performanceGlitch:{ username: 'performance_glitch_user', password: 'secret_sauce' },
  invalid:          { username: 'wrong_user',              password: 'wrong_password' },
  wrongPassword:    { username: 'standard_user',           password: 'wrong_password' },
  empty:            { username: '',                        password: '' },
};

const URLS = {
  base:            'https://www.saucedemo.com',
  login:           'https://www.saucedemo.com/',
  inventory:       'https://www.saucedemo.com/inventory.html',
  cart:            'https://www.saucedemo.com/cart.html',
  checkoutStepOne: 'https://www.saucedemo.com/checkout-step-one.html',
  checkoutStepTwo: 'https://www.saucedemo.com/checkout-step-two.html',
  confirmation:    'https://www.saucedemo.com/checkout-complete.html',
  // keep old key for backward compat with cart tests
  checkout:        'https://www.saucedemo.com/checkout-step-one.html',
};

const ERROR_MESSAGES = {
  lockedOut:          'Epic sadface: Sorry, this user has been locked out.',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  usernameRequired:   'Epic sadface: Username is required',
  passwordRequired:   'Epic sadface: Password is required',
};

const SORT_OPTIONS = {
  nameAZ:       'az',
  nameZA:       'za',
  priceLowHigh: 'lohi',
  priceHighLow: 'hilo',
};

const PRODUCTS = {
  backpack:     'Sauce Labs Backpack',
  bikeLight:    'Sauce Labs Bike Light',
  boltShirt:    'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie:       'Sauce Labs Onesie',
  redShirt:     'Test.allTheThings() T-Shirt (Red)',
};

const EXPECTED = {
  totalProducts:   6,
  inventoryTitle:  'Products',
  cheapestProduct: 'Sauce Labs Onesie',
  pricestProduct:  'Sauce Labs Fleece Jacket',
  firstAlpha:      'Sauce Labs Backpack',
  lastAlpha:       'Test.allTheThings() T-Shirt (Red)',
};

const CUSTOMER = {
  valid: {
    firstName:  'Saumarghya',
    lastName:   'Ray',
    postalCode: '799002',
  },
  missingFirst: {
    firstName:  '',
    lastName:   'Ray',
    postalCode: '799002',
  },
  missingLast: {
    firstName:  'Saumarghya',
    lastName:   '',
    postalCode: '799002',
  },
  missingPostal: {
    firstName:  'Saumarghya',
    lastName:   'Ray',
    postalCode: '',
  },
};

const CHECKOUT_ERRORS = {
  firstNameRequired:  'Error: First Name is required',
  lastNameRequired:   'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
};

const CONFIRMATION = {
  title:   'Checkout: Complete!',
  header:  'Thank you for your order!',
};

module.exports = {
  USERS, URLS, ERROR_MESSAGES,
  SORT_OPTIONS, PRODUCTS, EXPECTED,
  CUSTOMER, CHECKOUT_ERRORS, CONFIRMATION,
};
