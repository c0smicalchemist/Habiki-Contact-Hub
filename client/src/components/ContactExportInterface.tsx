import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  File, 
  Eye, 
  Filter, 
  Settings,
  Calendar,
  Users,
  Hash,
  Globe,
  Building,
  Video,
  Music
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EXPORT_FORMATS = [
  { 
    value: 'csv', 
    label: 'CSV (Excel Compatible)', 
    icon: FileSpreadsheet, 
    description: 'Comma-separated values, perfect for Excel and Google Sheets',
    color: 'text-green-600 bg-green-50'
  },
  { 
    value: 'json', 
    label: 'JSON', 
    icon: FileJson, 
    description: 'JavaScript Object Notation, ideal for developers and APIs',
    color: 'text-blue-600 bg-blue-50'
  },
  { 
    value: 'excel', 
    label: 'Excel (.xlsx)', 
    icon: FileSpreadsheet, 
    description: 'Microsoft Excel format with formatting and multiple sheets',
    color: 'text-purple-600 bg-purple-50'
  },
  { 
    value: 'pdf', 
    label: 'PDF Report', 
    icon: FileText, 
    description: 'Professional PDF report with analytics and charts',
    color: 'text-red-600 bg-red-50'
  }
];

const AVAILABLE_FIELDS = [
  { key: 'username', label: 'Username', type: 'text', category: 'Basic Info' },
  { key: 'displayName', label: 'Display Name', type: 'text', category: 'Basic Info' },
  { key: 'platform', label: 'Platform', type: 'text', category: 'Basic Info' },
  { key: 'profileUrl', label: 'Profile URL', type: 'url', category: 'Basic Info' },
  { key: 'avatarUrl', label: 'Avatar URL', type: 'url', category: 'Basic Info' },
  { key: 'bio', label: 'Bio', type: 'text', category: 'Basic Info' },
  { key: 'email', label: 'Email', type: 'email', category: 'Contact Info' },
  { key: 'phone', label: 'Phone', type: 'text', category: 'Contact Info' },
  { key: 'website', label: 'Website', type: 'url', category: 'Contact Info' },
  { key: 'location', label: 'Location', type: 'text', category: 'Demographics' },
  { key: 'followerCount', label: 'Followers', type: 'number', category: 'Metrics' },
  { key: 'followingCount', label: 'Following', type: 'number', category: 'Metrics' },
  { key: 'postCount', label: 'Posts', type: 'number', category: 'Metrics' },
  { key: 'isVerified', label: 'Verified', type: 'boolean', category: 'Status' },
  { key: 'isBusiness', label: 'Business Account', type: 'boolean', category: 'Status' },
  { key: 'category', label: 'Category', type: 'text', category: 'Classification' },
  { key: 'tags', label: 'Tags', type: 'array', category: 'Classification' },
  { key: 'engagementRate', label: 'Engagement Rate', type: 'percentage', category: 'Metrics' },
  { key: 'scrapingSource', label: 'Scraping Source', type: 'text', category: 'Metadata' },
  { key: 'scrapingQuery', label: 'Scraping Query', type: 'text', category: 'Metadata' },
  { key: 'scrapedAt', label: 'Scraped Date', type: 'date', category: 'Metadata' },
  { key: 'createdAt', label: 'Created Date', type: 'date', category: 'Metadata' },
  { key: 'updatedAt', label: 'Updated Date', type: 'date', category: 'Metadata' }
];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: Users, color: 'from-purple-500 to-pink-500' },
  { value: 'tiktok', label: 'TikTok', icon: Music, color: 'from-black to-gray-800' },
  { value: 'twitter', label: 'Twitter/X', icon: Hash, color: 'from-blue-400 to-blue-600' },
  { value: 'facebook', label: 'Facebook', icon: Globe, color: 'from-blue-600 to-blue-800' },
  { value: 'linkedin', label: 'LinkedIn', icon: Building, color: 'from-blue-500 to-blue-700' },
  { value: 'youtube', label: 'YouTube', icon: Video, color: 'from-red-500 to-red-700' }
];

