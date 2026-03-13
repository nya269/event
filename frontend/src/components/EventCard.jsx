import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';

function EventCard({ event }) {
  const isFree = parseFloat(event.price) === 0;
  const spotsLeft = event.remainingSpots || event.capacity - (event.currentParticipants || 0);
  const isFull = spotsLeft <= 0;

  return (
    <Link to={`/events/${event.id}`} className="group">
      <article className="card-hover h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-600/20 to-accent-600/20 flex items-center justify-center">
              <CalendarIcon className="w-12 h-12 text-white/20" />
            </div>
          )}
          
          {/* Status badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isFree ? (
              <span className="px-2 py-1 text-xs font-medium bg-green-500/90 text-white rounded-lg">
                Free
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium bg-white/90 text-neutral-900 rounded-lg">
                {event.price} {event.currency}
              </span>
            )}
            {isFull && (
              <span className="px-2 py-1 text-xs font-medium bg-red-500/90 text-white rounded-lg">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Date */}
          <div className="flex items-center gap-2 text-primary-400 text-sm mb-2">
            <CalendarIcon className="w-4 h-4" />
            <time dateTime={event.startDatetime}>
              {format(new Date(event.startDatetime), 'EEE, MMM d · h:mm a')}
            </time>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-lg text-white group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
            {event.title}
          </h3>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-3">
              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <UserGroupIcon className="w-4 h-4" />
              <span>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'No spots left'}
              </span>
            </div>

            {/* Organizer */}
            {event.organizer && (
              <div className="flex items-center gap-2">
                {event.organizer.avatarUrl ? (
                  <img
                    src={event.organizer.avatarUrl}
                    alt={event.organizer.fullName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center">
                    <span className="text-xs text-white">
                      {event.organizer.fullName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default EventCard;

