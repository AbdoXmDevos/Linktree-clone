"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  TextInput, 
  MultiSelect, 
  Select, 
  Group, 
  Stack, 
  Button, 
  ActionIcon, 
  Collapse,
  Badge,
  Box,
  Text,
  Card,
  Tooltip,
  Divider
} from "@mantine/core";
import { 
  IconSearch, 
  IconFilter, 
  IconX, 
  IconSortAscending, 
  IconSortDescending,
  IconBookmark,
  IconCalendar,
  IconTag,
  IconCategory,
  IconClearAll,
  IconStar
} from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { useDebouncedValue } from "@mantine/hooks";
import type { Link } from "../../../types/dashboard";
import type { SearchFilterData } from "../../../types/validation";
import { colors, shadows, borderRadius, animation } from "../../styles/design-tokens";
import { AnimatedCard, FadeIn, SlideIn, ScaleIn } from "../animations/AnimatedComponents";

interface SearchAndFilterProps {
  links: Link[];
  onFilteredLinksChange: (filteredLinks: Link[]) => void;
  onSearchChange?: (query: string) => void;
  savedSearches?: SavedSearch[];
  onSaveSearch?: (search: SavedSearch) => void;
  onDeleteSavedSearch?: (searchId: string) => void;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilterData;
  createdAt: Date;
}

