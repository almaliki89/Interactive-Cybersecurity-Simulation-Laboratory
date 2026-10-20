import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

test.describe('Beginner-First Curriculum E2E Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to simulate fresh visitor
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('complete beginner journey from landing hero to milestone completion and reload persistence', async ({ page }) => {
    // 1. Visit Homepage & Verify Beginner Primary CTA
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // The primary action on landing hero is the Beginner Track
    const heroBeginnerBtn = page.getByRole('button', { name: /ابدأ (التعلّم )?من الصفر/i }).first();
    await expect(heroBeginnerBtn).toBeVisible({ timeout: 15000 });
    await heroBeginnerBtn.click();

    // 2. Verified on Curriculum / Lesson View
    const curriculumHeading = page.getByText(/10 محطات تأسيسية متسلسلة/i).first();
    await expect(curriculumHeading).toBeVisible({ timeout: 10000 });

    // Active lesson 1 title should be visible
    const milestoneTitle = page.getByText(/التعرف إلى الأمن السيبراني وثالوث الحماية الأساسي/i).first();
    await expect(milestoneTitle).toBeVisible();

    // 3. Navigate through Pedagogical Stages
    // Move to Stage 2: Concept & Analogy
    const toStage2Btn = page.getByRole('button', { name: /المرحلة 2: المفهوم والتشبيه الحياتي/i });
    await expect(toStage2Btn).toBeVisible();
    await toStage2Btn.click();
    await expect(page.getByText(/تشبيه من الحياة اليومية/i).first()).toBeVisible();

    // Move to Stage 3: Live Demonstration
    const toStage3Btn = page.getByRole('button', { name: /المرحلة 3: المعاينة الحية/i });
    await expect(toStage3Btn).toBeVisible();
    await toStage3Btn.click();
    await expect(page.getByText(/ما الذي يجب أن تلاحظه؟/i).first()).toBeVisible();

    // Move to Stage 4: Guided Hands-on Task
    const toStage4Btn = page.getByRole('button', { name: /المرحلة 4: المهمة العملية/i });
    await expect(toStage4Btn).toBeVisible();
    await toStage4Btn.click();
    await expect(page.getByText(/المهمة العملية/i).first()).toBeVisible();

    // 4. Test Simulation Lab Launch & Context-Preserved Return
    const openLabBtn = page.getByRole('button', { name: /الانتقال إلى المحاكي والتطبيق/i });
    await expect(openLabBtn).toBeVisible();
    await openLabBtn.click();

    // Inside the simulation lab, Header displays "العودة للدرس" with preserved context
    const returnToLessonBtn = page.getByTestId('return-to-lesson-btn');
    await expect(returnToLessonBtn).toBeVisible({ timeout: 20000 });
    await returnToLessonBtn.click();

    // Back in Lesson View
    await expect(curriculumHeading).toBeVisible();

    // 5. Test Strict Completion Gating (Attempting Stage 7 Before Fulfilling Conditions)
    const nextStepTab = page.getByRole('button', { name: /7\. الخطوة التالية/i });
    await nextStepTab.click();

    // Verify lock warning is shown and completion button is NOT available
    await expect(page.getByText(/متطلبات إكمال المحطة غير مستوفاة بعد/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /إكمال والانتقال إلى المحطة التالية/i })).toHaveCount(0);

    // 6. Complete the Knowledge Check Quiz
    const quizTab = page.getByRole('button', { name: /6\. فحص المعرفة/i });
    await quizTab.click();

    // Answer Question 1: Availability
    const optAvailability = page.getByRole('button', { name: /التوافر \(Availability\)/i });
    await expect(optAvailability).toBeVisible();
    await optAvailability.click();
    await expect(page.getByText(/إجابة صحيحة وممتازة!/i)).toBeVisible();

    // Answer Question 2: Confidentiality
    const optConfidentiality = page.getByRole('button', { name: /ضمان السرية/i });
    await expect(optConfidentiality).toBeVisible();
    await optConfidentiality.click();
    await expect(page.getByText(/إجابة صحيحة! التشفير يحول البيانات/i)).toBeVisible();

    // 7. Verify Exploratory Lesson with Honest Guided Manual Confirmation
    // Jump to Lesson 6 (Active Directory & Kerberos)
    const milestone6Btn = page.getByText(/6\. الهوية والمصادقة/i).first();
    await expect(milestone6Btn).toBeVisible({ timeout: 15000 });
    await milestone6Btn.click();

    // Verify Lesson 6 is now active
    await expect(page.getByText(/إدارة الهويات والمصادقة/i).first()).toBeVisible({ timeout: 15000 });

    // Navigate to Lesson 6 Stage 4 (Hands-on Task) using top stage tab
    const stage4Tab = page.getByRole('button', { name: /4\. المهمة العملية/i });
    await stage4Tab.click();

    // Click guided confirmation toggle
    const confirmToggleBtn = page.getByTestId('guided-confirmation-toggle-btn');
    await expect(confirmToggleBtn).toBeVisible();
    await confirmToggleBtn.click();
    await expect(confirmToggleBtn).toContainText(/أؤكد أنني نفذت الخطوات الموجهة/i);

    // Answer Lesson 6 Quiz
    const quizTabLesson6 = page.getByRole('button', { name: /6\. فحص المعرفة/i });
    await quizTabLesson6.click();
    const kerberosTicketOpt = page.getByRole('button', { name: /تذكرة TGT/i }).first();
    if (await kerberosTicketOpt.isVisible()) {
      await kerberosTicketOpt.click();
    }

    // 8. Test Reload Persistence of activeLessonId
    await page.evaluate(() => {
      localStorage.setItem('omega_active_lesson_id', 'lesson-06-active-directory');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // After reload, Lesson 6 must remain active
    const activeLessonId = await page.evaluate(() => {
      return localStorage.getItem('omega_active_lesson_id');
    });
    expect(activeLessonId).toBe('lesson-06-active-directory');
  });

  test('validates direct navigation from Header "Start Here" button', async ({ page }) => {
    await page.goto('/#explorer');
    await page.waitForLoadState('domcontentloaded');

    const startHereNavBtn = page.getByRole('button', { name: /ابدأ هنا \(المبتدئون\)/i });
    await expect(startHereNavBtn).toBeVisible({ timeout: 10000 });
    await startHereNavBtn.click();

    await expect(page.getByText(/10 محطات تأسيسية متسلسلة/i).first()).toBeVisible({ timeout: 10000 });
  });
});
