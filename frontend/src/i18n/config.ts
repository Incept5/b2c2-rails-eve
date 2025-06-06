
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'

export const LANGUAGES = ['en', 'fr']

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      // no reason there is a language called 'dev', just passed it away
      if (language === 'dev') return
      // Map language codes to our available languages
      const mappedLanguage = language.startsWith('en') ? 'en' : 
                            language.startsWith('fr') ? 'fr' : 'en'
      return import(`./locales/${mappedLanguage}/${namespace}.json`)
    }),
  )
  .init({
    debug: true,
    fallbackLng: {
      'en-GB': ['en'],
      'en-US': ['en'],
      'fr-FR': ['fr'],
      'fr-CA': ['fr'],
      zh: ['zh-Hans'],
      ['zh-CN']: ['zh-Hans'],
      ['zh-HK']: ['zh-Hant'],
      ['zh-TW']: ['zh-Hant'],
      'de-CH': ['fr', 'it'],
      default: ['en'],
    },
  })
