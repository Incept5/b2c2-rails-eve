
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getThemeClass } from '../../../lib/theme';
import { 
  CreateLegalEntityDto, 
  UpdateLegalEntityDto, 
  LegalEntity, 
  LegalEntityType 
} from '../../../lib/legal-entities/legal-entity.types';

interface EntityFormProps {
  entity?: LegalEntity; // For editing existing entity
  entities?: LegalEntity[]; // For parent selection
  onSubmit: (data: any) => Promise<void>; // Use any for flexibility between create and update
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  country: string;
  entityType: LegalEntityType | '';
  timezone: string;
  regulatoryScope: string;
  parentEntityId: string;
}

interface FormErrors {
  name?: string;
  country?: string;
  entityType?: string;
  timezone?: string;
  regulatoryScope?: string;
  parentEntityId?: string;
}

// Common country codes
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
];

// Common timezones
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Australia/Sydney',
];

// Get default capabilities for entity type
const getDefaultCapabilities = (entityType: LegalEntityType) => {
  switch (entityType) {
    case LegalEntityType.BANK:
    case LegalEntityType.PAYMENT_PROVIDER:
      return { canHostAccounts: true, canHostWallets: false, canHostFxNodes: false };
    case LegalEntityType.EXCHANGER:
    case LegalEntityType.CUSTODIAN:
      return { canHostAccounts: false, canHostWallets: true, canHostFxNodes: false };
    case LegalEntityType.FX_PROVIDER:
      return { canHostAccounts: false, canHostWallets: false, canHostFxNodes: true };
    case LegalEntityType.BRANCH:
      return { canHostAccounts: false, canHostWallets: false, canHostFxNodes: false };
    default:
      return { canHostAccounts: false, canHostWallets: false, canHostFxNodes: false };
  }
};

