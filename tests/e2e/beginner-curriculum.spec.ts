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
    const curriculumHeading = page.getByText(/11 مستوًى من الصفر إلى الاحتراف/i).first();
    await expect(curriculumHeading).toBeVisible({ timeout: 10000 });

    // Active lesson 1 title should be visible
    const milestoneTitle = page.getByText(/الدرس الأول: مدخل إلى ثالوث الحماية الأساسي/i).first();
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

    // 4. Test Simulation Lab Launch & Real Interactive Validation Journey
    const openLabBtn = page.getByRole('button', { name: /الانتقال إلى المحاكي والتطبيق/i });
    await expect(openLabBtn).toBeVisible();
    await openLabBtn.click();

    // Verify inside CIA Triad Simulation Workspace
    const returnToLessonBtn = page.getByTestId('return-to-lesson-btn');
    await expect(returnToLessonBtn).toBeVisible({ timeout: 20000 });
    const validateBtn = page.getByTestId('challenge-validate-btn');
    await expect(validateBtn).toBeVisible();

    // 4a. Negative test: Intentionally uncheck Encryption to fail verification
    const toggleEncryption = page.getByTestId('toggle-encryption');
    await expect(toggleEncryption).toBeVisible();
    await toggleEncryption.uncheck();

    // Run validation while condition is broken
    await validateBtn.click();

    // Expect failure banner and verify challenge remains uncompleted
    const resultBanner = page.getByTestId('challenge-result-banner');
    await expect(resultBanner).toBeVisible();
    await expect(resultBanner).toContainText(/فشل التحقق|ما زالت هناك ثغرات/i);
    // Button must still show validate action, NOT retest/mastered
    await expect(validateBtn).toContainText(/التحقق من صحة الحل الأمني/i);

    // 4b. Positive test: Fulfill all real CIA Triad conditions (re-enable encryption)
    await toggleEncryption.check();
    await expect(page.getByTestId('toggle-signing')).toBeChecked();
    await expect(page.getByTestId('toggle-redundancy')).toBeChecked();

    // Run validation with all requirements fulfilled
    await validateBtn.click();

    // Expect success banner and verified challenge status
    await expect(resultBanner).toBeVisible();
    await expect(resultBanner).toContainText(/تم التحقق بنجاح|ممتاز! تم تحصين ثالوث CIA/i);
    await expect(validateBtn).toContainText(/إعادة الاختبار والتحقق/i);

    // 4c. Return to lesson with verified challenge state
    await returnToLessonBtn.click();

    // Back in Lesson View
    await expect(curriculumHeading).toBeVisible();
    // Verify task status reflects engine confirmation
    await expect(page.getByText(/تم تأكيد حل التحدي \(cia-balance-challenge\) برمجياً من المحرك بنجاح/i)).toBeVisible();

    // 5. Test Strict Completion Gating (Direct jump to Stage 7 from Task is blocked)
    const nextStepTab = page.getByRole('button', { name: /7\. الخطوة التالية/i });
    await expect(nextStepTab).toBeDisabled();

    // Advance sequentially through remaining stages:
    // Move to Stage 5: Security Impact
    const toStage5Btn = page.getByRole('button', { name: /المرحلة 5: شرح النتيجة/i });
    await expect(toStage5Btn).toBeVisible();
    await toStage5Btn.click();
    await expect(page.getByText(/الأثر الأمني/i).first()).toBeVisible();

    // Move to Stage 6: Knowledge Check
    const toStage6Btn = page.getByRole('button', { name: /المرحلة 6: فحص المعرفة/i });
    await expect(toStage6Btn).toBeVisible();
    await toStage6Btn.click();
    await expect(page.getByText(/الفحص المعرفي التفاعلي السريع/i)).toBeVisible();

    // Move to Stage 7: Next Step (before solving quiz)
    const toStage7Btn = page.getByRole('button', { name: /المرحلة 7: الخطوة التالية والانتقال/i });
    await expect(toStage7Btn).toBeVisible();
    await toStage7Btn.click();

    // Verify lock warning is shown because quiz is not yet solved
    await expect(page.getByText(/متطلبات إكمال المحطة غير مستوفاة بعد/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /إكمال والانتقال إلى المحطة التالية/i })).toHaveCount(0);

    // 6. Complete the Knowledge Check Quiz
    const quizTab = page.getByRole('button', { name: /6\. فحص المعرفة/i });
    await quizTab.click();

    // Answer Question 1: Availability
    const optAvailability = page.getByRole('button', { name: /التوافر \(Availability\)/i });
    await expect(optAvailability).toBeVisible();
    await optAvailability.click();
    await expect(page.getByText(/إجابة صحيحة ومتقنة!/i)).toBeVisible();

    // Answer Question 2: Confidentiality
    const optConfidentiality = page.getByRole('button', { name: /ضمان السرية/i });
    await expect(optConfidentiality).toBeVisible();
    await optConfidentiality.click();
    await expect(page.getByText(/إجابة صحيحة! التشفير يحول البيانات/i)).toBeVisible();

    // Return to Stage 7 (Next Step) - Both requirements now fulfilled via real UI interactions!
    await nextStepTab.click();
    const completeLessonBtn = page.getByRole('button', { name: /إكمال والانتقال إلى المحطة التالية/i });
    await expect(completeLessonBtn).toBeVisible();
    await completeLessonBtn.click();

    // Lesson 1 is completed and advances to Lesson 2 (System Internals)
    await expect(page.getByText(/المحطة 1 من 10/i).first()).toBeVisible();

    // Verify reload persistence after lesson completion
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/المحطة 1 من 10/i).first()).toBeVisible();

    // 8. Verify Exploratory Lesson with Honest Guided Manual Confirmation (Lesson 6)
    // NOTE: To jump to Lesson 6, we MUST fulfill prerequisites because of OMEGA MAX integrity rules
    await page.evaluate(() => {
      localStorage.setItem('omega_completed_lessons', JSON.stringify([
        'lesson-01-cia-triad',
        'lesson-02-system-internals',
        'lesson-03-subnet-routing',
        'lesson-04-firewall-rules',
        'lesson-05-cryptography'
      ]));
    });
    await page.reload();

    // Re-verify we are in lesson mode
    await expect(page.getByText(/11 مستوًى من الصفر إلى الاحتراف/i).first()).toBeVisible({ timeout: 15000 });

    // Jump to Lesson 6 (Active Directory & Kerberos) from sidebar
    const milestone6Btn = page.getByText(/5\. الهوية والمصادقة/i).first();
    await expect(milestone6Btn).toBeVisible({ timeout: 15000 });
    await milestone6Btn.click();

    // Verify Lesson 6 is now active
    await expect(page.getByText(/إدارة الهويات والمصادقة/i).first()).toBeVisible({ timeout: 15000 });

    // Advance sequentially through Lesson 6 to Stage 4 (Hands-on Task)
    const toL6Stage2Btn = page.getByRole('button', { name: /المرحلة 2: المفهوم والتشبيه الحياتي/i });
    await toL6Stage2Btn.click();
    const toL6Stage3Btn = page.getByRole('button', { name: /المرحلة 3: المعاينة الحية/i });
    await toL6Stage3Btn.click();
    const toL6Stage4Btn = page.getByRole('button', { name: /المرحلة 4: المهمة العملية/i });
    await toL6Stage4Btn.click();

    // Click guided confirmation toggle
    const confirmToggleBtn = page.getByTestId('guided-confirmation-toggle-btn');
    await expect(confirmToggleBtn).toBeVisible();
    await confirmToggleBtn.click();
    await expect(confirmToggleBtn).toContainText(/أؤكد أنني نفذت الخطوات الموجهة/i);

    // 9. Test Lab Navigation & Reload Persistence of Lesson 6
    const openLabL6Btn = page.getByRole('button', { name: /الانتقال إلى المحاكي والتطبيق/i });
    await openLabL6Btn.click();

    const returnBtnL6 = page.getByTestId('return-to-lesson-btn');
    await expect(returnBtnL6).toBeVisible({ timeout: 20000 });
    await returnBtnL6.click();

    // Confirmation must remain checked after returning from lab
    await expect(page.getByTestId('guided-confirmation-toggle-btn')).toContainText(/أؤكد أنني نفذت الخطوات الموجهة/i);

    // Reload page and verify state persistence
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // After reload, Lesson 6 must remain active and confirmation persists
    await expect(page.getByText(/إدارة الهويات والمصادقة/i).first()).toBeVisible({ timeout: 15000 });
    const storedLessonId = await page.evaluate(() => localStorage.getItem('omega_active_lesson_id'));
    expect(storedLessonId).toBe('lesson-06-active-directory');
  });

  test('validates direct navigation from Header "Start Here" button', async ({ page }) => {
    await page.goto('/#explorer');
    await page.waitForLoadState('domcontentloaded');

    const startHereNavBtn = page.getByRole('button', { name: /ابدأ هنا \(المبتدئون\)/i });
    await expect(startHereNavBtn).toBeVisible({ timeout: 10000 });
    await startHereNavBtn.click();

    await expect(page.getByText(/11 مستوًى من الصفر إلى الاحتراف/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('executes real browser UI onboarding flow: negative checks, step progression, completion evidence, and reload persistence', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify initial onboarding strip is on Step 1
    const step1Prompt = page.getByText(/خطوة 1: انقر على جدار الحماية/i);
    await expect(step1Prompt).toBeVisible({ timeout: 10000 });

    // 2. NEGATIVE CHECK: Attempting to click "Block All" before inspecting the firewall node
    // Must NOT advance the onboarding step and must NOT mark the challenge completed
    const blockAllBtn = page.getByRole('button', { name: /حظر شامل/i });
    await expect(blockAllBtn).toBeVisible();
    await blockAllBtn.click();

    // Verify step remains at 1
    await expect(step1Prompt).toBeVisible();
    const completedChallengesInitial = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('omega_completed_challenges') || '[]')
    );
    expect(completedChallengesInitial).not.toContain('orientation-guided-challenge');

    // Reset policy back to strict for legitimate test
    const strictBtn = page.getByRole('button', { name: /صارم \(443\/53\)/i });
    await strictBtn.click();

    // 3. POSITIVE STEP 1: Click the Edge Firewall Node
    const firewallNode = page.getByTestId('hero-node-firewall');
    await expect(firewallNode).toBeVisible();
    await firewallNode.click();

    // Step should advance to Step 2
    const step2Prompt = page.getByText(/خطوة 2: غير سياسة الجدار/i);
    await expect(step2Prompt).toBeVisible({ timeout: 5000 });

    // Verify entity inspector strip is visible
    await expect(page.getByText(/جدار الحماية المحيطي/i).first()).toBeVisible();

    // 4. POSITIVE STEP 2: Alter policy to "Block All"
    await blockAllBtn.click();

    // Step should advance to Step 3 and display the success prompt
    const step3Prompt = page.getByText(/رائع! لقد غيرت سلوك الدفاع المحيطي/i);
    await expect(step3Prompt).toBeVisible({ timeout: 5000 });

    const enterUniverseBtn = page.getByRole('button', { name: /ابدأ رحلة التعلم في العوالم/i });
    await expect(enterUniverseBtn).toBeVisible();

    // 5. Verify challenge completion recorded in localStorage with valid activity evidence
    const completedAfterStep = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('omega_completed_challenges') || '[]')
    );
    expect(completedAfterStep).toContain('orientation-guided-challenge');

    const progressEvidence = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('omega_onboarding_progress') || '{}')
    );
    expect(progressEvidence.firewallInspected).toBe(true);
    expect(progressEvidence.policyAltered).toBe(true);

    // 6. RELOAD PERSISTENCE: Reload the page and verify state remains at Step 3 with completed challenge
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText(/رائع! لقد غيرت سلوك الدفاع المحيطي/i)).toBeVisible({ timeout: 10000 });
    const completedAfterReload = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('omega_completed_challenges') || '[]')
    );
    expect(completedAfterReload).toContain('orientation-guided-challenge');

    // 7. ANTI-TAMPERING SANITIZATION CHECK:
    // If a user maliciously injects orientation-guided-challenge into localStorage but removes onboarding progress
    await page.evaluate(() => {
      localStorage.setItem('omega_completed_challenges', JSON.stringify(['orientation-guided-challenge']));
      localStorage.removeItem('omega_onboarding_progress');
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // After reload, forged challenge must be sanitized from store state and step reset to 1
    await expect(page.getByText(/خطوة 1: انقر على جدار الحماية/i)).toBeVisible({ timeout: 10000 });
    const completedAfterTamper = await page.evaluate(() =>
      (window as any).useSimulationStore?.getState().completedChallenges || []
    );
    expect(completedAfterTamper).not.toContain('orientation-guided-challenge');
  });
});

