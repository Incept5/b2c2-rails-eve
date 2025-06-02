
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { getThemeClass } from '../../lib/theme';
import { legalEntityService } from '../../lib/legal-entities/legal-entity.service';
import { LegalEntity, LegalEntityType } from '../../lib/legal-entities/legal-entity.types';

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

export default function LegalEntityDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [entity, setEntity] = useState<LegalEntity | null>(null);
  const [children, setChildren] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/entities');
      return;
    }

    const loadEntity = async () => {
      try {
        setLoading(true);
        setError(null);

        const [entityData, childrenData] = await Promise.all([
          legalEntityService.getEntity(id),
          legalEntityService.getEntityChildren(id)
        ]);

        setEntity(entityData);
        setChildren(childrenData);
      } catch (err) {
        console.error('Failed to load entity:', err);
        setError(err instanceof Error ? err.message : 'Failed to load entity');
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/entities/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!entity || !confirm(t('entities.deleteConfirm'))) {
      return;
    }

    try {
      await legalEntityService.deleteEntity(entity.entityId);
      navigate('/entities', {
        state: { message: t('entities.deleteSuccess') }
      });
    } catch (err) {
      console.error('Failed to delete entity:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete entity');
    }
  };

  const handleBack = () => {
    navigate('/entities');
  };

  if (loading) {
    return (
      <div className={getThemeClass('components.legalEntity.page.container')}>
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">{t('entities.loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <>
        <Helmet>
          <title>{t('common.error')} - {t('title')}</title>
        </Helmet>
        <div className={getThemeClass('components.legalEntity.page.container')}>
          <div className={getThemeClass('components.legalEntity.page.content')}>
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error || 'Entity not found'}
              </AlertDescription>
            </Alert>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {t('entities.title')}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{entity.name} - {t('title')}</title>
      </Helmet>

      <div className={getThemeClass('components.legalEntity.page.container')}>
        {/* Header */}
        <div className={getThemeClass('components.legalEntity.page.header')}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to {t('entities.title')}</span>
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>{t('entities.edit')}</span>
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>{t('entities.delete')}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className={getThemeClass('components.legalEntity.page.content')}>
          {/* Entity Details */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{getEntityIcon(entity.entityType)}</span>
                <div>
                  <CardTitle className="text-2xl text-blue-900">{entity.name}</CardTitle>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-2xl">{getCountryFlag(entity.country)}</span>
                    <span className="text-lg text-gray-600">{entity.country}</span>
                    <Badge className={getThemeClass(`components.legalEntity.entityType.${entity.entityType}`)}>
                      {t(`entities.types.${entity.entityType}`)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-blue-700 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Entity ID:</span>
                      <div className="font-mono text-sm">{entity.entityId}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Timezone:</span>
                      <div>{entity.timezone}</div>
                    </div>
                    {entity.regulatoryScope && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Regulatory Scope:</span>
                        <div>{entity.regulatoryScope}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-600">Created:</span>
                      <div>{new Date(entity.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                      <div>{new Date(entity.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <h3 className="text-lg font-medium text-blue-700 mb-4">Capabilities</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge className={entity.canHostAccounts ? 
                        getThemeClass('components.legalEntity.capabilities.enabled') : 
                        getThemeClass('components.legalEntity.capabilities.disabled')
                      }>
                        {entity.canHostAccounts ? '✓' : '✗'} {t('entities.capabilities.canHostAccounts')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={entity.canHostWallets ? 
                        getThemeClass('components.legalEntity.capabilities.enabled') : 
                        getThemeClass('components.legalEntity.capabilities.disabled')
                      }>
                        {entity.canHostWallets ? '✓' : '✗'} {t('entities.capabilities.canHostWallets')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={entity.canHostFxNodes ? 
                        getThemeClass('components.legalEntity.capabilities.enabled') : 
                        getThemeClass('components.legalEntity.capabilities.disabled')
                      }>
                        {entity.canHostFxNodes ? '✓' : '✗'} {t('entities.capabilities.canHostFxNodes')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Child Entities */}
          {children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Child Entities ({children.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {children.map((child) => (
                    <Card 
                      key={child.entityId} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/entities/${child.entityId}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getEntityIcon(child.entityType)}</span>
                          <div>
                            <div className="font-medium">{child.name}</div>
                            <div className="text-sm text-gray-600">
                              {getCountryFlag(child.country)} {child.country} • {t(`entities.types.${child.entityType}`)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
