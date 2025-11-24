import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  Search, 
  Users, 
  Target,
  Hash,
  MapPin,
  Award,
  Building,
  TrendingUp,
  Calendar,
  X,
  Plus,
  Save,
  RefreshCw
} from 'lucide-react';

interface FilterCriteria {
  searchTerm?: string;
  platforms?: string[];
  categories?: string[];
  tags?: string[];
  location?: string[];
  followerRange?: [number, number];
  engagementRange?: [number, number];
  verifiedOnly?: boolean;
  businessOnly?: boolean;
  hasEmail?: boolean;
  hasPhone?: boolean;
  validationStatus?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  excludeKeywords?: string[];
  includeKeywords?: string[];
}

interface FilterPreset {
  id: string;
  name: string;
  criteria: FilterCriteria;
  description?: string;
  createdAt: string;
}

interface ContactFilteringInterfaceProps {
  onFilterChange: (criteria: FilterCriteria) => void;
  onSavePreset?: (name: string, criteria: FilterCriteria) => void;
  onLoadPreset?: (presetId: string) => void;
  initialCriteria?: FilterCriteria;
  presets?: FilterPreset[];
  showPresets?: boolean;
  className?: string;
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-gradient-to-br from-black to-red-500' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: 'bg-gradient-to-br from-blue-600 to-blue-800' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-gradient-to-br from-blue-700 to-blue-900' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-gradient-to-br from-red-500 to-red-700' }
];

const CATEGORIES = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 'Technology', 'Business', 
  'Art', 'Music', 'Sports', 'Gaming', 'Lifestyle', 'Education', 'Health',
  'Finance', 'Real Estate', 'Automotive', 'Photography', 'Entertainment'
];

const VALIDATION_STATUSES = [
  { id: 'valid', name: 'Valid', color: 'bg-green-500' },
  { id: 'invalid', name: 'Invalid', color: 'bg-red-500' },
  { id: 'pending', name: 'Pending', color: 'bg-yellow-500' },
  { id: 'unknown', name: 'Unknown', color: 'bg-gray-500' }
];

const SAMPLE_TAGS = [
  'influencer', 'creator', 'business', 'entrepreneur', 'artist', 'musician',
  'fitness', 'travel', 'foodie', 'tech', 'fashion', 'beauty', 'lifestyle',
  'health', 'wellness', 'parent', 'student', 'professional', 'startup'
];

const SAMPLE_LOCATIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'South Korea', 'Brazil', 'India', 'Mexico', 'Spain', 'Italy',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria'
];

