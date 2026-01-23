import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import eventsService from '../services/events';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['events', 'home'],
    queryFn: () => eventsService.getEvents({ limit: 6, sortBy: 'start_datetime', sortOrder: 'asc' }),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/50 to-neutral-950" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 mb-8 animate-fade-in">
              <SparklesIcon className="w-4 h-4 text-primary-400" />
              <span>Discover amazing events near you</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 animate-slide-up">
              Create memories that
              <br />
              <span className="gradient-text">last forever</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-neutral-400 mb-10 animate-slide-up delay-100">
              Connect with people who share your passions. Find events, create experiences,
              and make every moment count.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
              <Link to="/events" className="btn-primary px-8 py-3 text-base">
                Explore Events
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/register" className="btn-secondary px-8 py-3 text-base">
                Create Your First Event
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up delay-300">
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-white">500+</div>
                <div className="text-sm text-neutral-400 mt-1">Events</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-white">10k+</div>
                <div className="text-sm text-neutral-400 mt-1">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-white">50+</div>
                <div className="text-sm text-neutral-400 mt-1">Cities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title text-white mb-4">
              Everything you need to host or attend events
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              From intimate workshops to large festivals, OneLastEvent makes it easy to discover,
              create, and manage any type of event.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 text-center hover:border-primary-500/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-3">
                Easy Event Creation
              </h3>
              <p className="text-neutral-400 text-sm">
                Create stunning event pages in minutes. Set capacity, pricing, and let attendees
                register seamlessly.
              </p>
            </div>

            <div className="glass p-8 text-center hover:border-accent-500/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-7 h-7 text-accent-400" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-3">
                Community First
              </h3>
              <p className="text-neutral-400 text-sm">
                Build your community. Connect with attendees, get feedback, and grow your audience
                event after event.
              </p>
            </div>

            <div className="glass p-8 text-center hover:border-green-500/30 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-3">
                Smart Discovery
              </h3>
              <p className="text-neutral-400 text-sm">
                Find events that match your interests. Filter by date, location, price, and discover
                hidden gems nearby.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="section-title text-white mb-2">Upcoming Events</h2>
              <p className="text-neutral-400">Don't miss out on these amazing experiences</p>
            </div>
            <Link
              to="/events"
              className="btn-secondary hidden sm:flex items-center gap-2"
            >
              View All
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : data?.events?.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass">
              <CalendarIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-400">No events available yet.</p>
              <Link to="/events/create" className="link text-sm mt-2 inline-block">
                Create the first one →
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/events" className="btn-secondary inline-flex items-center gap-2">
              View All Events
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-90" />
            <div className="absolute inset-0 bg-grid opacity-20" />
            
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to create your event?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Join thousands of organizers who trust OneLastEvent to bring their vision to life.
                Start for free today.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 bg-white text-neutral-900 font-medium rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Get Started Free
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

