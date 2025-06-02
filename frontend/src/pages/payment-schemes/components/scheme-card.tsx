
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  Globe, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { PaymentScheme, PaymentSchemeType } from '../../../lib/payment-schemes/payment-scheme.types';
import { paymentSchemeService } from '../../../lib/payment-schemes/payment-scheme.service';

interface SchemeCardProps {
  scheme: PaymentScheme;
  onView: (scheme: PaymentScheme) => void;
  onEdit: (scheme: PaymentScheme) => void;
  onDelete: (scheme: PaymentScheme) => void;
}

export function SchemeCard({ scheme, onView, onEdit, onDelete }: SchemeCardProps) {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    is_operational: boolean;
    restrictions?: string[];
  } | null>(null);

  // Get type-specific styling
  const getTypeStyles = (type: PaymentSchemeType) => {
    switch (type) {
      case PaymentSchemeType.FIAT:
        return {
          badge: 'bg-blue-100 text-blue-800',
          border: 'border-blue-200',
          accent: 'text-blue-600'
        };
      case PaymentSchemeType.CRYPTO:
        return {
          badge: 'bg-orange-100 text-orange-800',
          border: 'border-orange-200',
          accent: 'text-orange-600'
        };
      case PaymentSchemeType.FX:
        return {
          badge: 'bg-green-100 text-green-800',
          border: 'border-green-200',
          accent: 'text-green-600'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          border: 'border-gray-200',
          accent: 'text-gray-600'
        };
    }
  };

  const typeStyles = getTypeStyles(scheme.type);

  const handleCheckAvailability = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setChecking(true);
    try {
      const result = await paymentSchemeService.checkSchemeAvailability(scheme.scheme_id);
      setAvailability(result);
    } catch (error) {
      console.error('Failed to check availability:', error);
    } finally {
      setChecking(false);
    }
  };

  const formatOperatingHours = () => {
    if (!scheme.operating_hours) return 'Not specified';
    return `${scheme.operating_hours.start} - ${scheme.operating_hours.end} (${scheme.operating_hours.timezone})`;
  };

  const formatFees = () => {
    const parts = [];
    if (scheme.fees.flat_fee) {
      parts.push(`${scheme.fees.flat_fee} ${scheme.fees.currency || scheme.currency}`);
    }
    if (scheme.fees.percentage_fee) {
      parts.push(`${(scheme.fees.percentage_fee * 100).toFixed(3)}%`);
    }
    return parts.length > 0 ? parts.join(' + ') : 'No fees';
  };

  const formatLimits = () => {
    if (!scheme.limits.min_amount && !scheme.limits.max_amount) return 'No limits';
    const currency = scheme.limits.currency || scheme.currency;
    if (scheme.limits.min_amount && scheme.limits.max_amount) {
      return `${scheme.limits.min_amount} - ${scheme.limits.max_amount} ${currency}`;
    }
    if (scheme.limits.min_amount) {
      return `Min: ${scheme.limits.min_amount} ${currency}`;
    }
    if (scheme.limits.max_amount) {
      return `Max: ${scheme.limits.max_amount} ${currency}`;
    }
    return 'No limits';
  };

  return (
    <Card 
      className={`bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl cursor-pointer ${typeStyles.border}`}
      onClick={() => onView(scheme)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className={`text-lg font-semibold ${typeStyles.accent} mb-2`}>
              {scheme.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${typeStyles.badge} text-xs font-medium`}>
                {t(`schemes.types.${scheme.type}`)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {scheme.currency}
                {scheme.target_currency && ` → ${scheme.target_currency}`}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {scheme.country_scope}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(scheme); }}>
                <Eye className="h-4 w-4 mr-2" />
                {t('schemes.view')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(scheme); }}>
                <Edit className="h-4 w-4 mr-2" />
                {t('schemes.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(scheme); }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('schemes.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Operating Hours */}
        <div className="flex items-start space-x-3">
          <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Operating Hours</p>
            <p className="text-xs text-gray-600 truncate">{formatOperatingHours()}</p>
          </div>
        </div>

        {/* Settlement Time */}
        <div className="flex items-start space-x-3">
          <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Settlement</p>
            <p className="text-xs text-gray-600">{scheme.settlement_time}</p>
          </div>
        </div>

        {/* Fees */}
        <div className="flex items-start space-x-3">
          <DollarSign className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Fees</p>
            <p className="text-xs text-gray-600 truncate">{formatFees()}</p>
          </div>
        </div>

        {/* Limits */}
        <div className="flex items-start space-x-3">
          <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Limits</p>
            <p className="text-xs text-gray-600 truncate">{formatLimits()}</p>
          </div>
        </div>

        {/* FX Support & Spread */}
        {scheme.supports_fx && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              FX Supported
            </span>
            {scheme.spread && (
              <span className="text-xs text-gray-600">
                Spread: {(scheme.spread * 100).toFixed(3)}%
              </span>
            )}
          </div>
        )}

        <Separator />

        {/* Availability Check */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckAvailability}
            disabled={checking}
            className="text-xs"
          >
            {checking ? 'Checking...' : 'Check Availability'}
          </Button>
          
          {availability && (
            <div className="flex items-center space-x-1">
              {availability.is_operational ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${availability.is_operational ? 'text-green-600' : 'text-red-600'}`}>
                {availability.is_operational ? 'Operational' : 'Not Available'}
              </span>
            </div>
          )}
        </div>

        {/* Restrictions */}
        {availability && availability.restrictions && availability.restrictions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="flex items-center space-x-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-800">Restrictions</span>
            </div>
            <ul className="text-xs text-yellow-700 space-y-1">
              {availability.restrictions.map((restriction, index) => (
                <li key={index}>• {restriction}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
