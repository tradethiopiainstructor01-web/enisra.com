import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  en: {
    home: 'Home',
    jobs: 'Jobs',
    login: 'Login',
    register: 'Register',
    scholarships: 'Scholarships',
    freeTrainings: 'Free Trainings',
    profile: 'Profile',
    notifications: 'Notifications',
    heroTitle: 'Enisra connects you to trusted jobs + scholarships.',
    heroSearchPlaceholder: 'Search jobs, scholarships, trainings...',
    browseJobsSubtitle: 'Browse open roles and filter by keyword, location, category, or job type.',
    refresh: 'Refresh',
    clearFilters: 'Clear filters',
    location: 'Location',
    category: 'Category',
    type: 'Type',
    noJobs: 'No jobs found.',
    loadingJobs: 'Loading jobs...',
    deadline: 'Deadline',
    company: 'Company',
    readMore: 'Read more',
    apply: 'Apply',
    promotedCompanies: 'Companies That Work With Us',
    loadingCompanies: 'Loading companies…',
    noCompanies: 'No partner companies to show right now.',
  },
  am: {
    home: 'መነሻ',
    jobs: 'ስራዎች',
    login: 'ግባ',
    register: 'መመዝገብ',
    scholarships: 'የትምህርት ልዩነቶች',
    freeTrainings: 'ነጻ ስልጠናዎች',
    profile: 'መገለጫ',
    notifications: 'ማሳወቂያዎች',
    heroTitle: 'ኢኒስራ ከታማኝ ስራዎችና የትምህርት ልዩነቶች ጋር ያገናኛል።',
    heroSearchPlaceholder: 'ስራዎች፣ ትምህርት ልዩነቶች፣ ስልጠናዎች ፈልግ...',
    browseJobsSubtitle: 'በቁልፍ ቃል፣ ቦታ፣ ምድብ ወይም የስራ አይነት እንዲያውሩ ዝርዝሮችን ይመልከቱ።',
    refresh: 'እንደገና አስገባ',
    clearFilters: 'ማጣሪያዎችን አጥፋ',
    location: 'ቦታ',
    category: 'ምድብ',
    type: 'አይነት',
    noJobs: 'ምንም ስራ አልተገኘም።',
    loadingJobs: 'ስራዎች በመጫን ላይ…',
    deadline: 'የማብቂያ ቀን',
    company: 'ኩባንያ',
    readMore: 'በዝርዝር ተመልከት',
    apply: 'አመልክት',
    promotedCompanies: 'ከእኛ ጋር የሚሠሩ ኩባንያዎች',
    loadingCompanies: 'ኩባንያዎች በመጫን ላይ…',
    noCompanies: 'ለመቀረበት የሚገኙ አጋሮች የሉም።',
  },
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const t = useMemo(() => {
    return (key) => translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
