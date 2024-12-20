import { Rocket, Globe2, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { getThemeClass } from '../../lib/theme'

export const Hero = () => {
  const { t } = useTranslation()

  return (
    <div className={`flex min-h-screen ${getThemeClass('gradients.primary')}`}>
      <section className="w-full py-32 md:py-48">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6">
            <div className="flex flex-col justify-center space-y-4 text-center">
              <div className="mb-24">
                <h1 className="mb-6 text-3xl font-bold tracking-tighter text-transparent text-white sm:text-5xl xl:text-6xl/none">
                  {t('hero-title')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
