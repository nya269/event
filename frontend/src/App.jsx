import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EventList = lazy(() => import('./pages/EventList'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const EditEvent = lazy(() => import('./pages/EditEvent'));
const DashboardUser = lazy(() => import('./pages/DashboardUser'));
const DashboardOrganizer = lazy(() => import('./pages/DashboardOrganizer'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/:id" element={<EventDetails />} />

          {/* Protected routes - any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="dashboard" element={<DashboardUser />} />
          </Route>

          {/* Protected routes - organizers only */}
          <Route element={<ProtectedRoute roles={['ORGANIZER', 'ADMIN']} />}>
            <Route path="organizer" element={<DashboardOrganizer />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/:id/edit" element={<EditEvent />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

