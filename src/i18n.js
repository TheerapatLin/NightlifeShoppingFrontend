// filepath: /Users/siriroongaroonwongs/Documents/real_projects/HealWorld/healworld_web/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          "welcome": "Welcome to HealWorld",
          // ...other translations
        }
      },
      th: {
        translation: {
          "welcome": "ยินดีต้อนรับสู่ HealWorld",
          // ...other translations
        }
      }
    }
  });

export default i18n;