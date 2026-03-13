import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import eventsService from '../services/events';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

function EventList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Parse query params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'start_datetime';

  // Local filter state
  const [searchInput, setSearchInput] = useState(search);
  const [locationInput, setLocationInput] = useState(location);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', { page, search, location, minPrice, maxPrice, sortBy }],
    queryFn: () =>
      eventsService.getEvents({
        page,
        limit: 12,
        search: search || undefined,
        location: location || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sortBy,
        sortOrder: sortBy === 'price' ? 'asc' : 'asc',
      }),
  });

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when filters change
    if (!updates.page) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({
      search: searchInput,
      location: locationInput,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchInput('');
    setLocationInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  };

  const hasActiveFilters = search || location || minPrice || maxPrice;

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Explore Events
          </h1>
          <p className="text-neutral-400">
            Find your next unforgettable experience
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              {/* Search input */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input pl-11"
                />
              </div>

              {/* Filter toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center gap-2 ${
                  hasActiveFilters ? 'border-primary-500 text-primary-400' : ''
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                )}
              </button>

              {/* Search button */}
              <button type="submit" className="btn-primary">
                Search
              </button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="mt-4 p-6 glass animate-slide-down">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Location */}
                  <div>
                    <label className="label flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="City or venue"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className="input"
                    />
                  </div>

                  {/* Min Price */}
                  <div>
                    <label className="label">Min Price (€)</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="input"
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="label">Max Price (€)</label>
                    <input
                      type="number"
                      placeholder="Any"
                      min="0"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="input"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="label">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => updateParams({ sortBy: e.target.value })}
                      className="input"
                    >
                      <option value="start_datetime">Date</option>
                      <option value="price">Price</option>
                      <option value="created_at">Recently added</option>
                    </select>
                  </div>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-sm text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-16 glass">
            <p className="text-red-400 mb-2">Error loading events</p>
            <p className="text-neutral-400 text-sm">{error.message}</p>
          </div>
        ) : data?.events?.length > 0 ? (
          <>
            {/* Results count */}
            <p className="text-neutral-400 text-sm mb-6">
              Showing {data.events.length} of {data.total} events
            </p>

            {/* Events grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={(newPage) => updateParams({ page: newPage.toString() })}
            />
          </>
        ) : (
          <div className="text-center py-16 glass">
            <CalendarIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">No events found</p>
            <p className="text-neutral-500 text-sm">
              Try adjusting your filters or search terms
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 link text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;