export function SearchAndFilter({
  links,
  onFilteredLinksChange,
  onSearchChange,
  savedSearches = [],
  onSaveSearch,
  onDeleteSavedSearch
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SearchFilterData['sortBy']>('order_index');
  const [sortOrder, setSortOrder] = useState<SearchFilterData['sortOrder']>('asc');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Extract unique categories and tags from links
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    links.forEach(link => {
      if (link.category) {
        categories.add(link.category);
      }
    });
    return Array.from(categories).map(cat => ({ value: cat, label: cat }));
  }, [links]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    links.forEach(link => {
      if (link.tags && Array.isArray(link.tags)) {
        link.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).map(tag => ({ value: tag, label: tag }));
  }, [links]);

  // Sort options
  const sortOptions = [
    { value: 'order_index', label: 'Custom Order' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'clicks', label: 'Popularity' },
    { value: 'last_clicked', label: 'Recently Clicked' },
  ];

  // Filter and sort links
  const filteredLinks = useMemo(() => {
    let filtered = [...links];

    // Text search
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim();
      filtered = filtered.filter(link => 
        link.title.toLowerCase().includes(query) ||
        (link.description && link.description.toLowerCase().includes(query)) ||
        link.url.toLowerCase().includes(query) ||
        (link.category && link.category.toLowerCase().includes(query)) ||
        (link.tags && link.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(link => 
        link.category && selectedCategories.includes(link.category)
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(link => 
        link.tags && link.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(link => link.is_featured);
    }

    // Date range filter
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(link => {
        const linkDate = new Date(link.created_at);
        return linkDate >= dateRange[0]! && linkDate <= dateRange[1]!;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'order_index':
          aValue = a.order_index || 0;
          bValue = b.order_index || 0;
          break;
        case 'clicks':
          // Assuming we have analytics data in the future
          aValue = 0; // (a as any).analytics?.clicks || 0;
          bValue = 0; // (b as any).analytics?.clicks || 0;
          break;
        case 'last_clicked':
          // Assuming we have analytics data in the future
          aValue = new Date(0); // (a as any).analytics?.lastClicked || new Date(0);
          bValue = new Date(0); // (b as any).analytics?.lastClicked || new Date(0);
          break;
        default:
          aValue = a.order_index || 0;
          bValue = b.order_index || 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [links, debouncedQuery, selectedCategories, selectedTags, sortBy, sortOrder, showFeaturedOnly, dateRange]);

  // Update parent component with filtered links
  useEffect(() => {
    onFilteredLinksChange(filteredLinks);
  }, [filteredLinks, onFilteredLinksChange]);

  // Update search query callback
  useEffect(() => {
    onSearchChange?.(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (debouncedQuery.trim()) count++;
    if (selectedCategories.length > 0) count++;
    if (selectedTags.length > 0) count++;
    if (showFeaturedOnly) count++;
    if (dateRange[0] && dateRange[1]) count++;
    if (sortBy !== 'order_index' || sortOrder !== 'asc') count++;
    setActiveFiltersCount(count);
  }, [debouncedQuery, selectedCategories, selectedTags, showFeaturedOnly, dateRange, sortBy, sortOrder]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortBy('order_index');
    setSortOrder('asc');
    setShowFeaturedOnly(false);
    setDateRange([null, null]);
  };

  const handleSaveCurrentSearch = () => {
    if (!onSaveSearch) return;

    const searchName = prompt("Enter a name for this search:");
    if (!searchName) return;

    const search: SavedSearch = {
      id: `search-${Date.now()}`,
      name: searchName,
      filters: {
        query: debouncedQuery,
        categories: selectedCategories,
        tags: selectedTags,
        sortBy,
        sortOrder,
        featured: showFeaturedOnly,
        dateRange: dateRange[0] && dateRange[1] ? {
          from: dateRange[0],
          to: dateRange[1]
        } : undefined
      },
      createdAt: new Date()
    };

    onSaveSearch(search);
  };

  const applySavedSearch = (search: SavedSearch) => {
    const { filters } = search;
    setSearchQuery(filters.query || "");
    setSelectedCategories(filters.categories || []);
    setSelectedTags(filters.tags || []);
    setSortBy(filters.sortBy || 'order_index');
    setSortOrder(filters.sortOrder || 'asc');
    setShowFeaturedOnly(filters.featured || false);
    setDateRange(filters.dateRange ? [filters.dateRange.from, filters.dateRange.to] : [null, null]);
  };

  return (
    <FadeIn>
      <AnimatedCard
        enableHover={false}
        style={{
          background: colors.gradients.glass,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: shadows.md,
          borderRadius: borderRadius.xl,
          padding: "24px",
        }}
      >
        <Stack gap="md">
        {/* Search Input */}
        <TextInput
          placeholder="Search links by title, description, URL, or tags..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchQuery && (
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => setSearchQuery("")}
                size="sm"
              >
                <IconX size={14} />
              </ActionIcon>
            )
          }
          size="md"
          radius="lg"
          style={{
            transition: `all ${animation.duration.normal}`,
          }}
          styles={{
            input: {
              backgroundColor: colors.neutral[50],
              border: `1px solid ${colors.neutral[200]}`,
              '&:focus': {
                borderColor: colors.primary[500],
                boxShadow: `0 0 0 2px ${colors.primary[200]}`,
                transform: 'translateY(-1px)',
              }
            }
          }}
        />

        {/* Filter Toggle and Active Filters */}
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Button
              variant={filtersExpanded ? "filled" : "light"}
              color={filtersExpanded ? "primary" : "gray"}
              leftSection={<IconFilter size={16} />}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              size="sm"
              radius="lg"
            >
              Filters
              {activeFiltersCount > 0 && (
                <Badge size="xs" color="primary" ml="xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconClearAll size={16} />}
                onClick={clearAllFilters}
                size="sm"
                radius="lg"
              >
                Clear All
              </Button>
            )}
          </Group>

          {/* Results Count */}
          <Text size="sm" c="dimmed">
            {filteredLinks.length} of {links.length} links
          </Text>
        </Group>

        {/* Expanded Filters */}
        <Collapse in={filtersExpanded}>
          <SlideIn direction="down">
            <Stack gap="md">
            <Divider />

            {/* Quick Filters Row */}
            <Group gap="sm">
              <Button
                variant={showFeaturedOnly ? "filled" : "light"}
                color={showFeaturedOnly ? "yellow" : "gray"}
                leftSection={<IconStar size={16} />}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                size="sm"
                radius="lg"
              >
                Featured Only
              </Button>

              <Tooltip label="Sort Direction">
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  size="lg"
                  radius="lg"
                >
                  {sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* Filter Controls */}
            <Group grow align="flex-start">
              {/* Categories Filter */}
              <MultiSelect
                label="Categories"
                placeholder="Select categories"
                data={availableCategories}
                value={selectedCategories}
                onChange={setSelectedCategories}
                leftSection={<IconCategory size={16} />}
                clearable
                searchable
                size="sm"
                radius="lg"
                maxDropdownHeight={200}
              />

              {/* Tags Filter */}
              <MultiSelect
                label="Tags"
                placeholder="Select tags"
                data={availableTags}
                value={selectedTags}
                onChange={setSelectedTags}
                leftSection={<IconTag size={16} />}
                clearable
                searchable
                size="sm"
                radius="lg"
                maxDropdownHeight={200}
              />
            </Group>

            <Group grow align="flex-start">
              {/* Sort By */}
              <Select
                label="Sort By"
                data={sortOptions}
                value={sortBy}
                onChange={(value) => setSortBy(value as SearchFilterData['sortBy'])}
                size="sm"
                radius="lg"
              />

              {/* Date Range */}
              <DatePickerInput
                type="range"
                label="Date Range"
                placeholder="Select date range"
                value={dateRange}
                onChange={setDateRange}
                leftSection={<IconCalendar size={16} />}
                clearable
                size="sm"
                radius="lg"
              />
            </Group>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Group justify="space-between" mb="sm">
                    <Text size="sm" fw={500}>Saved Searches</Text>
                    {onSaveSearch && activeFiltersCount > 0 && (
                      <Button
                        variant="subtle"
                        color="primary"
                        leftSection={<IconBookmark size={14} />}
                        onClick={handleSaveCurrentSearch}
                        size="xs"
                      >
                        Save Current
                      </Button>
                    )}
                  </Group>
                  <Group gap="xs">
                    {savedSearches.map((search) => (
                      <Badge
                        key={search.id}
                        variant="light"
                        color="primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => applySavedSearch(search)}
                        rightSection={
                          onDeleteSavedSearch && (
                            <ActionIcon
                              size="xs"
                              color="red"
                              variant="transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSavedSearch(search.id);
                              }}
                            >
                              <IconX size={10} />
                            </ActionIcon>
                          )
                        }
                      >
                        {search.name}
                      </Badge>
                    ))}
                  </Group>
                </Box>
              </>
            )}
            </Stack>
          </SlideIn>
        </Collapse>
        </Stack>
      </AnimatedCard>
    </FadeIn>
  );
}