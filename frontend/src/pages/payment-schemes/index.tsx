
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, AlertCircle, Clock, DollarSign, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { getThemeClass } from '../../lib/theme';
import { SchemeCard } from './components/scheme-card';
import { paymentSchemeService } from '../../lib/payment-schemes/payment-scheme.service';
import { 
  PaymentScheme, 
  PaymentSchemeType, 
  PaymentSchemeFilters, 
  PaginatedPaymentSchemesResponse,
  COMMON_CURRENCIES 
} from '../../lib/payment-schemes/payment-scheme.types';

export default function PaymentSchemesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State
  const [schemes, setSchemes] = useState<PaymentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentSchemeFilters>({
    page: 1,
    limit: 12,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  // Load schemes
  const loadSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedPaymentSchemesResponse = await paymentSchemeService.getSchemes(filters);
      
      setSchemes(response.data);
      setPagination({
        total: response.total,
        totalPages: response.total_pages,
      });
    } catch (err) {
      console.error('Failed to load payment schemes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load payment schemes');
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadSchemes();
  }, [filters]);

  // Filter schemes by search term locally
  const filteredSchemes = schemes.filter(scheme =>
    scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme.country_scope.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateScheme = () => {
    navigate('/payment-schemes/create');
  };

  const handleViewScheme = (scheme: PaymentScheme) => {
    navigate(`/payment-schemes/${scheme.scheme_id}`);
  };

  const handleEditScheme = (scheme: PaymentScheme) => {
    navigate(`/payment-schemes/${scheme.scheme_id}/edit`);
  };

  const handleDeleteScheme = async (scheme: PaymentScheme) => {
    if (!confirm(t('schemes.deleteConfirm'))) {
      return;
    }

    try {
      await paymentSchemeService.deleteScheme(scheme.scheme_id);
      await loadSchemes(); // Reload the list
    } catch (err) {
      console.error('Failed to delete scheme:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete scheme');
    }
  };

  const handleFilterChange = (key: keyof PaymentSchemeFilters, value: any) => {
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
    setFilters({ page: 1, limit: 12 });
    setSearchTerm('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.currency) count++;
    if (filters.country_scope) count++;
    if (filters.supports_fx !== undefined) count++;
    if (filters.operational_only !== undefined) count++;
    if (searchTerm) count++;
    return count;
  };

  return (
    <>
      <Helmet>
        <title>{t('schemes.title')} - {t('title')}</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
        {/* Header */}
        <div className="bg-white/90 shadow-sm border-b border-blue-100 px-6 py-4 mb-8">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-blue-900">{t('schemes.title')}</h1>
                <p className="text-gray-600 mt-1">{t('schemes.description')}</p>
              </div>
              <Button 
                onClick={handleCreateScheme}
                className={getThemeClass('components.button.primary')}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('schemes.create')}
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  {t('schemes.filters.title')}
                  {getActiveFilterCount() > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {getActiveFilterCount()} active
                    </Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  {t('schemes.filters.clear')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('schemes.filters.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Type Filter */}
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('schemes.filters.type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('schemes.filters.all')}</SelectItem>
                    {Object.values(PaymentSchemeType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`schemes.types.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Currency Filter */}
                <Select
                  value={filters.currency || 'all'}
                  onValueChange={(value) => handleFilterChange('currency', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('schemes.filters.currency')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('schemes.filters.all')}</SelectItem>
                    {COMMON_CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Country Scope Filter */}
                <Input
                  placeholder={t('schemes.filters.countryScope')}
                  value={filters.country_scope || ''}
                  onChange={(e) => handleFilterChange('country_scope', e.target.value || undefined)}
                />

                {/* Toggle Filters */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="supports-fx"
                      checked={filters.supports_fx || false}
                      onCheckedChange={(checked) => handleFilterChange('supports_fx', checked ? true : undefined)}
                    />
                    <Label htmlFor="supports-fx" className="text-sm">
                      {t('schemes.filters.supportsFx')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="operational-only"
                      checked={filters.operational_only || false}
                      onCheckedChange={(checked) => handleFilterChange('operational_only', checked ? true : undefined)}
                    />
                    <Label htmlFor="operational-only" className="text-sm">
                      {t('schemes.filters.operationalOnly')}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(filters.type || filters.currency || filters.country_scope || searchTerm) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {filters.type && (
                    <Badge variant="secondary">
                      Type: {t(`schemes.types.${filters.type}`)}
                    </Badge>
                  )}
                  {filters.currency && (
                    <Badge variant="secondary">
                      Currency: {filters.currency}
                    </Badge>
                  )}
                  {filters.country_scope && (
                    <Badge variant="secondary">
                      Scope: {filters.country_scope}
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
              <div className="text-lg text-gray-600">{t('schemes.loading')}</div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <div className="text-lg text-gray-600 mb-4">{t('schemes.noSchemes')}</div>
              <Button onClick={handleCreateScheme} className={getThemeClass('components.button.primary')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('schemes.create')}
              </Button>
            </div>
          )}

          {/* Schemes Grid */}
          {!loading && filteredSchemes.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredSchemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.scheme_id}
                    scheme={scheme}
                    onView={handleViewScheme}
                    onEdit={handleEditScheme}
                    onDelete={handleDeleteScheme}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {((filters.page || 1) - 1) * (filters.limit || 12) + 1} to{' '}
                    {Math.min((filters.page || 1) * (filters.limit || 12), pagination.total)} of{' '}
                    {pagination.total} schemes
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange((filters.page || 1) - 1)}
                      disabled={!filters.page || filters.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm text-gray-600">
                      Page {filters.page || 1} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                      disabled={(filters.page || 1) >= pagination.totalPages}
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
