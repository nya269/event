import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  TicketIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import usersService from '../services/users';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

function DashboardUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inscriptions'],
    queryFn: () => usersService.getInscriptions({ limit: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (inscriptionId) => usersService.cancelInscription(inscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['inscriptions']);
      toast.success('Registration cancelled');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to cancel');
    },
  });

  const handleCancel = (inscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this registration?')) {
      cancelMutation.mutate(inscriptionId);
    }
  };

  // Group inscriptions by status
  const upcoming =
    data?.inscriptions?.filter(
      (i) =>
        i.status !== 'CANCELLED' &&
        i.event &&
        new Date(i.event.startDatetime) > new Date()
    ) || [];

  const past =
    data?.inscriptions?.filter(
      (i) =>
        i.status !== 'CANCELLED' &&
        i.event &&
        new Date(i.event.startDatetime) <= new Date()
    ) || [];

  const cancelled =
    data?.inscriptions?.filter((i) => i.status === 'CANCELLED') || [];

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            My Registrations
          </h1>
          <p className="text-neutral-400">
            Welcome back, {user?.fullName}. Here are your event registrations.
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-8">
            {/* Upcoming */}
            <section>
              <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary-400" />
                Upcoming Events ({upcoming.length})
              </h2>

              {upcoming.length > 0 ? (
                <div className="space-y-4">
                  {upcoming.map((inscription) => (
                    <InscriptionCard
                      key={inscription.id}
                      inscription={inscription}
                      onCancel={() => handleCancel(inscription.id)}
                      cancelling={cancelMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass p-8 text-center">
                  <TicketIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400 mb-4">
                    No upcoming registrations
                  </p>
                  <Link to="/events" className="btn-primary">
                    Explore Events
                  </Link>
                </div>
              )}
            </section>

            {/* Past */}
            {past.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-lg text-white mb-4">
                  Past Events ({past.length})
                </h2>
                <div className="space-y-4">
                  {past.map((inscription) => (
                    <InscriptionCard
                      key={inscription.id}
                      inscription={inscription}
                      isPast
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled */}
            {cancelled.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-lg text-white mb-4 text-neutral-500">
                  Cancelled ({cancelled.length})
                </h2>
                <div className="space-y-4 opacity-60">
                  {cancelled.map((inscription) => (
                    <InscriptionCard
                      key={inscription.id}
                      inscription={inscription}
                      isCancelled
                    />
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

function InscriptionCard({ inscription, onCancel, cancelling, isPast, isCancelled }) {
  const event = inscription.event;
  if (!event) return null;

  return (
    <div className="glass p-4 flex flex-col sm:flex-row gap-4">
      {/* Image */}
      <Link
        to={`/events/${event.id}`}
        className="sm:w-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0"
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
        <Link
          to={`/events/${event.id}`}
          className="font-medium text-white hover:text-primary-400 transition-colors line-clamp-1"
        >
          {event.title}
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400">
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            {format(new Date(event.startDatetime), 'MMM d, yyyy · h:mm a')}
          </span>
          {event.location && (
            <span className="truncate">{event.location}</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              inscription.status === 'CONFIRMED'
                ? 'bg-green-500/20 text-green-400'
                : inscription.status === 'PENDING'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {inscription.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isPast && !isCancelled && onCancel && (
        <div className="flex items-center">
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Cancel registration"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardUser;

