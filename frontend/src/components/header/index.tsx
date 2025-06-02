import React, { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LanguageSelector } from '../language-selector'
import { UserMenu } from '../user-menu'
import { useTranslation } from 'react-i18next'

interface IProps {
  leftNode?: ReactNode
}

export function Header(props: IProps) {
  const { t } = useTranslation()
  const location = useLocation()

  const navigationItems = [
    { path: '/', label: t('navigation.dashboard') },
    { path: '/entities', label: t('navigation.entities') },
    { path: '/payment-schemes', label: t('navigation.schemes') },
  ]

  return (
    <div className="fixed left-0 top-0 flex w-full items-center justify-between border bg-slate-50 bg-opacity-70 px-4 py-4 md:px-12 z-50">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-xs md:text-base font-semibold text-blue-600">
          {t('title')}
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                location.pathname === item.path
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <LanguageSelector />
        <UserMenu />
      </div>
    </div>
  )
}
