
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { getThemeClass } from '../../lib/theme';
import { EntityForm } from './components/entity-form';
import { legalEntityService } from '../../lib/legal-entities/legal-entity.service';
import { CreateLegalEntityDto, LegalEntity } from '../../lib/legal-entities/legal-entity.types';

export default function CreateLegalEntityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing entities for parent selection
  useEffect(() => {
    const loadEntities = async () => {
      try {
        const response = await legalEntityService.getEntities({ limit: 100 }); // Get all for parent selection
        setEntities(response.data);
      } catch (err) {
        console.error('Failed to load entities for parent selection:', err);
        // Not critical for the create flow, so we don't show an error
      }
    };

    loadEntities();
  }, []);

  const handleSubmit = async (data: CreateLegalEntityDto) => {
    try {
      setLoading(true);
      setError(null);

      const newEntity = await legalEntityService.createEntity(data);
      
      // Navigate to the new entity's detail page
      navigate(`/entities/${newEntity.entityId}`, {
        state: { message: t('entities.createSuccess') }
      });
    } catch (err) {
      console.error('Failed to create entity:', err);
      setError(err instanceof Error ? err.message : 'Failed to create entity');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/entities');
  };

  return (
    <>
      <Helmet>
        <title>{t('entities.create')} - {t('title')}</title>
      </Helmet>

      <div className={getThemeClass('components.legalEntity.page.container')}>
        {/* Header */}
        <div className={getThemeClass('components.legalEntity.page.header')}>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to {t('entities.title')}</span>
            </Button>
          </div>
        </div>

        <div className={getThemeClass('components.legalEntity.page.content')}>
          {/* Error Display */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Create Form */}
          <EntityForm
            entities={entities}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
}
