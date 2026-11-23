import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  HelpCircle,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useSimulationStore } from '../../stores/simulationStore';

interface GettingStartedGuideProps {
  onClose: () => void;
}

export const GettingStartedGuide: React.FC<GettingStartedGuideProps> = ({ onClose }) => {
  const language = useSimulationStore((state) => state.language);
  const setActiveSimulation = useSimulationStore((state) => state.setActiveSimulation);
  const isAr = language === 'ar';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const open = (destination: 'lesson' | 'explorer' | 'range') => {
    onClose();
    setActiveSimulation(destination);
  };

  return (
    <div
      className="zorg-guide-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="zorg-guide-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="zorg-guide-title"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="zorg-guide-header">
          <div className="zorg-guide-heading-icon"><HelpCircle size={21} /></div>
          <div className="zorg-guide-heading-copy">
            <span>{isAr ? 'مركز المساعدة' : 'HELP CENTER'}</span>
            <h2 id="zorg-guide-title">{isAr ? 'كيف تستخدم ZORG؟' : 'How to use ZORG'}</h2>
          </div>
          <button type="button" className="zorg-guide-close" onClick={onClose} aria-label={isAr ? 'إغلاق الدليل' : 'Close guide'}>
            <X size={19} />
          </button>
        </div>

        <div className="zorg-guide-welcome">
          <strong>{isAr ? 'لا تحتاج إلى معرفة كل شيء قبل أن تبدأ.' : 'You do not need to understand everything before you begin.'}</strong>
          <p>
            {isAr
              ? 'ابدأ بالدرس الأول فقط. ستشرح لك المنصة الفكرة، ثم تفتح لك المختبر لتجربتها، وبعدها تعود لإكمال الدرس.'
              : 'Start with the first lesson. The platform explains an idea, opens its lab for practice, then brings you back to finish the lesson.'}
          </p>
        </div>

        <div className="zorg-guide-steps">
          <article className="zorg-guide-step">
            <span className="zorg-guide-step-number">01</span>
            <div className="zorg-guide-step-icon"><GraduationCap size={19} /></div>
            <div>
              <h3>{isAr ? 'ابدأ من «ابدأ هنا»' : 'Start with “Start Here”'}</h3>
              <p>{isAr ? 'هذا هو المسار التعليمي المرتب من الأساسيات. لا تبدأ باختيار العوالم الستين.' : 'This is the structured learning path. You do not need to browse the 60 worlds yet.'}</p>
            </div>
          </article>

          <article className="zorg-guide-step">
            <span className="zorg-guide-step-number">02</span>
            <div className="zorg-guide-step-icon"><BookOpen size={19} /></div>
            <div>
              <h3>{isAr ? 'اقرأ الدرس بالترتيب' : 'Follow the lesson in order'}</h3>
              <p>{isAr ? 'ابدأ بالأهداف، افهم المفهوم، ثم شاهد المعاينة. انتقل بين المراحل من الشريط أعلى الدرس.' : 'Read the objectives, understand the concept, then view the demonstration. Use the stage bar at the top.'}</p>
            </div>
          </article>

          <article className="zorg-guide-step">
            <span className="zorg-guide-step-number">03</span>
            <div className="zorg-guide-step-icon"><Play size={19} /></div>
            <div>
              <h3>{isAr ? 'طبّق داخل المختبر' : 'Practice in the lab'}</h3>
              <p>{isAr ? 'عند الوصول إلى «المهمة العملية»، اضغط فتح المحاكي ونفّذ المطلوب داخل البيئة التفاعلية.' : 'When you reach the hands-on task, open the lab and complete the activity in the interactive environment.'}</p>
            </div>
          </article>

          <article className="zorg-guide-step">
            <span className="zorg-guide-step-number">04</span>
            <div className="zorg-guide-step-icon"><CheckCircle2 size={19} /></div>
            <div>
              <h3>{isAr ? 'ارجع وأكمل الدرس' : 'Return and complete the lesson'}</h3>
              <p>{isAr ? 'استخدم زر «العودة إلى الدرس» أعلى الصفحة، أجب عن فحص المعرفة، ثم اضغط إكمال والانتقال.' : 'Use “Back to lesson” at the top, answer the knowledge check, then complete and continue.'}</p>
            </div>
          </article>
        </div>

        <div className="zorg-guide-destinations">
          <div className="zorg-guide-destination-copy">
            <ShieldCheck size={18} />
            <span>{isAr ? 'ماذا تعني الأقسام الأخرى؟' : 'What are the other areas?'}</span>
          </div>
          <p><strong>{isAr ? 'المختبرات:' : 'Laboratories:'}</strong> {isAr ? 'تجارب مستقلة حسب المجال.' : 'Independent experiments by topic.'}</p>
          <p><strong>{isAr ? 'الميدان:' : 'Cyber Range:'}</strong> {isAr ? 'بيئة متكاملة للتجارب المتقدمة؛ اتركها لما بعد الأساسيات.' : 'An integrated advanced environment; save it until after the basics.'}</p>
          <p><strong>{isAr ? 'المسارات:' : 'Paths:'}</strong> {isAr ? 'تساعدك على اختيار تخصصك لاحقاً.' : 'Helps you choose a specialization later.'}</p>
        </div>

        <div className="zorg-guide-actions">
          <button type="button" className="zorg-guide-primary" onClick={() => open('lesson')}>
            <BookOpen size={17} />
            {isAr ? 'ابدأ الدرس الأول الآن' : 'Start the first lesson'}
            <ArrowUpRight size={16} />
          </button>
          <button type="button" className="zorg-guide-secondary" onClick={() => open('explorer')}>
            <Compass size={16} />
            {isAr ? 'أريد استكشاف المختبرات' : 'Explore laboratories'}
          </button>
          <button type="button" className="zorg-guide-text-action" onClick={() => open('range')}>
            {isAr ? 'أنا مستخدم متقدم وأريد الميدان' : 'I am experienced — open the Cyber Range'}
            <ArrowLeft size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};
