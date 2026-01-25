import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';
import { useLanguage } from '../providers/LanguageProvider';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="min-w-[140px] border-emerald-300 dark:border-teal-600 bg-white dark:bg-slate-800 text-emerald-950 dark:text-teal-100 font-medium">
        <Languages className="w-4 h-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-slate-800 border-emerald-300 dark:border-teal-600">
        {LANGUAGES.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            className="text-emerald-950 dark:text-teal-100 focus:bg-emerald-50 dark:focus:bg-teal-900/30 font-medium"
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}