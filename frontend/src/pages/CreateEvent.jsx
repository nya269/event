import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  PhotoIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import eventsService from '../services/events';

function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDatetime: '',
    endDatetime: '',
    capacity: 100,
    price: 0,
    currency: 'EUR',
    tags: '',
    status: 'DRAFT',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => eventsService.createEvent(data),
    onSuccess: (response) => {
      toast.success('Event created successfully!');
      navigate(`/events/${response.event.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create event');
    },
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  const handleSubmit = (e, publish = false) => {
    e.preventDefault();
    if (!validate()) return;

    const eventData = {
      ...formData,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      status: publish ? 'PUBLISHED' : 'DRAFT',
      image: imageFile,
    };

    createMutation.mutate(eventData);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Create New Event
          </h1>
          <p className="text-neutral-400">
            Fill in the details below to create your event
          </p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
          {/* Image upload */}
          <div className="glass p-6">
            <label className="label flex items-center gap-2">
              <PhotoIcon className="w-4 h-4" />
              Event Image
            </label>
            <div
              className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors ${
                imagePreview ? 'border-primary-500' : 'border-white/10'
              }`}
              onClick={() => document.getElementById('image-upload').click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg"
                />
              ) : (
                <>
                  <PhotoIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400">
                    Click to upload event image
                  </p>
                  <p className="text-neutral-500 text-sm mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </>
              )}
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Basic info */}
          <div className="glass p-6 space-y-6">
            <h2 className="font-display font-semibold text-lg text-white">
              Basic Information
            </h2>

            {/* Title */}
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
                placeholder="Give your event a catchy title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Description */}
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
                placeholder="Describe what your event is about..."
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="label flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className="input"
                placeholder="music, workshop, outdoor (comma separated)"
              />
            </div>
          </div>

          {/* Date & Location */}
          <div className="glass p-6 space-y-6">
            <h2 className="font-display font-semibold text-lg text-white">
              Date & Location
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Start datetime */}
              <div>
                <label htmlFor="startDatetime" className="label flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
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
                {errors.startDatetime && (
                  <p className="mt-1 text-sm text-red-400">{errors.startDatetime}</p>
                )}
              </div>

              {/* End datetime */}
              <div>
                <label htmlFor="endDatetime" className="label flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
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

            {/* Location */}
            <div>
              <label htmlFor="location" className="label flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="Venue name, city, or 'Online'"
              />
            </div>
          </div>

          {/* Capacity & Pricing */}
          <div className="glass p-6 space-y-6">
            <h2 className="font-display font-semibold text-lg text-white">
              Capacity & Pricing
            </h2>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="label flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4" />
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
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-400">{errors.capacity}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="label flex items-center gap-2">
                  <CurrencyEuroIcon className="w-4 h-4" />
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
                  className={`input ${errors.price ? 'input-error' : ''}`}
                  placeholder="0 = Free"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-400">{errors.price}</p>
                )}
              </div>

              {/* Currency */}
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
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {formData.price === 0 && (
              <p className="text-green-400 text-sm">
                ✓ This event will be free for attendees
              </p>
            )}
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
              type="submit"
              disabled={createMutation.isPending}
              className="btn-secondary py-3 px-6 flex-1"
            >
              {createMutation.isPending ? 'Creating...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={createMutation.isPending}
              className="btn-primary py-3 px-6 flex-1"
            >
              {createMutation.isPending ? 'Creating...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;

