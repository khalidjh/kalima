import BackToHome from "@/components/BackToHome";
import Link from "next/link";

export default function RefundPage() {
  return (
    <div className="h-full overflow-y-auto" dir="rtl">
      <div className="max-w-lg mx-auto px-4 py-6">
        <BackToHome />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-white">سياسة الاسترداد</h1>
          <p className="text-muted text-sm mt-2">آخر تحديث: أبريل 2026</p>
        </div>

        <div className="space-y-4">
          {/* Intro */}
          <div className="bg-surface rounded-xl p-4">
            <p className="text-muted text-sm leading-relaxed">
              نسعى في كلمة إلى تقديم تجربة اشتراك عادلة وشفافة. يرجى قراءة
              سياسة الاسترداد التالية بعناية قبل الاشتراك في كلمة برو.
            </p>
          </div>

          {/* Non-refundable */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              الاشتراكات الرقمية
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              بشكل عام، الاشتراكات الرقمية{" "}
              <span className="text-white font-semibold">غير قابلة للاسترداد</span>{" "}
              بعد استخدام الخدمة. عند اشتراكك في كلمة برو والاستفادة من
              ميزاتها، لا يحق لك طلب استرداد المبلغ المدفوع.
            </p>
          </div>

          {/* Technical issues */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              المشاكل التقنية
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-3">
              إذا كانت مشكلة تقنية من طرفنا تمنعك من الوصول إلى الخدمة
              المدفوعة، يحق لك طلب استرداد كامل للمبلغ بشرط:
            </p>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  التواصل معنا خلال{" "}
                  <span className="text-white font-semibold">7 أيام</span> من
                  تاريخ حدوث المشكلة.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  تقديم وصف واضح للمشكلة التقنية التي واجهتها.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>
                  التحقق من أن المشكلة ناتجة عن خطأ في منصتنا وليس جهازك أو
                  اتصالك بالإنترنت.
                </span>
              </li>
            </ul>
          </div>

          {/* Unused periods */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              فترات الاشتراك غير المستخدمة
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              في حالات خاصة، قد ندرس طلبات الاسترداد النسبي للفترات غير
              المستخدمة من الاشتراك. تُدرس هذه الحالات{" "}
              <span className="text-white font-semibold">بصورة فردية</span> وفقاً
              للظروف المقدمة. يُرجى التواصل معنا مع شرح كامل لسبب طلبك.
            </p>
          </div>

          {/* How to request */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              كيفية طلب الاسترداد
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-3">
              لتقديم طلب استرداد، تواصل معنا عبر البريد الإلكتروني مع تضمين:
            </p>
            <ul className="space-y-2 text-sm text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>عنوان البريد الإلكتروني المرتبط بحسابك.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>تاريخ عملية الدفع ومبلغها.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary flex-shrink-0">•</span>
                <span>سبب طلب الاسترداد بوضوح.</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-background rounded-lg">
              <p className="text-muted text-xs mb-1">راسلنا على:</p>
              <p className="text-primary font-semibold text-sm">
                support@kalima.fun
              </p>
              <p className="text-muted text-xs mt-2">
                نرد على جميع الطلبات خلال{" "}
                <span className="text-white">يومَي عمل</span>.
              </p>
            </div>
          </div>

          {/* Cancellation */}
          <div className="bg-surface rounded-xl p-4">
            <h2 className="text-primary font-bold text-lg mb-3">
              إلغاء الاشتراك
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              يمكنك إلغاء اشتراكك في كلمة برو في أي وقت. سيظل اشتراكك فعّالاً
              حتى نهاية فترة الفوترة الحالية، ولن يتم تجديده تلقائياً بعد
              الإلغاء.
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
            <Link href="/refund" className="text-primary">
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
