import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import i18n from '../i18n';

export function Header() {
  const { t } = useTranslation();
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';

  function toggleLang() {
    const next = currentLang === 'ar' ? 'en' : 'ar';
    void i18n.changeLanguage(next);
  }

  return (
    <header
      data-testid="header"
      className="sticky top-0 z-40 bg-sunny border-b-4 border-ink"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link
          to="/"
          data-testid="header-brand"
          className="flex items-center gap-2 group"
        >
          <span
            aria-hidden="true"
            className="w-10 h-10 rounded-2xl bg-cobalt border-4 border-ink flex items-center justify-center text-white font-black text-xl group-active:translate-x-0.5 group-active:translate-y-0.5 transition-transform"
          >
            K
          </span>
          <span className="font-display font-black text-ink text-xl tracking-tight">
            {t('header.brand')}
          </span>
        </Link>

        <button
          type="button"
          data-testid="header-lang-toggle"
          onClick={toggleLang}
          aria-label={t('header.lang_toggle_aria')}
          className="text-sm font-black text-ink px-3 py-1.5 rounded-xl bg-white border-2 border-ink shadow-pop active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          {currentLang === 'ar' ? 'EN' : 'ع'}
        </button>
      </div>
    </header>
  );
}
