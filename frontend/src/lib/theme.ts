// Theme configuration for consistent styling across pages
export const theme = {
  // Background gradients
  gradients: {
    primary: 'bg-gradient-to-b from-blue-300 to-blue-500',
  },
  
  // Colors
  colors: {
    primary: 'blue-600',
    primaryHover: 'blue-700',
    secondary: 'blue-800',
    accent: 'blue-200',
  },

  // Component specific styles
  components: {
    // Card styles
    card: {
      base: 'bg-white/90 shadow-xl backdrop-blur-sm',
    },
    
    // Input styles
    input: {
      base: 'bg-white/50 border-blue-200',
    },
    
    // Button styles
    button: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      link: 'text-blue-600 hover:text-blue-700',
    },
    
    // Text styles
    text: {
      heading: 'text-blue-600',
      body: 'text-blue-800',
    },

    // Legal Entity specific styles
    legalEntity: {
      card: {
        base: 'bg-white/90 p-6 rounded-lg shadow-sm border border-blue-100',
        hover: 'hover:shadow-md transition-shadow cursor-pointer',
      },
      entityType: {
        bank: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
        exchanger: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
        payment_provider: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium',
        custodian: 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium',
        fx_provider: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
        branch: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium',
      },
      capabilities: {
        enabled: 'text-green-600 bg-green-50 px-2 py-1 rounded text-xs',
        disabled: 'text-gray-400 bg-gray-50 px-2 py-1 rounded text-xs',
      },
      form: {
        container: 'bg-white/90 p-8 rounded-lg shadow-xl backdrop-blur-sm max-w-2xl mx-auto',
        section: 'space-y-4 p-4 bg-blue-50/50 rounded-lg',
        label: 'block text-sm font-medium text-blue-700 mb-2',
        input: 'w-full px-3 py-2 bg-white/70 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        select: 'w-full px-3 py-2 bg-white/70 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      },
      page: {
        container: 'min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8',
        header: 'bg-white/90 shadow-sm border-b border-blue-100 px-6 py-4 mb-8',
        content: 'container mx-auto px-4',
      }
    },

    // Payment Scheme specific styles
    paymentScheme: {
      card: {
        base: 'bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl cursor-pointer',
        fiat: 'border-blue-200 hover:border-blue-300',
        crypto: 'border-orange-200 hover:border-orange-300',
        fx: 'border-green-200 hover:border-green-300',
      },
      type: {
        fiat: {
          badge: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200',
          accent: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        crypto: {
          badge: 'bg-orange-100 text-orange-800',
          border: 'border-orange-200',
          accent: 'text-orange-600',
          bg: 'bg-orange-50',
        },
        fx: {
          badge: 'bg-green-100 text-green-800',
          border: 'border-green-200',
          accent: 'text-green-600',
          bg: 'bg-green-50',
        },
      },
      status: {
        operational: 'text-green-600 bg-green-50',
        notOperational: 'text-red-600 bg-red-50',
        checking: 'text-yellow-600 bg-yellow-50',
      },
      form: {
        container: 'bg-white/90 p-8 rounded-lg shadow-xl backdrop-blur-sm max-w-4xl mx-auto',
        section: 'space-y-4 p-6 bg-gray-50/50 rounded-lg border',
        sectionTitle: 'text-lg font-semibold text-gray-800 mb-4',
        label: 'block text-sm font-medium text-gray-700 mb-2',
        input: 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        select: 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        checkbox: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',
        timeInput: 'w-32 px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      },
      page: {
        container: 'min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8',
        header: 'bg-white/90 shadow-sm border-b border-blue-100 px-6 py-4 mb-8',
        content: 'container mx-auto px-4',
      },
      availability: {
        operational: 'bg-green-50 border-green-200 text-green-800',
        restricted: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        offline: 'bg-red-50 border-red-200 text-red-800',
      },
    },
  },
}

// Utility function to get theme classes
export const getThemeClass = (path: string): string => {
  const parts = path.split('.')
  let current: any = theme
  
  for (const part of parts) {
    if (current[part] === undefined) {
      console.warn(`Theme path "${path}" not found`)
      return ''
    }
    current = current[part]
  }
  
  return current
}