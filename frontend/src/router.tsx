import React from 'react'
import { createHashRouter, RouteObject } from 'react-router-dom'
import ErrorPage from './components/error-page'
import { getDefaultLayout } from './components/layout'
import HomePage from './pages/home'
import { LoginPage } from './pages/auth/login'
import { SignupPage } from './pages/auth/signup'
import LegalEntitiesPage from './pages/legal-entities'
import CreateLegalEntityPage from './pages/legal-entities/create'
import LegalEntityDetailPage from './pages/legal-entities/[id]'
import PaymentSchemesPage from './pages/payment-schemes'
import CreatePaymentSchemePage from './pages/payment-schemes/create'
import PaymentSchemeDetailPage from './pages/payment-schemes/[id]'
import { isAuthEnabled } from './lib/auth-config'

const baseRoutes: RouteObject[] = [
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/entities',
    Component: LegalEntitiesPage,
  },
  {
    path: '/entities/create',
    Component: CreateLegalEntityPage,
  },
  {
    path: '/entities/:id',
    Component: LegalEntityDetailPage,
  },
  {
    path: '/payment-schemes',
    Component: PaymentSchemesPage,
  },
  {
    path: '/payment-schemes/create',
    Component: CreatePaymentSchemePage,
  },
  {
    path: '/payment-schemes/:id',
    Component: PaymentSchemeDetailPage,
  },
]

const authRoutes: RouteObject[] = [
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/signup',
    Component: SignupPage,
  },
]

export const routerObjects: RouteObject[] = [
  ...baseRoutes,
  ...(isAuthEnabled() ? authRoutes : []),
]

export function createRouter(): ReturnType<typeof createHashRouter> {
  const routeWrappers = routerObjects.map((router) => {
    // @ts-ignore TODO: better type support
    const getLayout = router.Component?.getLayout || getDefaultLayout
    const Component = router.Component!
    const page = getLayout(<Component />)
    return {
      ...router,
      element: page,
      Component: null,
      ErrorBoundary: ErrorPage,
    }
  })
  return createHashRouter(routeWrappers)
}
