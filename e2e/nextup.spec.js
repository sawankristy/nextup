import { test, expect } from '@playwright/test';

// end-to-end tests: a real browser, the whole app (built client + our API + an in-memory MongoDB) --> seconds
// i find things like a user does: by role, label or text, never by a CSS class

test('a private page sends you to Log in', async ({ page }) => {
  // a new browser has no token: open My Lists directly
  await page.goto('/lists');

  // RequireAuth sends us to the log in page
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

test('the main journey: sign up, create and rename a list, refresh, log out, log in', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`; // a new user every time
  const password = 'e2e-password-123';

  // Home --> Sign up
  await page.goto('/');
  await page.getByRole('link', { name: 'Sign up' }).click();

  // fill the form and create the account (signing up also logs in, so it doesn't count as a login)
  await page.getByLabel('Name').fill('E2E Tester');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign up' }).click();

  // we land on My Lists
  await expect(page).toHaveURL(/\/lists$/);
  await expect(page.getByRole('heading', { name: 'My Lists' })).toBeVisible();

  // + New list --> "E2E books", Books --> Create
  await page.getByRole('button', { name: '+ New list' }).click();
  await page.getByLabel('List name').fill('E2E books');
  await page.getByLabel('Books', { exact: true }).check();
  await page.getByRole('button', { name: 'Create list' }).click();

  // we land on the new list
  await expect(page).toHaveURL(/\/lists\/[a-f0-9]{24}$/);
  await expect(page.getByRole('heading', { name: 'E2E books' })).toBeVisible();

  // rename it to "E2E reads"
  await page.getByRole('button', { name: 'Rename' }).click();
  await page.getByLabel('List name').fill('E2E reads');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { name: 'E2E reads' })).toBeVisible();

  // back to My Lists: the card has the new name
  await page.getByRole('link', { name: 'My Lists' }).click();
  await expect(page.getByRole('heading', { name: 'E2E reads' })).toBeVisible();

  // reload the page: the list comes back from the database, not from memory
  await page.reload();
  await expect(page.getByRole('heading', { name: 'E2E reads' })).toBeVisible();

  // log out --> back to Log in
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  // log in again (the only login of the whole run, the limit is 5 per 15 minutes)
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // the list is still there
  await expect(page).toHaveURL(/\/lists$/);
  await expect(page.getByRole('heading', { name: 'E2E reads' })).toBeVisible();
});
