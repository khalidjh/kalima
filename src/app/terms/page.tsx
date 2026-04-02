import BackToHome from "@/components/BackToHome";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-6">
        <BackToHome />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-white">شروط الاستخدام</h1>
          <p className="text-muted text-sm mt-2">آخر تحديث: أبريل 2026</p>
        </div>

        <div className="space-y-4">
          {/* Intro */}
          <div className="bg-surface rounded-xl p-4">
            <p className="text-muted text-sm leading-relaxed">
              مرحباً بك في كلمة. باستخدامك لهذه الخدمة، فإنك توافق على الشروط
              والأحكام المبينة أدناه. يرجى قراءتها بعناية قبل البدء.
            </p>
          </div>

          {/* Service description */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">الخدمة</h2>
            <p className="text-muted text-sm leading-relaxed">
              كلمة هي منصة ألعاب كلمات عربية يومية متاحة على{" "}
              <span className="text-white">kalima.fun</span>. تقدم الخدمة ألغازاً
              يومية تتحدى قدرتك على تخمين الكلمات العربية، بجانب ميزات إضافية
              في اشتراك كلمة برو.
            </p>
          </div>

          {/* Age requirement */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              متطلبات العمر
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              يجب أن يكون عمرك{" "}
              <span className="text-white font-semibold">13 عاماً أو أكثر</span>{" "}
              لاستخدام هذه الخدمة. إذا كنت دون هذا السن، يُرجى التوقف عن
              الاستخدام فوراً.
            </p>
          </div>

          {/* Prohibited activities */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              الاستخدام المقبول
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-3">
              عند استخدامك للخدمة، يُحظر عليك:
            </p>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-present flex-shrink-0">✕</span>
                <span>الغش أو استخدام أدوات مساعدة غير مشروعة للفوز في الألغاز.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-present flex-shrink-0">✕</span>
                <span>
                  استخدام أنظمة آلية أو بوتات للتفاعل مع الخدمة.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-present flex-shrink-0">✕</span>
                <span>
                  استخراج أو نسخ أي محتوى من الموقع بأساليب آلية (Scraping).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-present flex-shrink-0">✕</span>
                <span>
                  محاولة الوصول غير المصرح به إلى أي جزء من منصتنا أو قواعد
                  بياناتنا.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-present flex-shrink-0">✕</span>
                <span>انتحال شخصية أي مستخدم أو موظف في كلمة.</span>
              </li>
            </ul>
          </div>

          {/* Pro subscription */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              اشتراك كلمة برو
            </h2>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  سعر الاشتراك:{" "}
                  <span className="text-white font-semibold">9.99 ريال سعودي / شهر</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  يُجدَّد الاشتراك تلقائياً كل شهر حتى يتم الإلغاء.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>يمكنك إلغاء الاشتراك في أي وقت دون رسوم إضافية.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  المدفوعات تُعالج بأمان عبر منصة Moyasar المرخصة.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  يحق لنا تعديل أسعار الاشتراك مع إشعار مسبق قبل 30 يوماً.
                </span>
              </li>
            </ul>
          </div>

          {/* Content ownership */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              ملكية المحتوى
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              جميع الألغاز والكلمات والمحتوى المقدم عبر كلمة هو{" "}
              <span className="text-white font-semibold">ملكية حصرية لكلمة</span>.
              لا يجوز نسخ أو توزيع أو إعادة نشر أي محتوى دون إذن كتابي مسبق
              منا.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              إخلاء المسؤولية
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              تُقدَّم الخدمة{" "}
              <span className="text-white font-semibold">"كما هي"</span> دون أي
              ضمانات صريحة أو ضمنية. لا نضمن توفر الخدمة بشكل مستمر أو خلوها
              من الأخطاء. لا نتحمل المسؤولية عن أي خسائر ناتجة عن استخدام أو
              عدم القدرة على استخدام الخدمة.
            </p>
          </div>

          {/* Updates to terms */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              تحديثات الشروط
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              نحتفظ بحق تعديل هذه الشروط في أي وقت. سنُخطرك بأي تغييرات جوهرية
              عبر البريد الإلكتروني أو إشعار بارز على المنصة. استمرارك في
              استخدام الخدمة بعد التحديث يعني قبولك للشروط الجديدة.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">تواصل معنا</h2>
            <p className="text-muted text-sm leading-relaxed">
              لأي استفسار حول هذه الشروط أو خدماتنا، راسلنا على:
            </p>
            <p className="text-white text-sm font-semibold mt-2">
              support@kalima.fun
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-muted text-sm mb-3">© 2026 كلمة — kalima.fun</p>
          <div className="flex justify-center gap-4 text-xs text-muted">
            <Link href="/privacy" className="hover:text-white transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/refund" className="hover:text-white transition-colors">
              سياسة الاسترداد
            </Link>
            <Link href="/terms" className="text-primary">
              شروط الاستخدام
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
