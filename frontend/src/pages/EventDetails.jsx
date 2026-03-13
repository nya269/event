import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  TicketIcon,
  ShareIcon,
  HeartIcon,
  ClockIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import eventsService from '../services/events';
import paymentsService from '../services/payments';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [liked, setLiked] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getEvent(id),
  });

  const registerMutation = useMutation({
    mutationFn: () => eventsService.registerForEvent(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['event', id]);
      toast.success('Successfully registered for event!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Registration failed');
    },
  });

  const initPaymentMutation = useMutation({
    mutationFn: () => eventsService.initializePayment(id),
    onSuccess: (data) => {
      setPaymentData(data);
      setShowPaymentModal(true);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Payment initialization failed');
    },
  });

  const mockPaymentMutation = useMutation({
    mutationFn: () => paymentsService.processMockPayment(paymentData.paymentId),
    onSuccess: () => {
      setShowPaymentModal(false);
      queryClient.invalidateQueries(['event', id]);
      toast.success('Payment successful! You are registered.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Payment failed');
    },
  });

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    const event = data?.event;
    if (event && parseFloat(event.price) > 0) {
      // Paid event - initialize payment
      initPaymentMutation.mutate();
    } else {
      // Free event - register directly
      registerMutation.mutate();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: data?.event?.title,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Event not found</h2>
          <p className="text-neutral-400 mb-4">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const event = data?.event;
  const isFree = parseFloat(event.price) === 0;
  const spotsLeft = event.remainingSpots;
  const isFull = spotsLeft <= 0;
  const isOrganizer = user?.id === event.organizerId;

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-neutral-400">
            <li>
              <Link to="/events" className="hover:text-white">
                Events
              </Link>
            </li>
            <li>/</li>
            <li className="text-white truncate max-w-xs">{event.title}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="aspect-[16/9] rounded-2xl overflow-hidden">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-600/20 to-accent-600/20 flex items-center justify-center">
                  <CalendarIcon className="w-20 h-20 text-white/20" />
                </div>
              )}
            </div>

            {/* Title & actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                {event.organizer && (
                  <p className="text-neutral-400">
                    Hosted by{' '}
                    <span className="text-white">{event.organizer.fullName}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {liked ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-neutral-400" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ShareIcon className="w-6 h-6 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="glass p-6">
              <h2 className="font-display font-semibold text-lg text-white mb-4">
                About this event
              </h2>
              <div className="prose prose-invert prose-neutral max-w-none">
                <p className="text-neutral-300 whitespace-pre-wrap">
                  {event.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/5 text-neutral-300 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration card */}
            <div className="glass p-6 sticky top-24">
              {/* Price */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  {isFree ? (
                    <span className="text-2xl font-bold text-green-400">Free</span>
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {event.price} {event.currency}
                    </span>
                  )}
                </div>
                {!isFull && (
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-sm rounded-full">
                    {spotsLeft} spots left
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-primary-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">
                      {format(new Date(event.startDatetime), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-neutral-400 text-sm">
                      {format(new Date(event.startDatetime), 'h:mm a')}
                      {event.endDatetime && (
                        <> - {format(new Date(event.endDatetime), 'h:mm a')}</>
                      )}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-primary-400 mt-0.5" />
                    <div>
                      <p className="text-white">{event.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <UserGroupIcon className="w-5 h-5 text-primary-400 mt-0.5" />
                  <div>
                    <p className="text-white">
                      {event.currentParticipants || 0} / {event.capacity} attendees
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {isOrganizer ? (
                <Link
                  to={`/events/${id}/edit`}
                  className="btn-secondary w-full py-3 text-center"
                >
                  Edit Event
                </Link>
              ) : isFull ? (
                <button disabled className="btn-secondary w-full py-3 opacity-50">
                  Sold Out
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registerMutation.isPending || initPaymentMutation.isPending}
                  className="btn-primary w-full py-3"
                >
                  {registerMutation.isPending || initPaymentMutation.isPending
                    ? 'Processing...'
                    : isFree
                    ? 'Register for Free'
                    : `Get Tickets - ${event.price} ${event.currency}`}
                </button>
              )}

              {!isAuthenticated && (
                <p className="text-center text-neutral-400 text-sm mt-3">
                  <Link to="/login" className="link">
                    Sign in
                  </Link>{' '}
                  to register
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Complete Payment"
        size="sm"
      >
        {paymentData && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400">Event</span>
                <span className="text-white font-medium">{event.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Amount</span>
                <span className="text-white font-bold text-lg">
                  {paymentData.amount} {paymentData.currency}
                </span>
              </div>
            </div>

            <p className="text-neutral-400 text-sm text-center">
              This is a demo payment. Click below to simulate a successful payment.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => mockPaymentMutation.mutate()}
                disabled={mockPaymentMutation.isPending}
                className="btn-primary flex-1"
              >
                {mockPaymentMutation.isPending ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default EventDetails;

