import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import eventsService from '../services/events';
import LoadingSpinner from '../components/LoadingSpinner';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsService.getEvent(id),
  });

  // Initialize form data when event loads
  useEffect(() => {
    if (data?.event) {
      const event = data.event;
      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        startDatetime: event.startDatetime
          ? format(new Date(event.startDatetime), "yyyy-MM-dd'T'HH:mm")
          : '',
        endDatetime: event.endDatetime
          ? format(new Date(event.endDatetime), "yyyy-MM-dd'T'HH:mm")
          : '',
        capacity: event.capacity || 100,
        price: event.price || 0,
        currency: event.currency || 'EUR',
        tags: event.tags?.join(', ') || '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (updates) => eventsService.updateEvent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['event', id]);
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update event');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => eventsService.publishEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event', id]);
      toast.success('Event published!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to publish event');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: () => eventsService.unpublishEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event', id]);
      toast.success('Event unpublished');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to unpublish event');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventsService.deleteEvent(id),
    onSuccess: () => {
      toast.success('Event deleted');
      navigate('/organizer');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete event');
    },
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.startDatetime) newErrors.startDatetime = 'Start date is required';
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const updates = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      startDatetime: formData.startDatetime,
      endDatetime: formData.endDatetime || undefined,
      capacity: formData.capacity,
      price: formData.price,
      currency: formData.currency,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    updateMutation.mutate(updates);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading || !formData) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Event not found</h2>
          <button onClick={() => navigate('/organizer')} className="btn-primary mt-4">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const event = data?.event;

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Edit Event
            </h1>
            <p className="text-neutral-400">
              Status:{' '}
              <span
                className={
                  event.status === 'PUBLISHED'
                    ? 'text-green-400'
                    : event.status === 'CANCELLED'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }
              >
                {event.status}
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            {event.status === 'DRAFT' && (
              <button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="btn-primary"
              >
                {publishMutation.isPending ? 'Publishing...' : 'Publish'}
              </button>
            )}
            {event.status === 'PUBLISHED' && (
              <button
                onClick={() => unpublishMutation.mutate()}
                disabled={unpublishMutation.isPending}
                className="btn-secondary"
              >
                {unpublishMutation.isPending ? '...' : 'Unpublish'}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
          <div className="glass p-6 space-y-6">
            <h2 className="font-display font-semibold text-lg text-white">
              Basic Information
            </h2>

            <div>
              <label htmlFor="title" className="label">
                Event Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={`input ${errors.title ? 'input-error' : ''}`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="input resize-none"
              />
            </div>

            <div>
              <label htmlFor="tags" className="label">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className="input"
                placeholder="Comma separated"
              />
            </div>
          </div>

          {/* Date & Location */}
          <div className="glass p-6 space-y-6">
            <h2 className="font-display font-semibold text-lg text-white">
              Date & Location
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDatetime" className="label">
                  Start Date & Time *
                </label>
                <input
                  id="startDatetime"
                  name="startDatetime"
                  type="datetime-local"
                  value={formData.startDatetime}
                  onChange={handleChange}
                  className={`input ${errors.startDatetime ? 'input-error' : ''}`}
                />
              </div>

              <div>
                <label htmlFor="endDatetime" className="label">
                  End Date & Time
                </label>
                <input
                  id="endDatetime"
                  name="endDatetime"
                  type="datetime-local"
                  value={formData.endDatetime}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="label">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="glass p-6 space-y-6">
            <h2 className="font-display font-semibold text-lg text-white">
              Capacity & Pricing
            </h2>

            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="capacity" className="label">
                  Capacity *
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className={`input ${errors.capacity ? 'input-error' : ''}`}
                />
              </div>

              <div>
                <label htmlFor="price" className="label">
                  Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="currency" className="label">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary py-3 px-6"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="btn-ghost py-3 px-6 text-red-400 hover:bg-red-500/10"
            >
              Delete Event
            </button>
            <div className="flex-1" />
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary py-3 px-6"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;

