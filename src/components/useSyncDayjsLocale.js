// useSyncDayjsLocale.js
import { useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import "dayjs/locale/en";
import { useTranslation } from "react-i18next";

const useSyncDayjsLocale = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;
    if (lang === "th" || lang === "en") {
      dayjs.locale(lang); // เปลี่ยน locale ตามภาษา
    } else {
      dayjs.locale("en"); // fallback
    }
  }, [i18n.language]);
};

export default useSyncDayjsLocale;
