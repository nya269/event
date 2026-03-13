import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CalendarIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
import eventsService from '../services/events';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

function DashboardOrganizer() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventsService.getMyEvents({ limit: 50 }),
  });

  // Group events by status
  const published = data?.events?.filter((e) => e.status === 'PUBLISHED') || [];
  const drafts = data?.events?.filter((e) => e.status === 'DRAFT') || [];
  const cancelled = data?.events?.filter((e) => e.status === 'CANCELLED') || [];

  // Calculate stats
  const totalEvents = data?.events?.length || 0;
  const totalParticipants = data?.events?.reduce(
    (sum, e) => sum + (e.currentParticipants || 0),
    0
  ) || 0;

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Organizer Dashboard
            </h1>
            <p className="text-neutral-400">
              Manage your events and track registrations
            </p>
          </div>

          <Link to="/events/create" className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Create Event
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="glass p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalEvents}</p>
                <p className="text-sm text-neutral-400">Total Events</p>
              </div>
            </div>
          </div>

          <div className="glass p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalParticipants}</p>
                <p className="text-sm text-neutral-400">Total Participants</p>
              </div>
            </div>
          </div>

          <div className="glass p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{published.length}</p>
                <p className="text-sm text-neutral-400">Published Events</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : totalEvents === 0 ? (
          <div className="glass p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              No events yet
            </h2>
            <p className="text-neutral-400 mb-6">
              Create your first event and start building your audience
            </p>
            <Link to="/events/create" className="btn-primary">
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Published events */}
            {published.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Published ({published.length})
                </h2>
                <div className="space-y-4">
                  {published.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Draft events */}
            {drafts.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Drafts ({drafts.length})
                </h2>
                <div className="space-y-4">
                  {drafts.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled events */}
            {cancelled.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-lg text-white mb-4 text-neutral-500">
                  Cancelled ({cancelled.length})
                </h2>
                <div className="space-y-4 opacity-60">
                  {cancelled.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EventRow({ event }) {
  const isFree = parseFloat(event.price) === 0;

  return (
    <div className="glass p-4 flex flex-col sm:flex-row gap-4">
      {/* Image */}
      <Link
        to={`/events/${event.id}`}
        className="sm:w-40 sm:h-24 rounded-lg overflow-hidden flex-shrink-0"
      >
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
            <CalendarIcon className="w-8 h-8 text-neutral-600" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/events/${event.id}`}
            className="font-medium text-white hover:text-primary-400 transition-colors line-clamp-1"
          >
            {event.title}
          </Link>
          <span
            className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
              event.status === 'PUBLISHED'
                ? 'bg-green-500/20 text-green-400'
                : event.status === 'DRAFT'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {event.status}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400">
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            {format(new Date(event.startDatetime), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <UserGroupIcon className="w-4 h-4" />
            {event.currentParticipants || 0} / {event.capacity}
          </span>
          <span className="flex items-center gap-1">
            <CurrencyEuroIcon className="w-4 h-4" />
            {isFree ? 'Free' : `${event.price} ${event.currency}`}
          </span>
        </div>

        {event.location && (
          <p className="mt-1 text-sm text-neutral-500 truncate">{event.location}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          to={`/events/${event.id}`}
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="View"
        >
          <EyeIcon className="w-5 h-5" />
        </Link>
        <Link
          to={`/events/${event.id}/edit`}
          className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Edit"
        >
          <PencilIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

export default DashboardOrganizer;

