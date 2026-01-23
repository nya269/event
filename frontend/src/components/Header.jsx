import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  SquaresPlusIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, isAuthenticated, isOrganizer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-display font-bold text-xl">
              One<span className="text-primary-400">Last</span>Event
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/events"
              className="text-sm text-neutral-300 hover:text-white transition-colors"
            >
              Explore Events
            </Link>
            
            {isOrganizer && (
              <Link
                to="/events/create"
                className="text-sm text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Create Event
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.fullName}</span>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-neutral-900 border border-white/10 shadow-lg focus:outline-none p-2">
                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                      <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                    </div>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard"
                          className={`${
                            active ? 'bg-white/10' : ''
                          } flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 rounded-lg`}
                        >
                          <CalendarIcon className="w-4 h-4" />
                          My Registrations
                        </Link>
                      )}
                    </Menu.Item>

                    {isOrganizer && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/organizer"
                            className={`${
                              active ? 'bg-white/10' : ''
                            } flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 rounded-lg`}
                          >
                            <SquaresPlusIcon className="w-4 h-4" />
                            Organizer Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                    )}

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? 'bg-white/10' : ''
                          } flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 rounded-lg`}
                        >
                          <Cog6ToothIcon className="w-4 h-4" />
                          Settings
                        </Link>
                      )}
                    </Menu.Item>

                    <div className="border-t border-white/5 mt-2 pt-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-white/10' : ''
                            } flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-lg w-full text-left`}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-neutral-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5">
            <div className="flex flex-col gap-2">
              <Link
                to="/events"
                className="px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Events
              </Link>
              
              {isOrganizer && (
                <Link
                  to="/events/create"
                  className="px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Event
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Registrations
                  </Link>
                  {isOrganizer && (
                    <Link
                      to="/organizer"
                      className="px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Organizer Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm text-center mx-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;