interface ExportFilters {
  platforms: string[];
  tags: string[];
  minFollowers: string;
  maxFollowers: string;
  isVerified: boolean;
  isBusiness: boolean;
  location: string;
  category: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface ExportOptions {
  format: string;
  fields: string[];
  filters: ExportFilters;
  includeAnalytics: boolean;
  customHeaders: Record<string, string>;
}

export default function ContactExportInterface() {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['username', 'displayName', 'platform', 'profileUrl', 'followerCount', 'email']);
  const [filters, setFilters] = useState<ExportFilters>({
    platforms: [],
    tags: [],
    minFollowers: '',
    maxFollowers: '',
    isVerified: false,
    isBusiness: false,
    location: '',
    category: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [includeAnalytics, setIncludeAnalytics] = useState(false);
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('format');
  const [totalContacts, setTotalContacts] = useState(0);
  const [filteredContacts, setFilteredContacts] = useState(0);

  useEffect(() => {
    // Fetch total contacts count on component mount
    fetchContactStats();
  }, []);

  const fetchContactStats = async () => {
    try {
      const response = await fetch('/api/scraping/stats', {
        headers: {
          'X-API-Key': 'your-api-key' // This should come from your auth system
        }
      });
      const data = await response.json();
      if (data.success) {
        setTotalContacts(data.data.totalContacts);
        setFilteredContacts(data.data.totalContacts); // Will be updated when filters change
      }
    } catch (error) {
      console.error('Failed to fetch contact stats:', error);
    }
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handlePlatformToggle = (platform: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSelectAllFields = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(field => field.key));
  };

  const handleSelectBasicFields = () => {
    setSelectedFields(['username', 'displayName', 'platform', 'profileUrl', 'email', 'phone', 'location']);
  };

  const handleSelectContactFields = () => {
    setSelectedFields(['username', 'displayName', 'platform', 'email', 'phone', 'website', 'location']);
  };

  const handlePreview = async () => {
    if (!selectedFormat || selectedFields.length === 0) {
      alert('Please select a format and at least one field');
      return;
    }

    setIsExporting(true);
    try {
      const exportOptions = {
        format: selectedFormat,
        fields: selectedFields,
        filters: {
          platforms: filters.platforms,
          tags: filters.tags,
          minFollowers: filters.minFollowers ? parseInt(filters.minFollowers) : undefined,
          maxFollowers: filters.maxFollowers ? parseInt(filters.maxFollowers) : undefined,
          isVerified: filters.isVerified,
          isBusiness: filters.isBusiness,
          location: filters.location,
          category: filters.category,
          dateRange: filters.dateRange.start && filters.dateRange.end ? {
            start: new Date(filters.dateRange.start),
            end: new Date(filters.dateRange.end)
          } : undefined
        },
        includeAnalytics,
        customHeaders
      };

      const response = await fetch('/api/scraping/export/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-api-key' // This should come from your auth system
        },
        body: JSON.stringify(exportOptions)
      });

      const result = await response.json();
      if (result.success) {
        setPreviewData(result.data);
      } else {
        alert('Preview generation failed: ' + result.error);
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Preview generation failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = async () => {
    if (!selectedFormat || selectedFields.length === 0) {
      alert('Please select a format and at least one field');
      return;
    }

    setIsExporting(true);
    try {
      const exportOptions = {
        format: selectedFormat,
        fields: selectedFields,
        filters: {
          platforms: filters.platforms,
          tags: filters.tags,
          minFollowers: filters.minFollowers ? parseInt(filters.minFollowers) : undefined,
          maxFollowers: filters.maxFollowers ? parseInt(filters.maxFollowers) : undefined,
          isVerified: filters.isVerified,
          isBusiness: filters.isBusiness,
          location: filters.location,
          category: filters.category,
          dateRange: filters.dateRange.start && filters.dateRange.end ? {
            start: new Date(filters.dateRange.start),
            end: new Date(filters.dateRange.end)
          } : undefined
        },
        includeAnalytics,
        customHeaders
      };

      const response = await fetch('/api/scraping/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-api-key' // This should come from your auth system
        },
        body: JSON.stringify(exportOptions)
      });

      if (response.ok) {
        // Download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('X-Filename') || `contacts_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert('Export failed: ' + error.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderFormatCard = (format: any) => {
    const isSelected = selectedFormat === format.value;
    const Icon = format.icon;
    
    return (
      <div
        key={format.value}
        onClick={() => setSelectedFormat(format.value)}
        className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 shadow-lg transform scale-105' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div className={`absolute inset-0 ${format.color} opacity-10`} />
        <div className="relative p-4">
          <div className="flex items-center space-x-3">
            <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
            <div>
              <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                {format.label}
              </h3>
              <p className="text-sm text-gray-500">{format.description}</p>
            </div>
          </div>
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPlatformCard = (platform: any) => {
    const isSelected = filters.platforms.includes(platform.value);
    const Icon = platform.icon;
    
    return (
      <div
        key={platform.value}
        onClick={() => handlePlatformToggle(platform.value)}
        className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 shadow-lg transform scale-105' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${platform.color} opacity-10`} />
        <div className="relative p-3">
          <div className="flex items-center space-x-2">
            <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
            <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
              {platform.label}
            </span>
          </div>
          {isSelected && (
            <div className="absolute top-1 right-1">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const groupedFields = AVAILABLE_FIELDS.reduce((groups, field) => {
    if (!groups[field.category]) {
      groups[field.category] = [];
    }
    groups[field.category].push(field);
    return groups;
  }, {} as Record<string, typeof AVAILABLE_FIELDS>);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Export Hub</h1>
          <p className="text-gray-600">Export your scraped contacts in various formats with advanced filtering and customization</p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Total Contacts: <strong>{totalContacts.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Filtered: <strong>{filteredContacts.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            {['format', 'fields', 'filters', 'export'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  activeTab === step 
                    ? 'bg-blue-600 text-white' 
                    : index < ['format', 'fields', 'filters', 'export'].indexOf(activeTab)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  activeTab === step 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-500'
                }`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {index < 3 && <div className="ml-4 w-8 h-px bg-gray-300" />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <Card className={activeTab === 'format' ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <File className="w-5 h-5" />
                  <span>Export Format</span>
                </CardTitle>
                <CardDescription>Choose your preferred export format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXPORT_FORMATS.map(renderFormatCard)}
                </div>
              </CardContent>
            </Card>

            {/* Fields Selection */}
            <Card className={activeTab === 'fields' ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <CardTitle>Fields Selection</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectBasicFields}
                    >
                      Basic
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectContactFields}
                    >
                      Contact
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllFields}
                    >
                      All Fields
                    </Button>
                  </div>
                </div>
                <CardDescription>Select the fields you want to export ({selectedFields.length} selected)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedFields).map(([category, fields]) => (
                    <div key={category}>
                      <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {fields.map(field => (
                          <div key={field.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={field.key}
                              checked={selectedFields.includes(field.key)}
                              onCheckedChange={() => handleFieldToggle(field.key)}
                            />
                            <Label htmlFor={field.key} className="text-sm font-normal">
                              {field.label}
                            </Label>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className={activeTab === 'filters' ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <CardTitle>Export Filters</CardTitle>
                </div>
                <CardDescription>Apply filters to export only the contacts you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform Filter */}
                <div>
                  <Label className="mb-2 block">Platforms</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PLATFORMS.map(renderPlatformCard)}
                  </div>
                </div>

                {/* Follower Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minFollowers">Minimum Followers</Label>
                    <Input
                      id="minFollowers"
                      type="number"
                      placeholder="0"
                      value={filters.minFollowers}
                      onChange={(e) => setFilters(prev => ({ ...prev, minFollowers: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxFollowers">Maximum Followers</Label>
                    <Input
                      id="maxFollowers"
                      type="number"
                      placeholder="∞"
                      value={filters.maxFollowers}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxFollowers: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Location and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="New York, London, etc."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="Fitness, Business, etc."
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Status Filters */}
                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isVerified"
                      checked={filters.isVerified}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isVerified: checked as boolean }))}
                    />
                    <Label htmlFor="isVerified">Verified accounts only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBusiness"
                      checked={filters.isBusiness}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isBusiness: checked as boolean }))}
                    />
                    <Label htmlFor="isBusiness">Business accounts only</Label>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <Label className="mb-2 block">Scraped Date Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Start date</p>
                    </div>
                    <div>
                      <Input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">End date</p>
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAnalytics"
                    checked={includeAnalytics}
                    onCheckedChange={(checked) => setIncludeAnalytics(checked as boolean)}
                  />
                  <Label htmlFor="includeAnalytics">Include analytics and insights</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Summary */}
            <Card className={activeTab === 'export' ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <CardTitle>Export Summary</CardTitle>
                </div>
                <CardDescription>Review your export configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{EXPORT_FORMATS.find(f => f.value === selectedFormat)?.label || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fields:</span>
                    <span className="font-medium">{selectedFields.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platforms:</span>
                    <span className="font-medium">{filters.platforms.length || 'All'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Analytics:</span>
                    <span className="font-medium">{includeAnalytics ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button 
                    onClick={handlePreview}
                    disabled={!selectedFormat || selectedFields.length === 0 || isExporting}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Export
                  </Button>
                  <Button 
                    onClick={handleExport}
                    disabled={!selectedFormat || selectedFields.length === 0 || isExporting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export Contacts
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {previewData && (
              <Card>
                <CardHeader>
                  <CardTitle>Export Preview</CardTitle>
                  <CardDescription>First 10 records of your export</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Records:</span>
                      <Badge variant="outline">{previewData.recordCount.toLocaleString()}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Preview Records:</span>
                      <Badge variant="outline">{previewData.previewCount}</Badge>
                    </div>
                    <div className="pt-3 border-t">
                      <Label className="text-xs text-gray-500">Sample Data:</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-40 overflow-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {typeof previewData.data === 'string' 
                            ? previewData.data.substring(0, 500) + (previewData.data.length > 500 ? '...' : '')
                            : JSON.stringify(previewData.data, null, 2).substring(0, 500) + '...'
                          }
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Export Templates</CardTitle>
                <CardDescription>Pre-configured export templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedFormat('csv');
                    handleSelectContactFields();
                    setFilters(prev => ({ ...prev, platforms: [] }));
                  }}
                >
                  Basic Contact List (CSV)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedFormat('excel');
                    setSelectedFields(['username', 'displayName', 'platform', 'followerCount', 'engagementRate', 'category']);
                    setIncludeAnalytics(true);
                  }}
                >
                  Influencer Report (Excel)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedFormat('pdf');
                    handleSelectAllFields();
                    setIncludeAnalytics(true);
                  }}
                >
                  Complete Report (PDF)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}