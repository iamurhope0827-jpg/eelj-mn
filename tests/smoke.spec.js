import { test, expect } from '@playwright/test';
import { useFakeFirebase } from './fake-firebase.js';

const password = 'TestPass123';

// Fails the test on any uncaught page error or console error.
function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  return errors;
}

async function noHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'page is wider than the viewport').toBeLessThanOrEqual(0);
}

async function signUp(page, { name, email, role }) {
  await page.locator('.topbar-signup').click();
  await page.locator('.signin-role', { hasText: role }).click();
  await page.fill('#signin-form [name=name]', name);
  await page.fill('#signin-form [name=email]', email);
  await page.fill('#signin-form [name=password]', password);
  await page.locator('#signin-form [type=submit]').click();
  await expect(page.locator('#app-header')).toBeVisible();
}

async function signOut(page) {
  await page.locator('#user-button').click();
  await page.locator('[data-action=signout]').click();
  await expect(page.locator('#landing-view')).toBeVisible();
}

async function signIn(page, email, pass = password) {
  await page.locator('.topbar-signin').click();
  await page.fill('#signin-form [name=email]', email);
  await page.fill('#signin-form [name=password]', pass);
  await page.locator('#signin-form [type=submit]').click();
}

test.beforeEach(async ({ page }) => { await useFakeFirebase(page); });

test('homepage loads with title, share tags and no errors', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Ээлж/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.png$/);
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /.{40,}/);
  await expect(page.locator('#footer-year')).toHaveText(String(new Date().getFullYear()));
  await noHorizontalScroll(page);
  expect(errors).toEqual([]);
});

test('sign up, sign out, wrong password, sign in', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await page.locator('.topbar-signup').click();
  await page.fill('#signin-form [name=name]', 'Бат');
  await page.fill('#signin-form [name=email]', 'bat@example.com');
  await page.fill('#signin-form [name=password]', 'short');
  await page.locator('#signin-form [type=submit]').click();
  await expect(page.locator('#signin-error')).toContainText('8');
  await page.locator('[data-action=close]').first().click();

  await signUp(page, { name: 'Бат', email: 'bat@example.com', role: 'Ажил горилогч' });
  await expect(page.locator('#user-name')).toHaveText('Бат');
  await page.reload();
  await expect(page.locator('#app-header')).toBeVisible();

  await signOut(page);
  await signIn(page, 'bat@example.com', 'wrongpass99');
  await expect(page.locator('#signin-error')).toHaveText('И-мэйл эсвэл нууц үг буруу байна.');
  await page.fill('#signin-form [name=password]', password);
  await page.locator('#signin-form [type=submit]').click();
  await expect(page.locator('#user-name')).toHaveText('Бат');
  expect(errors).toEqual([]);
});

test('forgot password sends a reset link', async ({ page }) => {
  await page.goto('/');
  await page.locator('.topbar-signin').click();
  await page.fill('#signin-form [name=email]', 'bat@example.com');
  await page.locator('[data-action=forgot-password]').click();
  await expect(page.locator('#reset-form [name=email]')).toHaveValue('bat@example.com');
  await page.locator('#reset-form [type=submit]').click();
  await expect(page.locator('#panel-title')).toHaveText('И-мэйлээ шалгана уу');
});

test('signed-in screens fit a 320px phone', async ({ page }) => {
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await signUp(page, { name: 'Сараа', email: 'saraa@example.com', role: 'Ажил горилогч' });
  for (const view of ['jobs', 'applications', 'profile']) {
    await page.evaluate((hash) => { location.hash = hash; }, view);
    await expect(page.locator(`#${view === 'jobs' ? 'browse' : view}-view`)).toBeVisible();
    await noHorizontalScroll(page);
  }
  await page.locator('#user-button').click();
  await page.locator('#user-dropdown [data-action=employer]').click();
  await expect(page.locator('#employer-view')).toBeVisible();
  for (const tab of ['jobs', 'seekers', 'applications']) {
    await page.locator(`#employer-${tab}-tab`).click();
    await noHorizontalScroll(page);
  }
  expect(errors).toEqual([]);
});

test('a job seeker shares free days, an employer invites them, they accept', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');

  await signUp(page, { name: 'Тестбилэг', email: 'temuulen@example.com', role: 'Ажил горилогч' });
  await page.evaluate(() => { location.hash = 'profile'; });
  const days = page.locator('#profile-avail [data-action=avail-day]:not([disabled])');
  await days.nth(2).click();
  await days.nth(3).click();
  await page.locator('[data-action=share]').click();
  await expect(page.locator('[data-action=unshare]')).toBeVisible();
  await signOut(page);

  await signUp(page, { name: 'Номин', email: 'nomin@example.com', role: 'Ажил олгогч' });
  await page.locator('#employer-seekers-tab').click();
  const row = page.locator('.seeker-row', { hasText: 'Тестбилэг', has: page.locator('.seeker-real') });
  await expect(row.locator('.seeker-real')).toBeVisible();
  await row.locator('[data-action=pick-seeker]').click();
  await page.locator('#invite-submit').click();
  await expect(page.locator('#panel-title')).toHaveText('Мэдэгдэл илгээгдлээ');
  await page.locator('[data-action=close]').first().click();
  await signOut(page);

  await signIn(page, 'temuulen@example.com');
  await page.evaluate(() => { location.hash = 'applications'; });
  await expect(page.locator('.invite-card')).toHaveCount(1);
  await page.locator('.invite-card [data-action=invite-detail]').click();
  await page.locator('[data-action=invite-accept]').click();
  await expect(page.locator('[data-action=invite-accept]')).toHaveCount(0);
  expect(errors).toEqual([]);
});
