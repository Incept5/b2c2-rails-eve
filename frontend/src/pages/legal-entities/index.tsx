
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { getThemeClass } from '../../lib/theme';
import { EntityCard } from './components/entity-card';
import { legalEntityService } from '../../lib/legal-entities/legal-entity.service';
import { 
  LegalEntity, 
  LegalEntityType, 
  EntityFilters, 
  PaginatedLegalEntitiesResponse 
} from '../../lib/legal-entities/legal-entity.types';

export default function LegalEntitiesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [entities, setEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EntityFilters>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    hasNext: false,
    totalCount: 0,
  });

  // Load entities
  const loadEntities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedLegalEntitiesResponse = await legalEntityService.getEntities(filters);
      
      setEntities(response.data);
      setPagination({
        hasNext: response.pagination.hasNext,
        totalCount: response.pagination.totalCount || 0,
      });
    } catch (err) {
      console.error('Failed to load entities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entities');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadEntities();
  }, [filters]);

  // Filter entities by search term locally
  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateEntity = () => {
    navigate('/entities/create');
  };

  const handleViewEntity = (entity: LegalEntity) => {
    navigate(`/entities/${entity.entityId}`);
  };

  const handleEditEntity = (entity: LegalEntity) => {
    navigate(`/entities/${entity.entityId}/edit`);
  };

  const handleDeleteEntity = async (entity: LegalEntity) => {
    if (!confirm(t('entities.deleteConfirm'))) {
      return;
    }

    try {
      await legalEntityService.deleteEntity(entity.entityId);
      await loadEntities(); // Reload the list
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to delete entity:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete entity');
    }
  };

  const handleFilterChange = (key: keyof EntityFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
    setSearchTerm('');
  };

  return (
    <>
      <Helmet>
        <title>{t('entities.title')} - {t('title')}</title>
      </Helmet>

      <div className={getThemeClass('components.legalEntity.page.container')}>
        {/* Header */}
        <div className={getThemeClass('components.legalEntity.page.header')}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">{t('entities.title')}</h1>
              <p className="text-gray-600 mt-1">{t('entities.description')}</p>
            </div>
            <Button 
              onClick={handleCreateEntity}
              className={getThemeClass('components.button.primary')}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('entities.create')}
            </Button>
          </div>
        </div>

        <div className={getThemeClass('components.legalEntity.page.content')}>
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Filter className="h-5 w-5 mr-2" />
                {t('entities.filters.search')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('entities.filters.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Country Filter */}
                <Select
                  value={filters.country || 'all'}
                  onValueChange={(value) => handleFilterChange('country', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('entities.filters.country')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('entities.filters.all')}</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                  </SelectContent>
                </Select>

                {/* Entity Type Filter */}
                <Select
                  value={filters.entityType || 'all'}
                  onValueChange={(value) => handleFilterChange('entityType', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('entities.filters.entityType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('entities.filters.all')}</SelectItem>
                    {Object.values(LegalEntityType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`entities.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button variant="outline" onClick={clearFilters}>
                  {t('entities.filters.clear')}
                </Button>
              </div>

              {/* Active Filters Display */}
              {(filters.country || filters.entityType || searchTerm) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {filters.country && (
                    <Badge variant="secondary">
                      Country: {filters.country}
                    </Badge>
                  )}
                  {filters.entityType && (
                    <Badge variant="secondary">
                      Type: {t(`entities.types.${filters.entityType}`)}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">{t('entities.loading')}</div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredEntities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-4">{t('entities.noEntities')}</div>
              <Button onClick={handleCreateEntity} className={getThemeClass('components.button.primary')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('entities.create')}
              </Button>
            </div>
          )}

          {/* Entities Grid */}
          {!loading && filteredEntities.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredEntities.map((entity) => (
                  <EntityCard
                    key={entity.entityId}
                    entity={entity}
                    onView={handleViewEntity}
                    onEdit={handleEditEntity}
                    onDelete={handleDeleteEntity}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalCount > (filters.limit || 10) && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{' '}
                    {Math.min((filters.page || 1) * (filters.limit || 10), pagination.totalCount)} of{' '}
                    {pagination.totalCount} entities
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange((filters.page || 1) - 1)}
                      disabled={!filters.page || filters.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