export function EntityForm({ entity, entities = [], onSubmit, onCancel, isLoading = false }: EntityFormProps) {
  const { t } = useTranslation();
  const isEdit = !!entity;

  const [formData, setFormData] = useState<FormData>({
    name: entity?.name || '',
    country: entity?.country || '',
    entityType: entity?.entityType || '',
    timezone: entity?.timezone || '',
    regulatoryScope: entity?.regulatoryScope || '',
    parentEntityId: entity?.parentEntityId || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Get potential parent entities (exclude current entity and branches)
  const potentialParents = entities.filter(e => 
    e.entityType !== LegalEntityType.BRANCH && 
    (!entity || e.entityId !== entity.entityId)
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('entities.form.validation.nameRequired');
    }

    if (!formData.country) {
      newErrors.country = t('entities.form.validation.countryRequired');
    }

    if (!formData.entityType) {
      newErrors.entityType = t('entities.form.validation.entityTypeRequired');
    }

    if (!formData.timezone) {
      newErrors.timezone = t('entities.form.validation.timezoneRequired');
    }

    if (formData.entityType === LegalEntityType.BRANCH && !formData.parentEntityId) {
      newErrors.parentEntityId = t('entities.form.validation.parentRequiredForBranch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      country: formData.country.toUpperCase(),
      timezone: formData.timezone,
      regulatoryScope: formData.regulatoryScope.trim() || undefined,
      ...(isEdit ? {} : { 
        entityType: formData.entityType as LegalEntityType,
        parentEntityId: formData.parentEntityId || undefined 
      }),
    };

    await onSubmit(submitData);
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Clear parent entity when type changes away from branch
    if (field === 'entityType' && value !== LegalEntityType.BRANCH) {
      setFormData(prev => ({ ...prev, parentEntityId: '' }));
    }
  };

  const currentCapabilities = formData.entityType ? getDefaultCapabilities(formData.entityType as LegalEntityType) : null;

  return (
    <div className={getThemeClass('components.legalEntity.page.container')}>
      <div className={getThemeClass('components.legalEntity.page.content')}>
        <Card className={getThemeClass('components.legalEntity.form.container')}>
          <CardHeader>
            <CardTitle className={getThemeClass('components.text.heading')}>
              {isEdit ? t('entities.edit') : t('entities.create')}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className={getThemeClass('components.legalEntity.form.section')}>
                <h3 className="text-lg font-medium text-blue-700 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Entity Name */}
                  <div>
                    <Label htmlFor="name" className={getThemeClass('components.legalEntity.form.label')}>
                      {t('entities.form.name')} *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder={t('entities.form.namePlaceholder')}
                      className={getThemeClass('components.legalEntity.form.input')}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <Label htmlFor="country" className={getThemeClass('components.legalEntity.form.label')}>
                      {t('entities.form.country')} *
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleFieldChange('country', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={getThemeClass('components.legalEntity.form.select')}>
                        <SelectValue placeholder={t('entities.form.countryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name} ({country.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.country}</span>
                      </div>
                    )}
                  </div>

                  {/* Entity Type (only for create) */}
                  {!isEdit && (
                    <div>
                      <Label htmlFor="entityType" className={getThemeClass('components.legalEntity.form.label')}>
                        {t('entities.form.entityType')} *
                      </Label>
                      <Select
                        value={formData.entityType}
                        onValueChange={(value) => handleFieldChange('entityType', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className={getThemeClass('components.legalEntity.form.select')}>
                          <SelectValue placeholder={t('entities.form.entityTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(LegalEntityType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`entities.types.${type}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.entityType && (
                        <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.entityType}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timezone */}
                  <div>
                    <Label htmlFor="timezone" className={getThemeClass('components.legalEntity.form.label')}>
                      {t('entities.form.timezone')} *
                    </Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => handleFieldChange('timezone', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={getThemeClass('components.legalEntity.form.select')}>
                        <SelectValue placeholder={t('entities.form.timezonePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.timezone && (
                      <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.timezone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Regulatory Scope */}
                <div className="mt-4">
                  <Label htmlFor="regulatoryScope" className={getThemeClass('components.legalEntity.form.label')}>
                    {t('entities.form.regulatoryScope')}
                  </Label>
                  <Input
                    id="regulatoryScope"
                    value={formData.regulatoryScope}
                    onChange={(e) => handleFieldChange('regulatoryScope', e.target.value)}
                    placeholder={t('entities.form.regulatoryScopePlaceholder')}
                    className={getThemeClass('components.legalEntity.form.input')}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Parent Entity (for branches only) */}
              {!isEdit && formData.entityType === LegalEntityType.BRANCH && (
                <div className={getThemeClass('components.legalEntity.form.section')}>
                  <h3 className="text-lg font-medium text-blue-700 mb-4">Hierarchy</h3>
                  
                  <div>
                    <Label htmlFor="parentEntity" className={getThemeClass('components.legalEntity.form.label')}>
                      {t('entities.form.parentEntity')} *
                    </Label>
                    <Select
                      value={formData.parentEntityId}
                      onValueChange={(value) => handleFieldChange('parentEntityId', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={getThemeClass('components.legalEntity.form.select')}>
                        <SelectValue placeholder={t('entities.form.parentEntityPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {potentialParents.map((entity) => (
                          <SelectItem key={entity.entityId} value={entity.entityId}>
                            {entity.name} ({entity.country})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.parentEntityId && (
                      <div className="flex items-center space-x-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.parentEntityId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Capabilities Preview */}
              {currentCapabilities && (
                <div className={getThemeClass('components.legalEntity.form.section')}>
                  <h3 className="text-lg font-medium text-blue-700 mb-2">{t('entities.form.capabilities')}</h3>
                  <p className="text-sm text-gray-600 mb-4">{t('entities.form.capabilitiesDescription')}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={currentCapabilities.canHostAccounts ? 
                      getThemeClass('components.legalEntity.capabilities.enabled') : 
                      getThemeClass('components.legalEntity.capabilities.disabled')
                    }>
                      {currentCapabilities.canHostAccounts ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {t('entities.capabilities.canHostAccounts')}
                    </Badge>
                    
                    <Badge className={currentCapabilities.canHostWallets ? 
                      getThemeClass('components.legalEntity.capabilities.enabled') : 
                      getThemeClass('components.legalEntity.capabilities.disabled')
                    }>
                      {currentCapabilities.canHostWallets ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {t('entities.capabilities.canHostWallets')}
                    </Badge>
                    
                    <Badge className={currentCapabilities.canHostFxNodes ? 
                      getThemeClass('components.legalEntity.capabilities.enabled') : 
                      getThemeClass('components.legalEntity.capabilities.disabled')
                    }>
                      {currentCapabilities.canHostFxNodes ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {t('entities.capabilities.canHostFxNodes')}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {t('entities.form.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={getThemeClass('components.button.primary')}
                >
                  {isLoading ? t('common.loading') : 
                   isEdit ? t('entities.form.submitUpdate') : t('entities.form.submit')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
