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