export default function ContactFilteringInterface({
  onFilterChange,
  onSavePreset,
  onLoadPreset,
  initialCriteria = {},
  presets = [],
  showPresets = true,
  className = ""
}: ContactFilteringInterfaceProps) {
  const [criteria, setCriteria] = useState<FilterCriteria>(initialCriteria);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    // Debounced filter change
    const timer = setTimeout(() => {
      onFilterChange(criteria);
    }, 300);

    return () => clearTimeout(timer);
  }, [criteria, onFilterChange]);

  const updateCriteria = (updates: Partial<FilterCriteria>) => {
    setCriteria(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayValue = (key: keyof FilterCriteria, value: string) => {
    const currentArray = (criteria[key] as string[]) || [];
    const updated = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateCriteria({ [key]: updated });
  };

  const addKeyword = (type: 'includeKeywords' | 'excludeKeywords', keyword: string) => {
    if (!keyword.trim()) return;
    const current = criteria[type] || [];
    if (!current.includes(keyword.trim())) {
      updateCriteria({ [type]: [...current, keyword.trim()] });
    }
  };

  const removeKeyword = (type: 'includeKeywords' | 'excludeKeywords', keyword: string) => {
    const current = criteria[type] || [];
    updateCriteria({ [type]: current.filter(k => k !== keyword) });
  };

  const clearAllFilters = () => {
    setCriteria({});
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    onSavePreset?.(presetName, criteria);
    setPresetName('');
    setShowSaveDialog(false);
  };

  const loadPreset = (preset: FilterPreset) => {
    setCriteria(preset.criteria);
    onLoadPreset?.(preset.id);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (criteria.searchTerm) count++;
    if (criteria.platforms?.length) count++;
    if (criteria.categories?.length) count++;
    if (criteria.tags?.length) count++;
    if (criteria.location?.length) count++;
    if (criteria.followerRange && (criteria.followerRange[0] > 0 || criteria.followerRange[1] < 10000000)) count++;
    if (criteria.engagementRange && (criteria.engagementRange[0] > 0 || criteria.engagementRange[1] < 100)) count++;
    if (criteria.verifiedOnly) count++;
    if (criteria.businessOnly) count++;
    if (criteria.hasEmail) count++;
    if (criteria.hasPhone) count++;
    if (criteria.validationStatus?.length) count++;
    if (criteria.dateRange?.from || criteria.dateRange?.to) count++;
    if (criteria.excludeKeywords?.length) count++;
    if (criteria.includeKeywords?.length) count++;
    return count;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Contact Filters
            </CardTitle>
            <CardDescription>
              Filter contacts by platform, engagement, location, and more
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {getActiveFilterCount()} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={getActiveFilterCount() === 0}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Presets Section */}
        {showPresets && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Filter Presets</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Current
                </Button>
              </div>
              
              {presets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => loadPreset(preset)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Basic Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Contacts</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by name, username, bio..."
              value={criteria.searchTerm || ''}
              onChange={(e) => updateCriteria({ searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-3">
          <Label>Platforms</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PLATFORMS.map((platform) => (
              <Button
                key={platform.id}
                variant={criteria.platforms?.includes(platform.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleArrayValue('platforms', platform.id)}
                className="justify-start"
              >
                <span className="mr-2">{platform.icon}</span>
                {platform.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label>Categories</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={criteria.categories?.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleArrayValue('categories', category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Follower Range */}
        <div className="space-y-3">
          <Label>Follower Range</Label>
          <div className="space-y-2">
            <Slider
              value={criteria.followerRange || [0, 10000000]}
              onValueChange={(value) => updateCriteria({ followerRange: value as [number, number] })}
              max={10000000}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{(criteria.followerRange?.[0] || 0).toLocaleString()}</span>
              <span>{(criteria.followerRange?.[1] || 10000000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Engagement Range */}
        <div className="space-y-3">
          <Label>Engagement Rate (%)</Label>
          <div className="space-y-2">
            <Slider
              value={criteria.engagementRange || [0, 100]}
              onValueChange={(value) => updateCriteria({ engagementRange: value as [number, number] })}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{criteria.engagementRange?.[0] || 0}%</span>
              <span>{criteria.engagementRange?.[1] || 100}%</span>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full"
        >
          <Target className="w-4 h-4 mr-2" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            {/* Account Type */}
            <div className="space-y-3">
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified-only"
                    checked={criteria.verifiedOnly || false}
                    onCheckedChange={(checked) => updateCriteria({ verifiedOnly: checked as boolean })}
                  />
                  <Label htmlFor="verified-only" className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Verified Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="business-only"
                    checked={criteria.businessOnly || false}
                    onCheckedChange={(checked) => updateCriteria({ businessOnly: checked as boolean })}
                  />
                  <Label htmlFor="business-only" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Business Only
                  </Label>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <Label>Contact Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-email"
                    checked={criteria.hasEmail || false}
                    onCheckedChange={(checked) => updateCriteria({ hasEmail: checked as boolean })}
                  />
                  <Label htmlFor="has-email">Has Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-phone"
                    checked={criteria.hasPhone || false}
                    onCheckedChange={(checked) => updateCriteria({ hasPhone: checked as boolean })}
                  />
                  <Label htmlFor="has-phone">Has Phone</Label>
                </div>
              </div>
            </div>

            {/* Validation Status */}
            <div className="space-y-3">
              <Label>Validation Status</Label>
              <div className="flex flex-wrap gap-2">
                {VALIDATION_STATUSES.map((status) => (
                  <Button
                    key={status.id}
                    variant={criteria.validationStatus?.includes(status.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayValue('validationStatus', status.id)}
                    className="text-xs"
                  >
                    <div className={`w-2 h-2 rounded-full ${status.color} mr-2`} />
                    {status.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_LOCATIONS.map((location) => (
                  <Badge
                    key={location}
                    variant={criteria.location?.includes(location) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayValue('location', location)}
                  >
                    {location}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-3">
              <Label>Keywords</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Include Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add keyword..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addKeyword('includeKeywords', (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        addKeyword('includeKeywords', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {criteria.includeKeywords?.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="animate-fadeIn">
                        {keyword}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeKeyword('includeKeywords', keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Exclude Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add excluded keyword..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addKeyword('excludeKeywords', (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        addKeyword('excludeKeywords', input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {criteria.excludeKeywords?.map((keyword) => (
                      <Badge key={keyword} variant="destructive" className="animate-fadeIn">
                        {keyword}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeKeyword('excludeKeywords', keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scraped Date Range
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">From</Label>
                  <Input
                    type="date"
                    value={criteria.dateRange?.from || ''}
                    onChange={(e) => updateCriteria({
                      dateRange: { ...criteria.dateRange, from: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label className="text-sm">To</Label>
                  <Input
                    type="date"
                    value={criteria.dateRange?.to || ''}
                  onChange={(e) => updateCriteria({
                      dateRange: { ...criteria.dateRange, to: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Preset Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Save Filter Preset</CardTitle>
                <CardDescription>
                  Save your current filter settings as a preset for quick access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && savePreset()}
                />
                <div className="flex gap-2">
                  <Button onClick={savePreset} className="flex-1">
                    Save Preset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}