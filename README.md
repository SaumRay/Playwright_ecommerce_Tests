# 🎭 Playwright – Saucedemo Login Tests

Practice project for learning Playwright by testing the login flow of [saucedemo.com](https://www.saucedemo.com).

---

## 📁 Project Structure

```
playwright-saucedemo/
│
├── tests/
│   └── login.test.js         ← All login test cases
│
├── pages/
│   ├── LoginPage.js          ← Page Object for the login page
│   └── InventoryPage.js      ← Page Object for the post-login inventory page
│
├── utils/
│   └── testData.js           ← Centralised test data (credentials, URLs, error messages)
│
├── playwright.config.js      ← Playwright configuration
├── package.json
└── README.md
```

---

## 🚀 Setup (First Time Only)

```bash
# 1. Install dependencies
npm install

# 2. Install browsers
npx playwright install
```

---

## ▶️ Running Tests

```bash
# Run all tests (headless — no browser window)
npm test

# Run with a visible browser window
npm run test:headed

# Run with Playwright's interactive UI explorer
npm run test:ui

# Run in debug mode (step through tests)
npm run test:debug

# Run on a specific browser only
npm run test:chromium
npm run test:firefox

# View the HTML report after a test run
npm run report
```

---

## 🧪 Test Cases Covered

### ✅ Successful Login
| Test | Description |
|------|-------------|
| Standard user login | Logs in and lands on inventory page |
| Performance glitch user | Handles delayed login |

### ❌ Failed Login Scenarios
| Test | Description |
|------|-------------|
| Locked out user | Sees lock-out error |
| Invalid credentials | Sees mismatch error |
| Valid username, wrong password | Sees mismatch error |

### ⚠️ Edge Cases
| Test | Description |
|------|-------------|
| Empty username | Shows "Username is required" |
| Empty password | Shows "Password is required" |
| Both fields empty | Shows "Username is required" |
| Dismiss error banner | X button closes the error |

### 🎨 UI Validations
| Test | Description |
|------|-------------|
| Page elements visible | Logo, fields, button all present |
| Password field masked | Input type is "password" |
| Logout flow | Returns user to login page |

---

## 💡 Key Concepts Used

- **Page Object Model (POM)** — Selectors and actions live in page classes, not tests
- **Locators** — `page.locator()` for robust element selection
- **Assertions** — `expect()` with `.toHaveURL()`, `.toHaveText()`, `.toBeVisible()` etc.
- **Test grouping** — `test.describe()` to organise related tests
- **Test data separation** — Credentials and expected values in `utils/testData.js`

---

## 🔑 Test Credentials (Provided by Saucedemo)

| Username | Password | Behaviour |
|----------|----------|-----------|
| `standard_user` | `secret_sauce` | Normal user |
| `locked_out_user` | `secret_sauce` | Login blocked |
| `problem_user` | `secret_sauce` | Broken images/UI |
| `performance_glitch_user` | `secret_sauce` | Slow responses |
