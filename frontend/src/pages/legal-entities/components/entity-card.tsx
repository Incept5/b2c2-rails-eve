
import { Building2, MapPin, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { getThemeClass } from '../../../lib/theme';
import { LegalEntity, LegalEntityType } from '../../../lib/legal-entities/legal-entity.types';

interface EntityCardProps {
  entity: LegalEntity;
  onEdit?: (entity: LegalEntity) => void;
  onDelete?: (entity: LegalEntity) => void;
  onView?: (entity: LegalEntity) => void;
}

const getEntityIcon = (type: LegalEntityType) => {
  switch (type) {
    case LegalEntityType.BANK:
      return '🏦';
    case LegalEntityType.EXCHANGER:
      return '🏛️';
    case LegalEntityType.PAYMENT_PROVIDER:
      return '💳';
    case LegalEntityType.CUSTODIAN:
      return '🔒';
    case LegalEntityType.FX_PROVIDER:
      return '💱';
    case LegalEntityType.BRANCH:
      return '🏢';
    default:
      return '🏪';
  }
};

const getCountryFlag = (countryCode: string) => {
  // Simple flag representation - could be enhanced with a flag library
  const flags: Record<string, string> = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦',
    'FR': '🇫🇷',
    'DE': '🇩🇪',
    'JP': '🇯🇵',
    'AU': '🇦🇺',
    'CH': '🇨🇭',
    'SG': '🇸🇬',
    'HK': '🇭🇰',
  };
  return flags[countryCode] || '🏳️';
};

export function EntityCard({ entity, onEdit, onDelete, onView }: EntityCardProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className={`${getThemeClass('components.legalEntity.card.base')} ${getThemeClass('components.legalEntity.card.hover')}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getEntityIcon(entity.entityType)}</span>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">{entity.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg">{getCountryFlag(entity.country)}</span>
                <span className="text-sm text-gray-600">{entity.country}</span>
                <Badge className={getThemeClass(`components.legalEntity.entityType.${entity.entityType}`)}>
                  {t(`entities.types.${entity.entityType}`)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(entity);
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(entity);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entity);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Capabilities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {entity.canHostAccounts && (
              <Badge className={getThemeClass('components.legalEntity.capabilities.enabled')}>
                {t('entities.capabilities.canHostAccounts')}
              </Badge>
            )}
            {entity.canHostWallets && (
              <Badge className={getThemeClass('components.legalEntity.capabilities.enabled')}>
                {t('entities.capabilities.canHostWallets')}
              </Badge>
            )}
            {entity.canHostFxNodes && (
              <Badge className={getThemeClass('components.legalEntity.capabilities.enabled')}>
                {t('entities.capabilities.canHostFxNodes')}
              </Badge>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-sm text-gray-600">
          {entity.regulatoryScope && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>{entity.regulatoryScope}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{entity.timezone}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{t('common.created')}: {formatDate(entity.createdAt)}</span>
          </div>

          {entity.parentEntityId && (
            <div className="text-xs text-blue-600 mt-2">
              {t('entities.types.branch')} of parent entity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
