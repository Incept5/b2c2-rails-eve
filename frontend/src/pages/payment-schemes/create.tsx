
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Checkbox } from '../../components/ui/checkbox';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { getThemeClass } from '../../lib/theme';
import { paymentSchemeService } from '../../lib/payment-schemes/payment-scheme.service';
import { 
  PaymentScheme,
  PaymentSchemeType, 
  CreatePaymentSchemeDto,
  UpdatePaymentSchemeDto,
  WEEKDAYS,
  SETTLEMENT_TIMES,
  COMMON_CURRENCIES,
  COMMON_TIMEZONES
} from '../../lib/payment-schemes/payment-scheme.types';

export default function CreatePaymentSchemePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Form state
  const [formData, setFormData] = useState<CreatePaymentSchemeDto>({
    name: '',
    type: PaymentSchemeType.FIAT,
    currency: '',
    country_scope: '',
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    operating_hours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
    },
    holiday_calendar: [],
    cut_off_time: '16:00',
    settlement_time: 'T+1',
    fees: {
      flat_fee: 0,
      percentage_fee: 0,
      currency: 'USD',
    },
    limits: {
      min_amount: 0.01,
      max_amount: 1000000,
      currency: 'USD',
    },
    supports_fx: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newHoliday, setNewHoliday] = useState('');

  // Load existing scheme for editing
  useEffect(() => {
    if (isEdit && id) {
      loadScheme(id);
    }
  }, [isEdit, id]);

  const loadScheme = async (schemeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const scheme = await paymentSchemeService.getScheme(schemeId);
      
      // Convert scheme to form data
      setFormData({
        name: scheme.name,
        type: scheme.type,
        currency: scheme.currency,
        target_currency: scheme.target_currency,
        country_scope: scheme.country_scope,
        available_days: scheme.available_days,
        operating_hours: scheme.operating_hours,
        holiday_calendar: scheme.holiday_calendar,
        cut_off_time: scheme.cut_off_time,
        settlement_time: scheme.settlement_time,
        fees: scheme.fees,
        spread: scheme.spread,
        limits: scheme.limits,
        supports_fx: scheme.supports_fx,
      });
    } catch (err) {
      console.error('Failed to load scheme:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scheme');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CreatePaymentSchemeDto] as any,
        [field]: value,
      },
    }));
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      available_days: checked
        ? [...(prev.available_days || []), day]
        : (prev.available_days || []).filter(d => d !== day),
    }));
  };

  const handleAddHoliday = () => {
    if (newHoliday && !formData.holiday_calendar?.includes(newHoliday)) {
      setFormData(prev => ({
        ...prev,
        holiday_calendar: [...(prev.holiday_calendar || []), newHoliday].sort(),
      }));
      setNewHoliday('');
    }
  };

  const handleRemoveHoliday = (holiday: string) => {
    setFormData(prev => ({
      ...prev,
      holiday_calendar: (prev.holiday_calendar || []).filter(h => h !== holiday),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError(t('schemes.form.validation.nameRequired'));
      return false;
    }
    if (!formData.currency) {
      setError(t('schemes.form.validation.currencyRequired'));
      return false;
    }
    if (!formData.country_scope.trim()) {
      setError(t('schemes.form.validation.countryScopeRequired'));
      return false;
    }
    if (formData.type === PaymentSchemeType.FX && !formData.target_currency) {
      setError(t('schemes.form.validation.targetCurrencyRequiredForFx'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Clean up form data - remove undefined/empty values
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined && value !== '')
      ) as CreatePaymentSchemeDto;

      if (isEdit && id) {
        await paymentSchemeService.updateScheme(id, cleanedData as UpdatePaymentSchemeDto);
      } else {
        await paymentSchemeService.createScheme(cleanedData);
      }

      navigate('/payment-schemes');
    } catch (err) {
      console.error('Failed to save scheme:', err);
      setError(err instanceof Error ? err.message : 'Failed to save scheme');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/payment-schemes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isEdit ? t('schemes.edit') : t('schemes.create')} - {t('title')}
        </title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
        {/* Header */}
        <div className="bg-white/90 shadow-sm border-b border-blue-100 px-6 py-4 mb-8">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-blue-900">
                    {isEdit ? t('schemes.edit') : t('schemes.create')}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {isEdit ? 'Update payment scheme configuration' : 'Create a new payment scheme'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            {/* Error Display */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('schemes.form.basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('schemes.form.name')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('schemes.form.namePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">{t('schemes.form.type')} *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schemes.form.typePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PaymentSchemeType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`schemes.types.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currency">{t('schemes.form.currency')} *</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleInputChange('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schemes.form.currencyPlaceholder')} />
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

                  {formData.type === PaymentSchemeType.FX && (
                    <div>
                      <Label htmlFor="target_currency">{t('schemes.form.targetCurrency')} *</Label>
                      <Select
                        value={formData.target_currency || ''}
                        onValueChange={(value) => handleInputChange('target_currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('schemes.form.targetCurrencyPlaceholder')} />
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
                  )}

                  <div>
                    <Label htmlFor="country_scope">{t('schemes.form.countryScope')} *</Label>
                    <Input
                      id="country_scope"
                      value={formData.country_scope}
                      onChange={(e) => handleInputChange('country_scope', e.target.value)}
                      placeholder={t('schemes.form.countryScopePlaceholder')}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="supports_fx"
                      checked={formData.supports_fx}
                      onCheckedChange={(checked) => handleInputChange('supports_fx', checked)}
                    />
                    <Label htmlFor="supports_fx">{t('schemes.form.supportsFx')}</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('schemes.form.operatingHours')}</CardTitle>
                <p className="text-sm text-gray-600">{t('schemes.form.operatingHoursDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="start_time">{t('schemes.form.startTime')}</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.operating_hours?.start || ''}
                      onChange={(e) => handleNestedChange('operating_hours', 'start', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_time">{t('schemes.form.endTime')}</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.operating_hours?.end || ''}
                      onChange={(e) => handleNestedChange('operating_hours', 'end', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timezone">{t('schemes.form.timezone')}</Label>
                    <Select
                      value={formData.operating_hours?.timezone || ''}
                      onValueChange={(value) => handleNestedChange('operating_hours', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schemes.form.timezonePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Available Days */}
                <div>
                  <Label>{t('schemes.form.availableDays')}</Label>
                  <p className="text-sm text-gray-600 mb-3">{t('schemes.form.availableDaysDescription')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {WEEKDAYS.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.available_days?.includes(day) || false}
                          onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                        />
                        <Label htmlFor={day} className="text-sm">
                          {t(`schemes.weekdays.${day}`)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Cut-off Time & Settlement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cut_off_time">{t('schemes.form.cutOffTime')}</Label>
                    <Input
                      id="cut_off_time"
                      type="time"
                      value={formData.cut_off_time || ''}
                      onChange={(e) => handleInputChange('cut_off_time', e.target.value)}
                      placeholder={t('schemes.form.cutOffTimePlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="settlement_time">{t('schemes.form.settlementTime')}</Label>
                    <Select
                      value={formData.settlement_time || ''}
                      onValueChange={(value) => handleInputChange('settlement_time', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schemes.form.settlementTimePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {SETTLEMENT_TIMES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Holiday Calendar */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('schemes.form.holidayCalendar')}</CardTitle>
                <p className="text-sm text-gray-600">{t('schemes.form.holidayCalendarDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={newHoliday}
                    onChange={(e) => setNewHoliday(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddHoliday}
                    disabled={!newHoliday}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('schemes.form.addHoliday')}
                  </Button>
                </div>

                {formData.holiday_calendar && formData.holiday_calendar.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.holiday_calendar.map((holiday) => (
                      <div
                        key={holiday}
                        className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{holiday}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveHoliday(holiday)}
                          className="h-4 w-4 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fee Structure */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('schemes.form.feeStructure')}</CardTitle>
                <p className="text-sm text-gray-600">{t('schemes.form.feeStructureDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="flat_fee">{t('schemes.form.flatFee')}</Label>
                    <Input
                      id="flat_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.fees?.flat_fee || ''}
                      onChange={(e) => handleNestedChange('fees', 'flat_fee', parseFloat(e.target.value) || 0)}
                      placeholder={t('schemes.form.flatFeePlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="percentage_fee">{t('schemes.form.percentageFee')}</Label>
                    <Input
                      id="percentage_fee"
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      value={formData.fees?.percentage_fee || ''}
                      onChange={(e) => handleNestedChange('fees', 'percentage_fee', parseFloat(e.target.value) || 0)}
                      placeholder={t('schemes.form.percentageFeePlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fee_currency">{t('schemes.form.feeCurrency')}</Label>
                    <Select
                      value={formData.fees?.currency || ''}
                      onValueChange={(value) => handleNestedChange('fees', 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schemes.form.feeCurrencyPlaceholder')} />
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
                </div>

                {formData.type === PaymentSchemeType.FX && (
                  <div>
                    <Label htmlFor="spread">{t('schemes.form.spread')}</Label>
                    <Input
                      id="spread"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="1"
                      value={formData.spread || ''}
                      onChange={(e) => handleInputChange('spread', parseFloat(e.target.value) || 0)}
                      placeholder={t('schemes.form.spreadPlaceholder')}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amount Limits */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('schemes.form.amountLimits')}</CardTitle>
                <p className="text-sm text-gray-600">{t('schemes.form.amountLimitsDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="min_amount">{t('schemes.form.minAmount')}</Label>
                    <Input
                      id="min_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.limits?.min_amount || ''}
                      onChange={(e) => handleNestedChange('limits', 'min_amount', parseFloat(e.target.value) || 0)}
                      placeholder={t('schemes.form.minAmountPlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_amount">{t('schemes.form.maxAmount')}</Label>
                    <Input
                      id="max_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.limits?.max_amount || ''}
                      onChange={(e) => handleNestedChange('limits', 'max_amount', parseFloat(e.target.value) || 0)}
                      placeholder={t('schemes.form.maxAmountPlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="limit_currency">{t('schemes.form.limitCurrency')}</Label>
                    <Select
                      value={formData.limits?.currency || ''}
                      onValueChange={(value) => handleNestedChange('limits', 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('schemes.form.limitCurrencyPlaceholder')} />
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
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4 mb-8">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                {t('schemes.form.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className={getThemeClass('components.button.primary')}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : (isEdit ? t('schemes.form.submitUpdate') : t('schemes.form.submit'))}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
