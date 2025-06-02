
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  Globe, 
  CheckCircle, 
  XCircle,
  Calendar,
  Settings,
  AlertTriangle,
  Calculator
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getThemeClass } from '../../lib/theme';
import { paymentSchemeService } from '../../lib/payment-schemes/payment-scheme.service';
import { 
  PaymentScheme, 
  PaymentSchemeType,
  SchemeAvailability,
  FeeCalculation,
  COMMON_CURRENCIES 
} from '../../lib/payment-schemes/payment-scheme.types';

export default function PaymentSchemeDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // State
  const [scheme, setScheme] = useState<PaymentScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Availability checking
  const [availability, setAvailability] = useState<SchemeAvailability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fee calculator
  const [feeCalculation, setFeeCalculation] = useState<FeeCalculation | null>(null);
  const [calculatingFees, setCalculatingFees] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    amount: '',
    sourceCurrency: '',
    targetCurrency: '',
  });

  // Load scheme data
  useEffect(() => {
    if (id) {
      loadScheme(id);
    }
  }, [id]);

  const loadScheme = async (schemeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const schemeData = await paymentSchemeService.getScheme(schemeId);
      setScheme(schemeData);
      
      // Set default calculator currencies
      setCalculatorData(prev => ({
        ...prev,
        sourceCurrency: schemeData.currency,
        targetCurrency: schemeData.target_currency || schemeData.currency,
      }));
    } catch (err) {
      console.error('Failed to load scheme:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scheme');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    if (!scheme) return;
    
    setCheckingAvailability(true);
    try {
      const result = await paymentSchemeService.checkSchemeAvailability(scheme.scheme_id);
      setAvailability(result);
    } catch (err) {
      console.error('Failed to check availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCalculateFees = async () => {
    if (!scheme || !calculatorData.amount) return;

    setCalculatingFees(true);
    try {
      const result = await paymentSchemeService.calculateFees(
        scheme.scheme_id,
        parseFloat(calculatorData.amount),
        calculatorData.sourceCurrency,
        calculatorData.targetCurrency
      );
      setFeeCalculation(result);
    } catch (err) {
      console.error('Failed to calculate fees:', err);
    } finally {
      setCalculatingFees(false);
    }
  };

  const handleEdit = () => {
    navigate(`/payment-schemes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!scheme || !confirm(t('schemes.deleteConfirm'))) {
      return;
    }

    try {
      await paymentSchemeService.deleteScheme(scheme.scheme_id);
      navigate('/payment-schemes');
    } catch (err) {
      console.error('Failed to delete scheme:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete scheme');
    }
  };

  const handleBack = () => {
    navigate('/payment-schemes');
  };

  // Get type-specific styling
  const getTypeStyles = (type: PaymentSchemeType) => {
    switch (type) {
      case PaymentSchemeType.FIAT:
        return { badge: 'bg-blue-100 text-blue-800', accent: 'text-blue-600' };
      case PaymentSchemeType.CRYPTO:
        return { badge: 'bg-orange-100 text-orange-800', accent: 'text-orange-600' };
      case PaymentSchemeType.FX:
        return { badge: 'bg-green-100 text-green-800', accent: 'text-green-600' };
      default:
        return { badge: 'bg-gray-100 text-gray-800', accent: 'text-gray-600' };
    }
  };

  const formatOperatingHours = () => {
    if (!scheme?.operating_hours) return 'Not specified';
    return `${scheme.operating_hours.start} - ${scheme.operating_hours.end} (${scheme.operating_hours.timezone})`;
  };

  const formatFees = () => {
    if (!scheme?.fees) return 'No fees';
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
    if (!scheme?.limits) return 'No limits';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg text-gray-600">Loading payment scheme...</div>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
        <div className="container mx-auto px-4">
          <Alert className="border-red-200 bg-red-50 max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error || 'Payment scheme not found'}
            </AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payment Schemes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const typeStyles = getTypeStyles(scheme.type);

  return (
    <>
      <Helmet>
        <title>{scheme.name} - {t('schemes.title')} - {t('title')}</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
        {/* Header */}
        <div className="bg-white/90 shadow-sm border-b border-blue-100 px-6 py-4 mb-8">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className={`text-2xl font-bold ${typeStyles.accent}`}>
                    {scheme.name}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
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
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('schemes.edit')}
                </Button>
                <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('schemes.delete')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Name</Label>
                      <p className="text-lg font-semibold">{scheme.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                      <p className="text-lg">{t(`schemes.types.${scheme.type}`)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Primary Currency</Label>
                      <p className="text-lg font-mono">{scheme.currency}</p>
                    </div>
                    {scheme.target_currency && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Target Currency</Label>
                        <p className="text-lg font-mono">{scheme.target_currency}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Country/Region Scope</Label>
                      <p className="text-lg">{scheme.country_scope}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">FX Support</Label>
                      <div className="flex items-center space-x-2">
                        {scheme.supports_fx ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span>{scheme.supports_fx ? 'Supported' : 'Not Supported'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operating Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Operating Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Operating Hours</Label>
                      <p className="text-lg">{formatOperatingHours()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Available Days</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scheme.available_days.map((day) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {t(`schemes.weekdays.${day}`)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Cut-off Time</Label>
                      <p className="text-lg">{scheme.cut_off_time || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Settlement Time</Label>
                      <p className="text-lg">{scheme.settlement_time}</p>
                    </div>
                  </div>

                  {scheme.holiday_calendar && scheme.holiday_calendar.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Holiday Calendar</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {scheme.holiday_calendar.map((holiday) => (
                          <Badge key={holiday} variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {holiday}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fee Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Fee Structure & Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Fees</Label>
                      <p className="text-lg">{formatFees()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Amount Limits</Label>
                      <p className="text-lg">{formatLimits()}</p>
                    </div>
                    {scheme.spread && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">FX Spread</Label>
                        <p className="text-lg">{(scheme.spread * 100).toFixed(4)}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability Checker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {t('schemes.availability.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleCheckAvailability}
                    disabled={checkingAvailability}
                    className="w-full"
                  >
                    {checkingAvailability ? t('schemes.availability.checking') : t('schemes.availability.checkNow')}
                  </Button>

                  {availability && (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${
                        availability.is_operational 
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {availability.is_operational ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {availability.is_operational 
                              ? t('schemes.availability.operational')
                              : t('schemes.availability.notOperational')
                            }
                          </span>
                        </div>
                      </div>

                      {availability.restrictions && availability.restrictions.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center space-x-1 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                              {t('schemes.availability.restrictions')}
                            </span>
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {availability.restrictions.map((restriction, index) => (
                              <li key={index}>• {restriction}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {availability.next_availability && (
                        <div className="text-sm text-gray-600">
                          <strong>{t('schemes.availability.nextAvailable')}:</strong><br />
                          {new Date(availability.next_availability).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fee Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    {t('schemes.feeCalculator.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="calc-amount">{t('schemes.feeCalculator.amount')}</Label>
                    <Input
                      id="calc-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={calculatorData.amount}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder={t('schemes.feeCalculator.amountPlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="calc-source">{t('schemes.feeCalculator.sourceCurrency')}</Label>
                    <Select
                      value={calculatorData.sourceCurrency}
                      onValueChange={(value) => setCalculatorData(prev => ({ ...prev, sourceCurrency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="calc-target">{t('schemes.feeCalculator.targetCurrency')}</Label>
                    <Select
                      value={calculatorData.targetCurrency}
                      onValueChange={(value) => setCalculatorData(prev => ({ ...prev, targetCurrency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCalculateFees}
                    disabled={calculatingFees || !calculatorData.amount}
                    className="w-full"
                  >
                    {calculatingFees ? t('schemes.feeCalculator.calculating') : t('schemes.feeCalculator.calculate')}
                  </Button>

                  {feeCalculation && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-sm">{t('schemes.feeCalculator.results')}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>{t('schemes.feeCalculator.baseAmount')}:</span>
                          <span>{feeCalculation.base_amount.toFixed(2)}</span>
                        </div>
                        {feeCalculation.fee_breakdown.flat_fee && (
                          <div className="flex justify-between">
                            <span>{t('schemes.feeCalculator.flatFee')}:</span>
                            <span>{feeCalculation.fee_breakdown.flat_fee.toFixed(2)}</span>
                          </div>
                        )}
                        {feeCalculation.fee_breakdown.percentage_fee && (
                          <div className="flex justify-between">
                            <span>{t('schemes.feeCalculator.percentageFee')}:</span>
                            <span>{feeCalculation.fee_breakdown.percentage_fee.toFixed(2)}</span>
                          </div>
                        )}
                        {feeCalculation.fee_breakdown.fx_spread_fee && (
                          <div className="flex justify-between">
                            <span>{t('schemes.feeCalculator.spreadFee')}:</span>
                            <span>{feeCalculation.fee_breakdown.fx_spread_fee.toFixed(2)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>{t('schemes.feeCalculator.totalFee')}:</span>
                          <span>{feeCalculation.total_fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>{t('schemes.feeCalculator.finalAmount')}:</span>
                          <span>{feeCalculation.final_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <Label className="text-gray-500">Scheme ID</Label>
                    <p className="font-mono text-xs break-all">{scheme.scheme_id}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Created</Label>
                    <p>{new Date(scheme.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Last Updated</Label>
                    <p>{new Date(scheme.updated_at).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
