import BackToHome from "@/components/BackToHome";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-6">
        <BackToHome />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-white">سياسة الخصوصية</h1>
          <p className="text-muted text-sm mt-2">آخر تحديث: أبريل 2026</p>
        </div>

        <div className="space-y-4">
          {/* Intro */}
          <div className="bg-surface rounded-xl p-4">
            <p className="text-muted text-sm leading-relaxed">
              نحن في كلمة نلتزم بحماية خصوصيتك. توضح هذه السياسة كيفية جمع
              بياناتك واستخدامها وحمايتها عند استخدامك لتطبيق كلمة على
              kalima.fun.
            </p>
          </div>

          {/* Data collected */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              البيانات التي نجمعها
            </h2>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  <span className="text-white font-semibold">بيانات الحساب:</span>{" "}
                  الاسم وعنوان البريد الإلكتروني وصورة الملف الشخصي التي
                  تقدمها Google عند تسجيل الدخول.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  <span className="text-white font-semibold">إحصائيات اللعب:</span>{" "}
                  نتائج الألغاز، عدد المحاولات، سلاسل الفوز، وتفاصيل أدائك في
                  الألعاب.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  <span className="text-white font-semibold">معلومات الجهاز:</span>{" "}
                  نوع المتصفح، نظام التشغيل، وعنوان IP لأغراض الأمان وتحسين
                  الأداء.
                </span>
              </li>
            </ul>
          </div>

          {/* How we use it */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              كيف نستخدم بياناتك
            </h2>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>تحسين تجربة اللعب وتخصيص المحتوى المقدم لك.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>مزامنة إحصائياتك عبر أجهزتك المختلفة.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>تحليل استخدام التطبيق لتطوير الميزات وإصلاح الأخطاء.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>إدارة اشتراكك في كلمة برو ومعالجة المدفوعات.</span>
              </li>
            </ul>
          </div>

          {/* Firebase/Google */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              معالجو البيانات
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              نستخدم <span className="text-white">Firebase</span> و
              <span className="text-white"> Google Cloud</span> لتخزين البيانات
              ومعالجتها. يلتزم هؤلاء المعالجون بأعلى معايير حماية البيانات
              وفقاً للوائح الدولية المعتمدة. يمكنك الاطلاع على سياسة خصوصية
              Google للمزيد من التفاصيل.
            </p>
          </div>

          {/* No selling */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              لا نبيع بياناتك
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              لا نبيع بياناتك الشخصية لأي طرف ثالث في أي وقت. قد نشارك
              بيانات مجهولة الهوية وغير قابلة للتعريف لأغراض تحليلية فقط.
            </p>
          </div>

          {/* User rights */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              حقوقك
            </h2>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  <span className="text-white font-semibold">حذف الحساب:</span>{" "}
                  يمكنك طلب حذف حسابك وجميع بياناتك المرتبطة به في أي وقت.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  <span className="text-white font-semibold">تصدير البيانات:</span>{" "}
                  يحق لك طلب نسخة من بياناتك المخزنة لدينا.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  <span className="text-white font-semibold">تصحيح البيانات:</span>{" "}
                  يحق لك طلب تصحيح أي بيانات غير دقيقة.
                </span>
              </li>
            </ul>
            <p className="text-muted text-sm mt-3">
              لممارسة أي من هذه الحقوق، تواصل معنا على{" "}
              <span className="text-primary">support@kalima.fun</span>
            </p>
          </div>

          {/* Governing law */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              الإطار القانوني
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              تخضع هذه السياسة للقانون السعودي وأحكام نظام حماية البيانات
              الشخصية (PDPL) الصادر في المملكة العربية السعودية.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">تواصل معنا</h2>
            <p className="text-muted text-sm leading-relaxed">
              لأي استفسار حول سياسة الخصوصية أو طلبات البيانات، راسلنا على:
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
            <Link href="/privacy" className="text-primary">
              سياسة الخصوصية
            </Link>
            <Link href="/refund" className="hover:text-white transition-colors">
              سياسة الاسترداد
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              شروط الاستخدام
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
