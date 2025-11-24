import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Camera, Heart, MessageCircle, Calendar, Star, Send, X, Plus, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, Clock, TrendingUp, Mic, MicOff, Play, Pause, Lightbulb, Check, Trash2, LogOut, Download, Edit2, Save, Shuffle, MapPin, ThumbsUp, ThumbsDown, Utensils, Coffee, Film, Music } from 'lucide-react';
import heic2any from 'heic2any';
import './App.css'; // Add this line

const SIMRAN = 'simran';
const AYAAN = 'ayaan';

// Default relationship principles
const DEFAULT_PRINCIPLES = [
  "No sleeping while in a fight",
  "Not arguing for the sake of arguing",
  "Always saying when something is off rather than letting it continue boiling"
];

// Default date ideas for the roulette
const DEFAULT_DATE_IDEAS = [
  { idea: 'Cook dinner together at home', category: 'home', icon: '🏠' },
  { idea: 'BBT and Go for walk', category: 'outdoor', icon: '🚶‍♀️' },
  { idea: 'Movie night with snacks', category: 'indoor', icon: '🎥' },
  { idea: 'Try a new restaurant', category: 'food', icon: '🍝' },
  { idea: 'Game night', category: 'indoor', icon: '🧩' },
  { idea: 'Brunch time', category: 'casual', icon: '🍳' },
  { idea: 'Star gazing', category: 'outdoor', icon: '💫' },
  { idea: 'Bake something together', category: 'home', icon: '🧁' },
  { idea: 'Go shopping', category: 'outdoor', icon: '🛍️' },
  { idea: 'Have a spa day at home', category: 'home', icon: '🧖‍♀️' },
];

// Loading Spinner Component
function LoadingSpinner({ size = 'md', message = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-pink-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent animate-spin-slow"></div>
      </div>
      {message && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-slide-up-fade">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
      <div className="mt-4 flex gap-2">
        <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px' }}></div>
        <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px' }}></div>
        <div className="skeleton skeleton-circle" style={{ width: '40px', height: '40px' }}></div>
      </div>
    </div>
  );
}

// Date Roulette Component
function DateRoulette({ customIdeas = [], onClose, currentUser }) {
  const [spinning, setSpinning] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdea, setNewIdea] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState('custom');
  const [localCustomIdeas, setLocalCustomIdeas] = useState(customIdeas);

  const allIdeas = [...DEFAULT_DATE_IDEAS, ...localCustomIdeas];

  const spinRoulette = () => {
    if (allIdeas.length === 0) return;
    
    setSpinning(true);
    setSelectedIdea(null);

    let count = 0;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allIdeas.length);
      setSelectedIdea(allIdeas[randomIndex]);
      count++;

      if (count > 20) {
        clearInterval(spinInterval);
        setSpinning(false);
      }
    }, 100);
  };

  const handleAddIdea = async () => {
    if (!newIdea.trim()) return;

    const ideaObj = {
      idea: newIdea,
      category: newIdeaCategory,
      icon: '+',
      addedBy: currentUser,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'dateIdeas'), ideaObj);
      setLocalCustomIdeas([...localCustomIdeas, ideaObj]);
      setNewIdea('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding idea:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="glass-card-strong rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gradient-pink flex items-center gap-2">
            <Shuffle className="animate-spin-slow" size={32} />
            Date Night Roulette
          </h2>
          <button
            onClick={onClose}
            className="glass-button p-2 rounded-xl hover-scale press-scale"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-8">
          <div className={`glass-card rounded-3xl p-12 text-center min-h-[300px] flex flex-col items-center justify-center ${spinning ? 'animate-shake' : ''}`}>
            {selectedIdea ? (
              <>
                <div className="text-6xl mb-4 animate-bounce-in">
                  {selectedIdea.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedIdea.idea}
                </h3>
                <span className="inline-block px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-semibold">
                  {selectedIdea.category}
                </span>
              </>
            ) : (
              <div className="text-gray-400">
                <Shuffle size={64} className="mx-auto mb-4" />
                <p className="text-xl">Click spin to get a date idea</p>
              </div>
            )}
          </div>

          <button
            onClick={spinRoulette}
            disabled={spinning || allIdeas.length === 0}
            className="mt-6 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover-lift press-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Shuffle size={24} className={spinning ? 'animate-spin-slow' : ''} />
            {spinning ? 'Spinning...' : 'Spin the Wheel!'}
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Lightbulb size={20} />
            Add Your Own Date Idea
          </h3>
          
          {showAddForm ? (
            <div className="space-y-3">
              <input
                type="text"
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="Your date idea..."
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
              />
              <select
                value={newIdeaCategory}
                onChange={(e) => setNewIdeaCategory(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
              >
                <option value="custom">Custom</option>
                <option value="home">Home</option>
                <option value="outdoor">Outdoor</option>
                <option value="indoor">Indoor</option>
                <option value="food">Food</option>
                <option value="activity">Activity</option>
                <option value="culture">Culture</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="glass-button px-4 py-2 rounded-xl hover-scale press-scale"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIdea}
                  disabled={!newIdea.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover-lift press-scale disabled:opacity-50"
                >
                  Add Idea
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full glass-button py-3 rounded-xl font-semibold hover-scale press-scale"
            >
              <Plus size={20} className="inline mr-2" />
              Add Custom Idea
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          {allIdeas.length} date ideas available ({DEFAULT_DATE_IDEAS.length} default + {localCustomIdeas.length} custom)
        </div>
      </div>
    </div>
  );
}

// Favorite Places Component
function FavoritePlaces({ places = [], onClose, currentUser }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [newPlace, setNewPlace] = useState({
    name: '',
    type: 'restaurant',
    rating: 5,
    location: '',
    notes: '',
    priceRange: '$$',
    visited: true
  });

  const handleAddPlace = async () => {
    if (!newPlace.name.trim()) return;

    try {
      await addDoc(collection(db, 'favoritePlaces'), {
        ...newPlace,
        addedBy: currentUser,
        createdAt: new Date().toISOString()
      });
      
      setNewPlace({
        name: '',
        type: 'restaurant',
        rating: 5,
        location: '',
        notes: '',
        priceRange: '$$',
        visited: true
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding place:', error);
    }
  };

  const handleDeletePlace = async (placeId) => {
    try {
      await deleteDoc(doc(db, 'favoritePlaces', placeId));
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  const filteredPlaces = filterType === 'all' 
    ? places 
    : places.filter(p => p.type === filterType);

  const getTypeIcon = (type) => {
    const icons = {
      restaurant: '🍝',
      cafe: '🍳',
      activity: '🕺',
      park: '🌳',
      other: '💼'
    };
    return icons[type] || '💼';
  };

  const getPriceRangeColor = (range) => {
    const colors = {
      '$': 'text-green-600',
      '$$': 'text-yellow-600',
      '$$$': 'text-orange-600',
      '$$$$': 'text-red-600'
    };
    return colors[range] || 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="glass-card-strong rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gradient-pink flex items-center gap-2">
            <MapPin size={32} />
            Favorite Places
          </h2>
          <button
            onClick={onClose}
            className="glass-button p-2 rounded-xl hover-scale press-scale"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'restaurant', 'cafe', 'activity', 'park', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap smooth-transition ${
                filterType === type
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'glass-button'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 glass-button py-4 rounded-2xl font-semibold hover-lift press-scale flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add New Place
          </button>
        )}

        {showAddForm && (
          <div className="glass-card rounded-2xl p-6 mb-6 animate-slide-up-fade">
            <h3 className="font-semibold text-lg mb-4">Add a Favorite Place</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newPlace.name}
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                placeholder="Place name..."
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newPlace.type}
                  onChange={(e) => setNewPlace({ ...newPlace, type: e.target.value })}
                  className="glass-input px-4 py-3 rounded-xl outline-none"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="activity">Activity</option>
                  <option value="park">Park</option>
                  <option value="other">Other</option>
                </select>
                
                <select
                  value={newPlace.priceRange}
                  onChange={(e) => setNewPlace({ ...newPlace, priceRange: e.target.value })}
                  className="glass-input px-4 py-3 rounded-xl outline-none"
                >
                  <option value="$">$ (Budget)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Expensive)</option>
                  <option value="$$$$">$$$$ (Very Expensive)</option>
                </select>
              </div>

              <input
                type="text"
                value={newPlace.location}
                onChange={(e) => setNewPlace({ ...newPlace, location: e.target.value })}
                placeholder="Location/Address..."
                className="glass-input w-full px-4 py-3 rounded-xl outline-none"
              />

              <textarea
                value={newPlace.notes}
                onChange={(e) => setNewPlace({ ...newPlace, notes: e.target.value })}
                placeholder="Notes (what you liked, recommended dishes, etc.)..."
                rows="3"
                className="glass-input w-full px-4 py-3 rounded-xl outline-none resize-none"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating: {newPlace.rating} 💫
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={newPlace.rating}
                  onChange={(e) => setNewPlace({ ...newPlace, rating: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visited"
                  checked={newPlace.visited}
                  onChange={(e) => setNewPlace({ ...newPlace, visited: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="visited" className="text-sm font-medium text-gray-700">
                  We've been here
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="glass-button px-4 py-2 rounded-xl hover-scale press-scale"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlace}
                  disabled={!newPlace.name.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover-lift press-scale disabled:opacity-50"
                >
                  Add Place
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredPlaces.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No places added yet. Start building the list</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="glass-card rounded-2xl p-6 hover-lift smooth-transition animate-slide-up-fade"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getTypeIcon(place.type)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{place.name}</h3>
                      <p className="text-sm text-gray-600">{place.location}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePlace(place.id)}
                    className="glass-button p-2 rounded-lg hover:bg-red-100 press-scale"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(place.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-sm font-semibold text-gray-700 ml-1">{place.rating}</span>
                  </div>
                  <span className={`font-bold ${getPriceRangeColor(place.priceRange)}`}>
                    {place.priceRange}
                  </span>
                  {place.visited && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Visited
                    </span>
                  )}
                </div>

                {place.notes && (
                  <p className="text-gray-700 text-sm italic">"{place.notes}"</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''} {filterType !== 'all' && `in ${filterType}`}
        </div>
      </div>
    </div>
  );
}

// Invitation Card Component
function InvitationCard({ invite, currentUser, onAccept, onDelete }) {
  const [acceptanceNote, setAcceptanceNote] = React.useState('');
  const isReceiver = invite.to === currentUser;
  const isSender = invite.from === currentUser;
  const isAccepted = invite.status === 'accepted';

  return (
    <div className={`glass-card rounded-2xl p-6 shadow-lg relative overflow-hidden animate-slide-up-fade ${
      isAccepted 
        ? 'border-2 border-green-200' 
        : 'border-2 border-amber-200'
    }`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {isAccepted ? (
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Check size={14} />
            Accepted
          </div>
        ) : isSender ? (
          <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Awaiting Response
          </div>
        ) : (
          <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            New!
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mb-4 pr-32">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{invite.title}</h3>
        <p className="text-sm text-gray-600">
          {isSender ? `Sent to ${invite.to === SIMRAN ? 'Simran' : 'Ayaan'}` : `From ${invite.from === SIMRAN ? 'Simran' : 'Ayaan'}`}
        </p>
      </div>

      {/* Event Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={18} className="text-amber-600" />
          <span className="font-medium">
            {new Date(invite.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        {invite.startTime && (
          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={18} className="text-amber-600" />
            <span>
              {invite.startTime}
              {invite.endTime && ` - ${invite.endTime}`}
            </span>
          </div>
        )}

        {invite.location && (
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-amber-600">📍</span>
            <span>{invite.location}</span>
          </div>
        )}

        {invite.dressCode && (
          <div className="flex items-center gap-2 text-gray-700">
            <span className="text-amber-600">👔</span>
            <span>Dress Code: {invite.dressCode}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {invite.description && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <p className="text-gray-700 italic">"{invite.description}"</p>
        </div>
      )}

      {/* Itinerary */}
      {invite.itinerary && invite.itinerary.length > 0 && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Itinerary
          </h4>
          <div className="space-y-2">
            {invite.itinerary.map((item, idx) => (
              <div key={idx} className="flex gap-3 text-sm">
                <span className="font-medium text-amber-600 min-w-[60px]">{item.time}</span>
                <span className="text-gray-700">{item.activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acceptance Note Display (for sender after acceptance) */}
      {isAccepted && isSender && invite.acceptanceNote && (
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Heart size={16} className="text-green-600" />
            {invite.to === SIMRAN ? "Simran's" : "Ayaan's"} Response
          </h4>
          <p className="text-gray-700 italic">"{invite.acceptanceNote}"</p>
          <p className="text-xs text-gray-500 mt-2">
            Accepted {new Date(invite.acceptedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}

      {/* Actions */}
      {!isAccepted && isReceiver && (
        <div className="space-y-3 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your excitement!
            </label>
            <textarea
              value={acceptanceNote}
              onChange={(e) => setAcceptanceNote(e.target.value)}
              placeholder="I can't wait because..."
              rows="2"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(invite.id)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <X size={18} />
              Decline
            </button>
            <button
              onClick={() => onAccept(invite.id, acceptanceNote)}
              disabled={!acceptanceNote.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Accept Invitation
            </button>
          </div>
        </div>
      )}

      {/* Delete button for sender */}
      {isSender && !isAccepted && (
        <button
          onClick={() => onDelete(invite.id)}
          className="mt-4 w-full py-2 text-gray-600 hover:text-red-600 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Cancel Invitation
        </button>
      )}
    </div>
  );
}

// Haptic Feedback Hook
const useHaptic = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const isSupported = 'vibrate' in navigator;

  const triggerHaptic = (pattern = 'light') => {
    if (!isEnabled || !isSupported) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 100, 50],
      selection: [5],
      impact: [15],
      notification: [10, 50, 10, 50, 10],
    };

    try {
      navigator.vibrate(patterns[pattern] || patterns.light);
    } catch (error) {
      console.log('Haptic not available');
    }
  };

  return { triggerHaptic, isEnabled, setIsEnabled, isSupported };
};

// Countdown Timer Component
function CountdownTimer({ targetDate, eventName }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({});
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate || Object.keys(timeLeft).length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-3xl p-6 mb-6 animate-pulse-glow">
      <div className="text-center mb-2">
        <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
          Next Date In
        </h3>
      </div>
      
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <div className="countdown-number text-3xl font-bold text-gradient-pink">
            {timeLeft.days || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium">Days</div>
        </div>
        <div className="text-center">
          <div className="countdown-number text-3xl font-bold text-gradient-pink">
            {timeLeft.hours || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium">Hours</div>
        </div>
        <div className="text-center">
          <div className="countdown-number text-3xl font-bold text-gradient-pink">
            {timeLeft.minutes || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium">Mins</div>
        </div>
        <div className="text-center">
          <div className="countdown-number text-3xl font-bold text-gradient-pink">
            {timeLeft.seconds || 0}
          </div>
          <div className="text-xs text-gray-600 font-medium">Secs</div>
        </div>
      </div>
      
      <div className="text-center border-t border-gray-200 pt-3">
        <p className="text-lg font-semibold text-gray-800 mb-1">{eventName}</p>
        <p className="text-sm text-gray-600">Can't wait to see you!</p>
      </div>
    </div>
  );
}

// Milestone Notification Component
function MilestoneNotification({ milestone, onDismiss }) {
  const { triggerHaptic } = useHaptic();

  useEffect(() => {
    triggerHaptic('notification');
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="glass-card-strong rounded-3xl p-8 max-w-md w-full animate-bounce-in">
        <div className="text-center">
          <div className="milestone-icon mb-4">
            {milestone.icon}
          </div>
          <h2 className="text-3xl font-bold mb-3 text-gradient-pink">
            Milestone Achieved!
          </h2>
          <p className="text-2xl font-semibold text-gray-800 mb-4">
            {milestone.title}
          </p>
          <p className="text-gray-600 mb-6 text-lg">
            You're creating beautiful memories together
          </p>
          <button
            onClick={() => {
              triggerHaptic('success');
              onDismiss();
            }}
            className="glass-button px-8 py-4 rounded-2xl font-bold text-lg hover-lift press-scale bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0"
          >
            Celebrate!
          </button>
        </div>
      </div>
    </div>
  );
}

// Milestone Checker Function
const checkForMilestones = (dates, anniversaryDate) => {
  const now = new Date();
  const daysTogether = Math.floor((now - anniversaryDate) / (1000 * 60 * 60 * 24));
  const totalDates = dates.length;
  const totalPhotos = dates.reduce((sum, date) => sum + (date.photos?.length || 0), 0);
  const totalComments = dates.reduce((sum, date) => sum + (date.comments?.length || 0), 0);
  const fiveStarDates = dates.filter(d => d.rating === 5).length;

  const milestones = [];

  // Relationship milestones
  if (daysTogether === 100) {
    milestones.push({ type: '100days', title: '100 Days Together!', icon: '💯', achieved: new Date().toISOString() });
  }
  if (daysTogether === 180) {
    milestones.push({ type: '6months', title: '6 Months Anniversary!', icon: '6️⃣', achieved: new Date().toISOString() });
  }
  if (daysTogether === 365) {
    milestones.push({ type: '1year', title: 'One Year Together!', icon: '🕺', achieved: new Date().toISOString() });
  }

  // Date milestones
  if (totalDates === 10) {
    milestones.push({ type: '10dates', title: '10th Date!', icon: '🔟', achieved: new Date().toISOString() });
  }
  if (totalDates === 25) {
    milestones.push({ type: '25dates', title: '25 Amazing Dates!', icon: '🥰', achieved: new Date().toISOString() });
  }
  if (totalDates === 50) {
    milestones.push({ type: '50dates', title: '50 Dates Together!', icon: '😘', achieved: new Date().toISOString() });
  }
  if (totalDates === 100) {
    milestones.push({ type: '100dates', title: '100 Dates!!!', icon: '💯', achieved: new Date().toISOString() });
  }

  // Photo milestones
  if (totalPhotos === 50) {
    milestones.push({ type: '50photos', title: '50 Photos!', icon: '🤳', achieved: new Date().toISOString() });
  }
  if (totalPhotos === 100) {
    milestones.push({ type: '100photos', title: '100 Beautiful Photos!', icon: '🎞️', achieved: new Date().toISOString() });
  }

  // Comment milestone
  if (totalComments === 100) {
    milestones.push({ type: '100comments', title: '100 Sweet Comments!', icon: '💬', achieved: new Date().toISOString() });
  }

  // First perfect date
  if (fiveStarDates === 1) {
    milestones.push({ type: 'first5star', title: 'First 5-Star Date!', icon: '👌', achieved: new Date().toISOString() });
  }

  return milestones;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // Changed to null for login screen
  const [anniversaryDate, setAnniversaryDate] = useState(new Date('2025-10-14'));
  const [dates, setDates] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showNewDateForm, setShowNewDateForm] = useState(false);
  const [showNewInvitation, setShowNewInvitation] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [newWishlistItem, setNewWishlistItem] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedRating, setEditedRating] = useState(0);
  const [showDateRoulette, setShowDateRoulette] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [dateIdeas, setDateIdeas] = useState([]);
  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add these new state variables
const [showMilestone, setShowMilestone] = useState(null);
const [achievedMilestones, setAchievedMilestones] = useState([]);
const { triggerHaptic } = useHaptic();

// New states for editing and principles
const [editingDateId, setEditingDateId] = useState(null);
const [editingField, setEditingField] = useState(null); // 'title', 'category', 'place'
const [editValue, setEditValue] = useState('');
const [principles, setPrinciples] = useState([]);
const [newPrinciple, setNewPrinciple] = useState('');
const [showPrinciples, setShowPrinciples] = useState(false);
const [notificationPermission, setNotificationPermission] = useState('default');

// Load achieved milestones from Firebase
useEffect(() => {
  const q = query(collection(db, 'milestones'), orderBy('achievedAt', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const milestonesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAchievedMilestones(milestonesData);
  });
  return () => unsubscribe();
}, []);

// Check for new milestones
useEffect(() => {
  if (dates.length === 0) return;

  const newMilestones = checkForMilestones(dates, anniversaryDate);
  
  // Check if any milestone is new
  newMilestones.forEach(async (milestone) => {
    const alreadyAchieved = achievedMilestones.find(m => m.type === milestone.type);
    
    if (!alreadyAchieved) {
      // New milestone! Show it and save to Firebase
      setShowMilestone(milestone);
      
      await addDoc(collection(db, 'milestones'), milestone);
    }
  });
}, [dates, achievedMilestones]);

// Calculate next date for countdown
const nextDate = dates
  .filter(d => new Date(d.date) > new Date())
  .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  // New date form state
  const [newDate, setNewDate] = useState({
    title: '',
    location: '',
    date: '',
    description: '',
    rating: 0,
    category: 'dinner'
  });

  // New invitation form state
  const [newInvite, setNewInvite] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    dressCode: '',
    itinerary: [],
    from: currentUser
  });
  
  const [itineraryItem, setItineraryItem] = useState({ time: '', activity: '' });

  // Load dates from Firebase
  useEffect(() => {
    const q = query(collection(db, 'dates'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDates(datesData);
    });

    return () => unsubscribe();
  }, []);

  // Load invitations from Firebase
  useEffect(() => {
    const q = query(collection(db, 'invitations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invitesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvitations(invitesData);
    });

    return () => unsubscribe();
  }, []);

  // Load wishlist from Firebase
  useEffect(() => {
    const q = query(collection(db, 'wishlist'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wishlistData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWishlist(wishlistData);
    });

    return () => unsubscribe();
  }, []);

  // Load date ideas from Firebase
  useEffect(() => {
    const q = query(collection(db, 'dateIdeas'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDateIdeas(ideasData);
    });

    return () => unsubscribe();
  }, []);

  // Load favorite places from Firebase
  useEffect(() => {
    const q = query(collection(db, 'favoritePlaces'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const placesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFavoritePlaces(placesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load principles from Firebase
  useEffect(() => {
    const q = query(collection(db, 'principles'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const principlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no principles exist, add default ones
      if (principlesData.length === 0 && currentUser) {
        DEFAULT_PRINCIPLES.forEach(async (principle) => {
          await addDoc(collection(db, 'principles'), {
            text: principle,
            createdAt: new Date().toISOString(),
            createdBy: currentUser
          });
        });
      } else {
        setPrinciples(principlesData);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        // We'll ask for permission when user tries to enable notifications
      }
    }
  }, []);

  // Setup notification listeners for new comments, voice notes, and invites
  useEffect(() => {
    if (notificationPermission !== 'granted' || !currentUser) return;

    // Listen for new comments
    const commentsUnsubscribe = onSnapshot(collection(db, 'dates'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const date = change.doc.data();
          const lastComment = date.comments?.[date.comments.length - 1];
          
          if (lastComment && lastComment.author !== currentUser) {
            // New comment from the other person
            sendNotification('New Comment', `${lastComment.author === SIMRAN ? 'Simran' : 'Ayaan'} commented on "${date.title}"`);
          }

          const lastVoiceNote = date.voiceNotes?.[date.voiceNotes.length - 1];
          if (lastVoiceNote && lastVoiceNote.author !== currentUser) {
            // New voice note from the other person
            sendNotification('New Voice Note', `${lastVoiceNote.author === SIMRAN ? 'Simran' : 'Ayaan'} sent a voice note for "${date.title}"`);
          }
        }
      });
    });

    // Listen for new invitations
    const invitesUnsubscribe = onSnapshot(collection(db, 'invitations'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const invite = change.doc.data();
          if (invite.to === currentUser) {
            sendNotification('Date Invitation!', `${invite.from === SIMRAN ? 'Simran' : 'Ayaan'} invited you to "${invite.title}"`);
          }
        }
      });
    });

    return () => {
      commentsUnsubscribe();
      invitesUnsubscribe();
    };
  }, [notificationPermission, currentUser]);

  // Setup 2-hour before date notifications
  useEffect(() => {
    if (notificationPermission !== 'granted' || !currentUser) return;

    const checkUpcomingDates = () => {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      dates.forEach(date => {
        const dateTime = new Date(date.date);
        
        // Check if date is within 2 hours
        if (dateTime > now && dateTime <= twoHoursLater) {
          // Check if we haven't already sent notification for this date
          const notifiedKey = `notified-${date.id}`;
          if (!localStorage.getItem(notifiedKey)) {
            sendNotification('Upcoming Date!', `Your date "${date.title}" is in 2 hours!`);
            localStorage.setItem(notifiedKey, 'true');
          }
        }
      });
    };

    // Check every 5 minutes
    const interval = setInterval(checkUpcomingDates, 5 * 60 * 1000);
    checkUpcomingDates(); // Check immediately

    return () => clearInterval(interval);
  }, [notificationPermission, currentUser, dates]);

  // Calculate time together
  const getTimeTogether = () => {
    const now = new Date();
    const diff = now - anniversaryDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months % 12} month${months % 12 !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}, ${days % 30} day${days % 30 !== 1 ? 's' : ''}`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  // Handle adding a new date
  const handleAddDate = async () => {
    if (!newDate.title || !newDate.date) return;

    try {
      await addDoc(collection(db, 'dates'), {
        ...newDate,
        comments: [],
        photos: [],
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        favorited: false
      });

      setNewDate({ title: '', location: '', date: '', description: '', rating: 0 });
      setShowNewDateForm(false);
      triggerConfetti();
    } catch (error) {
      console.error('Error adding date:', error);
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedDate) return;

    try {
      const dateRef = doc(db, 'dates', selectedDate.id);
      const updatedComments = [
        ...(selectedDate.comments || []),
        {
          text: newComment,
          author: currentUser,
          timestamp: new Date().toISOString()
        }
      ];

      await updateDoc(dateRef, {
        comments: updatedComments
      });

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle photo upload with HEIC conversion
  const handlePhotoUpload = async (e) => {
    if (!selectedDate) return;

    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    try {
      showSuccess(`Processing ${files.length} photo${files.length > 1 ? 's' : ''}...`);
      
      // Process each file
      const processedFiles = [];
      
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const isHEIC = fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';
        
        if (isHEIC) {
          try {
            console.log("Converting HEIC file:", file.name);
            showSuccess('Converting HEIC to JPEG...');
            
            // Try heic2any conversion
            let convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.8
            });
            
            // Handle array result
            if (Array.isArray(convertedBlob)) {
              convertedBlob = convertedBlob[0];
            }
            
            // Create new file
            const convertedFile = new File(
              [convertedBlob],
              file.name.replace(/\.(heic|heif)$/i, '.jpg'),
              { type: 'image/jpeg' }
            );
            
            console.log("HEIC conversion successful:", convertedFile.name);
            processedFiles.push(convertedFile);
            
          } catch (conversionError) {
            console.error('HEIC conversion failed:', conversionError);
            
            // Try to create a data URL as fallback
            try {
              const reader = new FileReader();
              const dataUrl = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
              
              // Create an image to convert
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = dataUrl;
              });
              
              // Draw to canvas and convert to JPEG
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              
              // Convert canvas to blob
              const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
              });
              
              const convertedFile = new File(
                [blob],
                file.name.replace(/\.(heic|heif)$/i, '.jpg'),
                { type: 'image/jpeg' }
              );
              
              console.log("Fallback conversion successful:");
              processedFiles.push(convertedFile);
              
            } catch (fallbackError) {
              console.error('Fallback conversion also failed:', fallbackError);
              showSuccess(`Could not convert ${file.name}. Try changing iPhone settings or use a different photo.`);
              // Skip this file
            }
          }
        } else {
          // Not HEIC, use as-is
          processedFiles.push(file);
        }
      }
      
      if (processedFiles.length === 0) {
        showSuccess('No valid photos to upload');
        return;
      }
      
      // Compress large images
      const imageCompression = (await import('browser-image-compression')).default;
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      
      showSuccess('Optimizing photos...');
      const compressedFiles = await Promise.all(
        processedFiles.map(async (file) => {
          try {
            if (file.size > 1024 * 1024) { // If larger than 1MB
              return await imageCompression(file, compressionOptions);
            }
            return file;
          } catch (e) {
            console.log('Compression skipped for', file.name);
            return file;
          }
        })
      );
      
      // Upload to Firebase
      showSuccess('Uploading photos...');
      const uploadPromises = compressedFiles.map(async (file, index) => {
        const storageRef = ref(storage, `dates/${selectedDate.id}/${Date.now()}_${index}_${file.name}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const photoUrls = await Promise.all(uploadPromises);
      
      // Update Firestore
      const dateRef = doc(db, 'dates', selectedDate.id);
      const updatedPhotos = [
        ...(selectedDate.photos || []),
        ...photoUrls.map(url => ({
          url,
          uploadedBy: currentUser,
          timestamp: new Date().toISOString()
        }))
      ];

      await updateDoc(dateRef, {
        photos: updatedPhotos
      });
      
      showSuccess(`${photoUrls.length} photo${photoUrls.length > 1 ? "s" : ""} uploaded successfully!`);
      
    } catch (error) {
      console.error('Error in photo upload:', error);
      showSuccess('Error uploading photos. Please try again or use different photos.');
    }
  };

  // Toggle favorite
  const toggleFavorite = async (dateId, currentFavorited) => {
    try {
      const dateRef = doc(db, 'dates', dateId);
      await updateDoc(dateRef, {
        favorited: !currentFavorited
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Start editing date details
  const startEditingDate = () => {
    setEditedDescription(selectedDate?.description || '');
    setEditedRating(selectedDate?.rating || 0);
    setIsEditingDate(true);
  };

  // Cancel editing
  const cancelEditingDate = () => {
    setIsEditingDate(false);
    setEditedDescription('');
    setEditedRating(0);
  };

  // Save edited date details
  const saveEditedDate = async () => {
    if (!selectedDate) return;

    try {
      const dateRef = doc(db, 'dates', selectedDate.id);
      await updateDoc(dateRef, {
        description: editedDescription,
        rating: editedRating
      });

      setIsEditingDate(false);
      showSuccess('Date updated!');
    } catch (error) {
      console.error('Error updating date:', error);
      showSuccess('Error updating date. Please try again.');
    }
  };

  // Handle sending invitation
  const handleSendInvitation = async () => {
    if (!newInvite.title || !newInvite.date || !newInvite.startTime) return;

    try {
      await addDoc(collection(db, 'invitations'), {
        ...newInvite,
        from: currentUser,
        to: currentUser === SIMRAN ? AYAAN : SIMRAN,
        status: 'pending',
        createdAt: new Date().toISOString(),
        acceptanceNote: null,
        acceptedAt: null,
        viewedBy: []
      });

      setNewInvite({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        dressCode: '',
        itinerary: [],
        from: currentUser
      });
      setItineraryItem({ time: '', activity: '' });
      setShowNewInvitation(false);
      showSuccess('Invitation sent!');
      triggerConfetti();
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  // Mark invitation as viewed
  const markInvitationViewed = async (inviteId, viewedBy) => {
    try {
      const inviteRef = doc(db, 'invitations', inviteId);
      await updateDoc(inviteRef, {
        viewedBy: [...viewedBy, currentUser]
      });
    } catch (error) {
      console.error('Error marking invitation as viewed:', error);
    }
  };

  // Accept invitation
  const acceptInvitation = async (inviteId, acceptanceNote) => {
    if (!acceptanceNote || !acceptanceNote.trim()) {
      showSuccess('Please add a note about your excitement!');
      return;
    }

    try {
      const inviteRef = doc(db, 'invitations', inviteId);
      
      // Update invitation status
      await updateDoc(inviteRef, {
        status: 'accepted',
        acceptanceNote: acceptanceNote.trim(),
        acceptedAt: new Date().toISOString()
      });

      // Find the invitation to create a date from it
      const invitation = invitations.find(inv => inv.id === inviteId);
      if (invitation) {
        // Create an upcoming date entry
        await addDoc(collection(db, 'dates'), {
          title: invitation.title,
          location: invitation.location,
          date: invitation.date,
          description: invitation.description,
          category: 'upcoming',
          rating: 0,
          comments: [
            {
              text: acceptanceNote.trim(),
              author: invitation.to,
              timestamp: new Date().toISOString(),
              isAcceptanceNote: true
            }
          ],
          photos: [],
          createdBy: invitation.from,
          createdAt: new Date().toISOString(),
          favorited: false,
          fromInvitation: true,
          invitationData: {
            startTime: invitation.startTime,
            endTime: invitation.endTime,
            dressCode: invitation.dressCode,
            itinerary: invitation.itinerary || []
          }
        });
      }

      showSuccess('Invitation accepted!');
      triggerConfetti();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      showSuccess('Error accepting invitation. Please try again.');
    }
  };

  // Delete invitation
  const deleteInvitation = async (inviteId) => {
    try {
      await deleteDoc(doc(db, 'invitations', inviteId));
      showSuccess('Invitation deleted');
    } catch (error) {
      console.error('Error deleting invitation:', error);
    }
  };

  // Add itinerary item
  const handleAddItineraryItem = () => {
    if (!itineraryItem.time || !itineraryItem.activity) return;
    
    setNewInvite({
      ...newInvite,
      itinerary: [...(newInvite.itinerary || []), { ...itineraryItem }]
    });
    setItineraryItem({ time: '', activity: '' });
  };

  // Remove itinerary item
  const handleRemoveItineraryItem = (index) => {
    setNewInvite({
      ...newInvite,
      itinerary: newInvite.itinerary.filter((_, i) => i !== index)
    });
  };

  // Start recording voice note
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      showSuccess('Microphone access denied');
    }
  };

  // Stop recording voice note
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload voice note
  const uploadVoiceNote = async () => {
    if (!audioBlob || !selectedDate) return;

    try {
      const storageRef = ref(storage, `voice-notes/${selectedDate.id}/${Date.now()}.webm`);
      await uploadBytes(storageRef, audioBlob);
      const audioUrl = await getDownloadURL(storageRef);

      const dateRef = doc(db, 'dates', selectedDate.id);
      const updatedVoiceNotes = [
        ...(selectedDate.voiceNotes || []),
        {
          url: audioUrl,
          uploadedBy: currentUser,
          timestamp: new Date().toISOString()
        }
      ];

      await updateDoc(dateRef, {
        voiceNotes: updatedVoiceNotes
      });

      setAudioBlob(null);
      showSuccess("Voice note added!");
    } catch (error) {
      console.error('Error uploading voice note:', error);
    }
  };

  // Play/pause audio
  const toggleAudio = (audioUrl) => {
    const audio = document.getElementById('audio-player');
    if (playingAudio === audioUrl) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      audio.src = audioUrl;
      audio.play();
      setPlayingAudio(audioUrl);
    }
  };

  // Add wishlist item
  const addWishlistItem = async () => {
    if (!newWishlistItem.trim()) return;

    try {
      await addDoc(collection(db, 'wishlist'), {
        title: newWishlistItem,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        completed: false,
        completedBy: null,
        completedAt: null
      });

      setNewWishlistItem('');
      showSuccess("Added to wishlist!");
    } catch (error) {
      console.error('Error adding wishlist item:', error);
    }
  };

  // Toggle wishlist item completion
  const toggleWishlistItem = async (itemId, currentCompleted) => {
    try {
      const itemRef = doc(db, 'wishlist', itemId);
      await updateDoc(itemRef, {
        completed: !currentCompleted,
        completedBy: !currentCompleted ? currentUser : null,
        completedAt: !currentCompleted ? new Date().toISOString() : null
      });
      
      if (!currentCompleted) {
        triggerConfetti();
        showSuccess("Date idea completed!");
      }
    } catch (error) {
      console.error('Error toggling wishlist item:', error);
    }
  };

  // Delete wishlist item
  const deleteWishlistItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'wishlist', itemId));
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };

  // Show success message
  const showSuccess = (message) => {
    setShowSuccessMessage(message);
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  // Handle login
  const handleLogin = (user) => {
    setCurrentUser(user);
    triggerConfetti();
    showSuccess(`Welcome back, ${user === SIMRAN ? "Simran" : "Ayaan"}!`);
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedDate(null);
    setShowNewDateForm(false);
    setShowNewInvitation(false);
    setShowStats(false);
    setShowWishlist(false);
  };

  // Send push notification
  const sendNotification = (title, body) => {
    if (notificationPermission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon.jpg',
          badge: '/icon.jpg',
          tag: `date-app-${Date.now()}`,
          requireInteraction: false
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        showSuccess('Notifications enabled! You\'ll get alerts for new comments, voice notes, and upcoming dates.');
      }
    }
  };

  // Start editing a date field
  const startEditing = (dateId, field, currentValue) => {
    setEditingDateId(dateId);
    setEditingField(field);
    setEditValue(currentValue);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingDateId(null);
    setEditingField(null);
    setEditValue('');
  };

  // Save edited field
  const saveEdit = async () => {
    if (!editingDateId || !editingField || !editValue.trim()) return;

    try {
      const dateRef = doc(db, 'dates', editingDateId);
      await updateDoc(dateRef, {
        [editingField]: editValue
      });
      
      showSuccess(`${editingField.charAt(0).toUpperCase() + editingField.slice(1)} updated!`);
      cancelEditing();
    } catch (error) {
      console.error('Error updating date:', error);
    }
  };

  // Add new principle
  const addPrinciple = async () => {
    if (!newPrinciple.trim()) return;

    try {
      await addDoc(collection(db, 'principles'), {
        text: newPrinciple,
        createdAt: new Date().toISOString(),
        createdBy: currentUser
      });

      setNewPrinciple('');
      showSuccess("Principle added!");
    } catch (error) {
      console.error('Error adding principle:', error);
    }
  };

  // Delete principle
  const deletePrinciple = async (principleId) => {
    try {
      await deleteDoc(doc(db, 'principles', principleId));
      showSuccess("Principle removed");
    } catch (error) {
      console.error('Error deleting principle:', error);
    }
  };

  // Open image gallery
  const openGallery = (photos, startIndex) => {
    setGalleryPhotos(photos);
    setCurrentPhotoIndex(startIndex);
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  // Close gallery
  const closeGallery = () => {
    setGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Navigate gallery
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!galleryOpen) return;
      
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') closeGallery();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [galleryOpen, galleryPhotos]);

  // Touch swipe support
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) nextPhoto();
    if (isRightSwipe) prevPhoto();
  };

  // Download photo
  const downloadPhoto = async (photoUrl, index) => {
    try {
      showSuccess('Downloading photo...');
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `date-photo-${Date.now()}-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess("Photo downloaded!");
    } catch (error) {
      console.error('Error downloading photo:', error);
      showSuccess('Error downloading photo');
    }
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  };

  // Get statistics
  const getStats = () => {
    const totalDates = dates.length;
    const favoriteDates = dates.filter(d => d.favorited).length;
    const totalPhotos = dates.reduce((sum, d) => sum + (d.photos?.length || 0), 0);
    const totalComments = dates.reduce((sum, d) => sum + (d.comments?.length || 0), 0);
    const totalVoiceNotes = dates.reduce((sum, d) => sum + (d.voiceNotes?.length || 0), 0);
    const avgRating = dates.length > 0 
      ? (dates.reduce((sum, d) => sum + (d.rating || 0), 0) / dates.length).toFixed(1)
      : 0;

    return { totalDates, favoriteDates, totalPhotos, totalComments, totalVoiceNotes, avgRating };
  };

  const stats = getStats();
  
  // Filter out past invitations - only show active/future ones
  const pendingInvites = invitations.filter(inv => {
    const inviteDate = new Date(inv.date);
    const now = new Date();
    const isPast = inviteDate < now;
    
    // Only show if not past AND meets existing criteria
    return !isPast && (
      (inv.to === currentUser && inv.status === 'pending') || 
      (inv.from === currentUser && inv.status !== 'declined')
    );
  });
  
  // Filter dates by category
  const filteredDates = selectedCategory === 'all' 
    ? dates 
    : dates.filter(d => d.category === selectedCategory);

  // Show login screen if no user selected
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full animate-fade-in">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Heart className="text-red-500 animate-pulse" size={48} fill="currentColor" />
            </div>
            <h1 className="text-5xl font-bold bg-black bg-clip-text text-transparent mb-2">
              Date Time
            </h1>
            <p className="text-gray-600">Select your profile to continue</p>
          </div>

          {/* Profile Cards */}
          <div className="space-y-4">
            {/* Simran Card */}
            <button
              onClick={() => {triggerHaptic('success'); handleLogin(SIMRAN);}}
              className="w-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  S
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Simran</h2>
                  <p className="text-gray-600">Tap to enter</p>
                </div>
                <ChevronLeft className="transform rotate-180 text-pink-500 group-hover:translate-x-1 transition-transform" size={28} />
              </div>
            </button>

            {/* Ayaan Card */}
            <button
              onClick={() => {triggerHaptic('success'); handleLogin(AYAAN)}}
              className="w-full bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-teal-300 flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  A
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Ayaan</h2>
                  <p className="text-gray-600">Tap to enter</p>
                </div>
                <ChevronLeft className="transform rotate-180 text-blue-500 group-hover:translate-x-1 transition-transform" size={28} />
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>Always and Forever. Love you dingo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 1}s`
              }}
            >
              <Heart className="text-pink-500" size={16} fill="currentColor" />
            </div>
          ))}
        </div>
      )}

      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slide-in-right">
          <p className="font-semibold">{showSuccessMessage}</p>
        </div>
      )}

      {/* Hidden Audio Player */}
      <audio id="audio-player" onEnded={() => setPlayingAudio(null)} />

      {/* Full-Screen Image Gallery */}
      {galleryOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all z-10"
          >
            <X size={24} />
          </button>

          {/* Download Button */}
          <button
            onClick={() => {triggerHaptic('light'); downloadPhoto(galleryPhotos[currentPhotoIndex].url, currentPhotoIndex);}}
            className="absolute top-4 left-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all z-10"
          >
            <Download size={24} />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm z-10">
            {currentPhotoIndex + 1} / {galleryPhotos.length}
          </div>

          {/* Previous Button */}
          {galleryPhotos.length > 1 && (
            <button
              onClick={prevPhoto}
              className="absolute left-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all z-10"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Image */}
          <div className="max-w-7xl max-h-screen w-full h-full flex items-center justify-center p-4">
            <img
              src={galleryPhotos[currentPhotoIndex]?.url}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg animate-fade-in"
              style={{ animationDuration: '0.2s' }}
            />
          </div>

          {/* Next Button */}
          {galleryPhotos.length > 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all z-10"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Photo Info */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-6 py-3 rounded-2xl text-sm z-10">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                galleryPhotos[currentPhotoIndex]?.uploadedBy === SIMRAN
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  : 'bg-gradient-to-br from-blue-200 to-teal-300'
              }`}>
                {galleryPhotos[currentPhotoIndex]?.uploadedBy === SIMRAN ? 'S' : 'A'}
              </div>
              <span>
                Uploaded by {galleryPhotos[currentPhotoIndex]?.uploadedBy === SIMRAN ? 'Simran' : 'Ayaan'}
              </span>
              <span className="opacity-60">-</span>
              <span className="opacity-80">
                {new Date(galleryPhotos[currentPhotoIndex]?.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Swipe Instructions (Mobile) */}
          {galleryPhotos.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-50 z-10 md:hidden">
              Swipe to navigate
            </div>
          )}
        </div>
      )}

      {/* User Info & Logout */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
        <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
            currentUser === SIMRAN
              ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
              : 'bg-gradient-to-br from-blue-200 to-teal-300'
          }`}>
            {currentUser === SIMRAN ? 'S' : 'A'}
          </div>
          <span className="font-semibold text-gray-900">
            {currentUser === SIMRAN ? 'Simran' : 'Ayaan'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-lg px-4 py-2 font-medium transition-all hover:shadow-xl"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      {!selectedDate && !showNewDateForm && !showNewInvitation && !showStats && !showWishlist ? (
        <div className="max-w-md mx-auto p-6 pb-24">
          {/* Header with Countdown */}
          <div className="text-center mb-8 mt-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-3">
              <Heart className="text-red-500 animate-pulse" size={32} fill="currentColor" />
              <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent">
                Date Time
              </h1>
              <Heart className="text-red-500 animate-pulse" size={32} fill="currentColor" />
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <p className="text-gray-600 text-sm mb-2">Together for</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {getTimeTogether()}
              </p>
              <p className="text-gray-600 text-sm mb-2">Only U since april 29, 2023</p>
            </div>
          </div>

          {nextDate && (
            <CountdownTimer 
              targetDate={nextDate.date}
              eventName={nextDate.title}
            />
          )}

          {/* Notification Permission Banner */}
          {notificationPermission !== 'granted' && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 mb-4 shadow-lg animate-slide-down">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔔</div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Enable Notifications</h3>
                  <p className="text-sm opacity-90 mb-2">Get notified about new comments, voice notes, date invites, and upcoming dates!</p>
                  <button
                    onClick={requestNotificationPermission}
                    className="bg-white text-amber-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all"
                  >
                    Enable Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Relationship Principles Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Heart size={20} className="text-red-500" fill="currentColor" />
                Our Principles
              </h3>
              <button
                onClick={() => setShowPrinciples(!showPrinciples)}
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                {showPrinciples ? 'Hide' : 'Show'}
              </button>
            </div>

            {showPrinciples && (
              <div className="space-y-3">
                {principles.map((principle, index) => (
                  <div
                    key={principle.id}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-gray-700 text-sm leading-relaxed">{principle.text}</p>
                    <button
                      onClick={() => deletePrinciple(principle.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {/* Add new principle */}
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    placeholder="Add a new principle..."
                    value={newPrinciple}
                    onChange={(e) => setNewPrinciple(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPrinciple()}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={addPrinciple}
                    disabled={!newPrinciple.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            )}

            {!showPrinciples && principles.length > 0 && (
              <p className="text-gray-600 text-sm">
                {principles.length} principle{principles.length !== 1 ? 's' : ''} • Click "Show" to view
              </p>
            )}
          </div>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <div className="mb-6 animate-slide-up space-y-4">
              {pendingInvites.map((invite) => (
                <InvitationCard 
                  key={invite.id}
                  invite={invite}
                  currentUser={currentUser}
                  onAccept={acceptInvitation}
                  onDelete={deleteInvitation}
                />
              ))}
            </div>
          )}

          {/* Stats Button */}
          <button
            onClick={() => {triggerHaptic('success'); setShowStats(true);}}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-4 mb-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} />
                <span className="font-semibold">View Our Stats</span>
              </div>
              <div className="text-right text-sm opacity-90">
                <div>{stats.totalDates} dates</div>
                <div>{stats.totalPhotos} photos</div>
              </div>
            </div>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => {triggerHaptic('success'); setShowWishlist(true);}}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-2xl p-4 mb-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lightbulb size={24} />
                <span className="font-semibold">Date Ideas Wishlist</span>
              </div>
              <div className="text-right text-sm opacity-90">
                <div>{wishlist.filter(w => !w.completed).length} pending</div>
                <div>{wishlist.filter(w => w.completed).length} done</div>
              </div>
            </div>
          </button>

          {/* Date Roulette Button */}
          <button
            onClick={() => { triggerHaptic('success'); setShowDateRoulette(true); }}
            className="w-full bg-gradient-to-r from-blue-950 to-purple-200 text-white rounded-2xl p-4 mb-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shuffle size={24} />
                <span className="font-semibold">Date Night Roulette</span>
              </div>
              <div className="text-right text-sm opacity-90">
                <div>{dateIdeas.length + DEFAULT_DATE_IDEAS.length} ideas</div>
              </div>
            </div>
          </button>

          {/* Favorites Button */}
          <button
            onClick={() => { triggerHaptic('success'); setShowFavorites(true); }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 mb-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin size={24} />
                <span className="font-semibold">Favourite Places</span>
              </div>
              <div className="text-right text-sm opacity-90">
                <div>{favoritePlaces.length} places</div>
              </div>
            </div>
          </button>

          {/* Category Filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {['all', 'dinner', 'movie', 'adventure', 'stay-in', 'other'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-pink-300 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Cards */}
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {filteredDates.map((date, index) => (
              <div
                key={date.id}
                onClick={() => {
                  setSelectedDate(date);
                  setIsEditingDate(false);
                }}
                className="glass-card rounded-2xl p-5 hover-lift smooth-transition cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{date.title}</h3>
                      {date.category && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                          {date.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(date.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      triggerHaptic('success');
                      e.stopPropagation();
                      toggleFavorite(date.id, date.favorited);
                    }}
                    className="text-yellow-500 hover:scale-125 transition-transform"
                  >
                    <Star size={24} fill={date.favorited ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {date.location && (
                  <p className="text-sm text-gray-700 mb-2">📍 {date.location}</p>
                )}

                {date.rating > 0 && (
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Heart
                        key={i}
                        size={16}
                        fill={i < date.rating ? '#ec4899' : 'none'}
                        className={i < date.rating ? 'text-pink-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                )}

                {date.photos && date.photos.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {date.photos.slice(0, 3).map((photo, i) => (
                      <img
                        key={i}
                        src={photo.url}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ))}
                    {date.photos.length > 3 && (
                      <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        +{date.photos.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Camera size={14} />
                    {date.photos?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    {date.comments?.length || 0}
                  </span>
                  {date.voiceNotes && date.voiceNotes.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Mic size={14} />
                      {date.voiceNotes.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}

          {!isLoading && filteredDates.length === 0 && dates.length > 0 && (
            <div className="text-center py-12 text-gray-500">
              <Heart size={48} className="mx-auto mb-4 opacity-50" />
              <p>No dates in this category yet</p>
            </div>
          )}

          {!isLoading && dates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Heart size={48} className="mx-auto mb-4 opacity-50" />
              <p>No dates yet. Create your first memory</p>
            </div>
          )}
        </div>
      ) : showStats ? (
        /* Stats View */
        <div className="max-w-md mx-auto p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6 mt-16">
            <button
              onClick={() => {triggerHaptic('success'); setShowStats(false);}}
              className="p-2 hover:bg-white rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">Our Statistics</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stats.totalDates}
              </div>
              <div className="text-sm text-gray-600">Total Dates</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-300 to-pink-500 bg-clip-text text-transparent mb-2">
                {stats.favoriteDates}
              </div>
              <div className="text-sm text-gray-600">Favorites</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {stats.totalPhotos}
              </div>
              <div className="text-sm text-gray-600">Photos</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {stats.totalComments}
              </div>
              <div className="text-sm text-gray-600">Comments</div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg col-span-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {stats.totalVoiceNotes}
              </div>
              <div className="text-sm text-gray-600">Voice Notes</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="font-semibold mb-4">Average Rating</h3>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                {stats.avgRating}
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Heart
                    key={i}
                    size={20}
                    fill={i < Math.round(stats.avgRating) ? '#ec4899' : 'none'}
                    className={i < Math.round(stats.avgRating) ? 'text-pink-500' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
          </div>

          {stats.totalDates > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold mb-4">Recent Highlights</h3>
              <div className="space-y-3">
                {dates.slice(0, 5).map((date) => (
                  <div
                    key={date.id}
                    onClick={() => {
                      setShowStats(false);
                      setSelectedDate(date);
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                  >
                    {date.photos && date.photos.length > 0 ? (
                      <img
                        src={date.photos[0].url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                        <Heart size={20} fill="#ec4899" className="text-pink-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{date.title}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(date.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    {date.favorited && (
                      <Star size={16} fill="#eab308" className="text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : showNewDateForm ? (
        /* New Date Form */
        <div className="max-w-md mx-auto p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6 mt-16">
            <button
              onClick={() => setShowNewDateForm(false)}
              className="p-2 hover:bg-white rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">New Date Memory</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
            <input
              type="text"
              placeholder="Date title *"
              value={newDate.title}
              onChange={(e) => setNewDate({ ...newDate, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-all"
            />

            <input
              type="date"
              value={newDate.date}
              onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-all"
            />

            <input
              type="text"
              placeholder="Location"
              value={newDate.location}
              onChange={(e) => setNewDate({ ...newDate, location: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-all"
            />

            <select
              value={newDate.category}
              onChange={(e) => setNewDate({ ...newDate, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-all"
            >
              <option value="dinner">🍝 Dinner</option>
              <option value="movie">🎥 Movie</option>
              <option value="adventure">🛍️ Adventure</option>
              <option value="stay-in">🏠 Stay In</option>
              <option value="other">🕺 Other</option>
            </select>

            <textarea
              placeholder="Description"
              value={newDate.description}
              onChange={(e) => setNewDate({ ...newDate, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none transition-all"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setNewDate({ ...newDate, rating })}
                    className="transition-transform hover:scale-125"
                  >
                    <Heart
                      size={32}
                      fill={rating <= newDate.rating ? '#ec4899' : 'none'}
                      className={rating <= newDate.rating ? 'text-pink-500' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddDate}
              disabled={!newDate.title || !newDate.date}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Memory
            </button>
          </div>
        </div>
      ) : showWishlist ? (
        /* Wishlist View */
        <div className="max-w-md mx-auto p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6 mt-16">
            <button
              onClick={() => setShowWishlist(false)}
              className="p-2 hover:bg-white rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">Date Ideas Wishlist</h2>
          </div>

          {/* Add new wishlist item */}
          <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a date idea..."
                value={newWishlistItem}
                onChange={(e) => setNewWishlistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWishlistItem()}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
              />
              <button
                onClick={addWishlistItem}
                disabled={!newWishlistItem.trim()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Pending Ideas */}
          {wishlist.filter(w => !w.completed).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Pending Ideas</h3>
              <div className="space-y-3">
                {wishlist.filter(w => !w.completed).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleWishlistItem(item.id, item.completed)}
                        className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 hover:border-green-500 transition-all"
                      />
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Added by {item.createdBy === SIMRAN ? 'Simran' : 'Ayaan'} {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteWishlistItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Ideas */}
          {wishlist.filter(w => w.completed).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Completed</h3>
              <div className="space-y-3">
                {wishlist.filter(w => w.completed).map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleWishlistItem(item.id, item.completed)}
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-all"
                      >
                        <Check size={16} className="text-white" />
                      </button>
                      <div className="flex-1">
                        <p className="text-gray-600 line-through">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Completed by {item.completedBy === SIMRAN ? 'Simran' : 'Ayaan'} {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteWishlistItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wishlist.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
              <p>No date ideas yet!</p>
              <p className="text-sm mt-2">Add some ideas for future dates</p>
            </div>
          )}
        </div>
      ) : showNewInvitation ? (
        /* New Invitation Form */
        <div className="max-w-md mx-auto p-6 animate-fade-in pb-24">
          <div className="flex items-center gap-3 mb-6 mt-16">
            <button
              onClick={() => setShowNewInvitation(false)}
              className="p-2 hover:bg-white rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">Send Invitation</h2>
          </div>

          <div className="space-y-6">
            {/* Basic Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                Event Details
              </h3>
              
              <input
                type="text"
                placeholder="Event title *"
                value={newInvite.title}
                onChange={(e) => setNewInvite({ ...newInvite, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
              />

              <input
                type="date"
                value={newInvite.date}
                onChange={(e) => setNewInvite({ ...newInvite, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block pl-1">Start Time *</label>
                  <input
                    type="time"
                    value={newInvite.startTime}
                    onChange={(e) => setNewInvite({ ...newInvite, startTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block pl-1">End Time</label>
                  <input
                    type="time"
                    value={newInvite.endTime}
                    onChange={(e) => setNewInvite({ ...newInvite, endTime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Location"
                value={newInvite.location}
                onChange={(e) => setNewInvite({ ...newInvite, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
              />

              <input
                type="text"
                placeholder="Dress Code (e.g., Casual, Formal, Cozy)"
                value={newInvite.dressCode}
                onChange={(e) => setNewInvite({ ...newInvite, dressCode: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all"
              />

              <textarea
                placeholder="Special message or description..."
                value={newInvite.description}
                onChange={(e) => setNewInvite({ ...newInvite, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none resize-none transition-all"
              />
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                Itinerary (Optional)
              </h3>

              {newInvite.itinerary && newInvite.itinerary.length > 0 && (
                <div className="space-y-2 mb-4">
                  {newInvite.itinerary.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-amber-900">{item.time}</div>
                        <div className="text-sm text-gray-700">{item.activity}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveItineraryItem(index)}
                        className="p-1 hover:bg-amber-100 rounded-full transition-all"
                      >
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="time"
                    placeholder="Time"
                    value={itineraryItem.time}
                    onChange={(e) => setItineraryItem({ ...itineraryItem, time: e.target.value })}
                    className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-all text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Activity"
                    value={itineraryItem.activity}
                    onChange={(e) => setItineraryItem({ ...itineraryItem, activity: e.target.value })}
                    className="col-span-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-all text-sm"
                  />
                </div>
                <button
                  onClick={handleAddItineraryItem}
                  disabled={!itineraryItem.time || !itineraryItem.activity}
                  className="w-full py-2 border-2 border-amber-500 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendInvitation}
              disabled={!newInvite.title || !newInvite.date || !newInvite.startTime}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Send Invitation to {currentUser === SIMRAN ? 'Ayaan' : 'Simran'}
            </button>
          </div>
        </div>
      ) : (
        /* Date Detail View */
        <div className="max-w-md mx-auto p-6 pb-24 animate-fade-in">
          <div className="flex items-center gap-3 mb-6 mt-16">
            <button
              onClick={() => {
                setSelectedDate(null);
                setIsEditingDate(false);
              }}
              className="p-2 hover:bg-white rounded-full transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold flex-1">{selectedDate?.title}</h2>
            <button
              onClick={() => toggleFavorite(selectedDate.id, selectedDate.favorited)}
              className="p-2 hover:bg-white rounded-full transition-all"
            >
              <Star 
                size={24} 
                fill={selectedDate?.favorited ? '#eab308' : 'none'} 
                className={selectedDate?.favorited ? 'text-yellow-500' : 'text-gray-400'}
              />
            </button>
          </div>

          {/* Date Info */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="space-y-4">
              {/* Title - Inline Editable */}
              <div>
                {editingDateId === selectedDate?.id && editingField === 'title' ? (
                  <div className="space-y-2">
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full px-4 py-3 border-2 border-pink-500 rounded-xl focus:outline-none text-xl font-bold" autoFocus />
                    <div className="flex gap-2">
                      <button onClick={cancelEditing} className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
                      <button onClick={saveEdit} className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm font-medium">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <h3 className="text-xl font-bold text-gray-900">{selectedDate?.title}</h3>
                    <button onClick={() => startEditing(selectedDate?.id, 'title', selectedDate?.title)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-pink-50 rounded-lg transition-all"><Edit2 size={16} className="text-pink-500" /></button>
                  </div>
                )}
              </div>

              {/* Category - Inline Editable */}
              <div>
                {editingDateId === selectedDate?.id && editingField === 'category' ? (
                  <div className="space-y-2">
                    <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full px-4 py-3 border-2 border-pink-500 rounded-xl focus:outline-none" autoFocus>
                      <option value="dinner">🍽️ Dinner</option>
                      <option value="movie">🎥 Movie</option>
                      <option value="adventure">🏕️ Adventure</option>
                      <option value="stay-in">🏠 Stay In</option>
                      <option value="other">😋 Other</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={cancelEditing} className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
                      <button onClick={saveEdit} className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm font-medium">Save</button>
                    </div>
                  </div>
                ) : selectedDate?.category ? (
                  <div className="flex items-center gap-2 group">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">{selectedDate.category}</span>
                    <button onClick={() => startEditing(selectedDate?.id, 'category', selectedDate?.category)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-pink-50 rounded transition-all"><Edit2 size={14} className="text-pink-500" /></button>
                  </div>
                ) : (
                  <button onClick={() => startEditing(selectedDate?.id, 'category', 'dinner')} className="text-gray-400 hover:text-pink-500 text-sm flex items-center gap-1"><Plus size={14} />Add category</button>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={18} />
                <span>{new Date(selectedDate?.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              {/* Location - Inline Editable */}
              <div>
                {editingDateId === selectedDate?.id && editingField === 'location' ? (
                  <div className="space-y-2">
                    <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="Add location..." className="w-full px-4 py-3 border-2 border-pink-500 rounded-xl focus:outline-none" autoFocus />
                    <div className="flex gap-2">
                      <button onClick={cancelEditing} className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
                      <button onClick={saveEdit} className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm font-medium">Save</button>
                    </div>
                  </div>
                ) : selectedDate?.location ? (
                  <div className="flex items-center gap-2 group">
                    <MapPin size={18} className="text-gray-600" />
                    <span className="text-gray-700">{selectedDate.location}</span>
                    <button onClick={() => startEditing(selectedDate?.id, 'location', selectedDate?.location)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-pink-50 rounded transition-all"><Edit2 size={14} className="text-pink-500" /></button>
                  </div>
                ) : (
                  <button onClick={() => startEditing(selectedDate?.id, 'location', '')} className="flex items-center gap-2 text-gray-400 hover:text-pink-500 text-sm transition-all"><MapPin size={16} /><span>Add location</span></button>
                )}
              </div>
            </div>

              {/* Rating Section - Editable */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Rating:</span>
                </div>
                {isEditingDate ? (
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setEditedRating(i + 1)}
                        className="transition-transform hover:scale-110"
                      >
                        <Heart
                          size={28}
                          fill={i < editedRating ? '#ec4899' : 'none'}
                          className={`${i < editedRating ? 'text-pink-500' : 'text-gray-300'} cursor-pointer`}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-1">
                    {selectedDate?.rating > 0 ? (
                      [...Array(5)].map((_, i) => (
                        <Heart
                          key={i}
                          size={20}
                          fill={i < selectedDate.rating ? '#ec4899' : 'none'}
                          className={i < selectedDate.rating ? 'text-pink-500' : 'text-gray-300'}
                        />
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">No rating yet - click edit to add one!</span>
                    )}
                  </div>
                )}
              </div>

              {/* Description Section - Editable */}
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Description:</span>
                </div>
                {isEditingDate ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Add details about this date..."
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none transition-all"
                  />
                ) : (
                  <>
                    {selectedDate?.description ? (
                      <p className="text-gray-700">{selectedDate.description}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No description yet - click edit to add one!</p>
                    )}
                  </>
                )}
              </div>

              {/* Edit Mode Actions */}
              {isEditingDate && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={cancelEditingDate}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEditedDate}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      currentUser === SIMRAN
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        : 'bg-gradient-to-r from-blue-200 to-teal-300'
                    } text-white hover:shadow-lg`}
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Created by {selectedDate?.createdBy === SIMRAN ? 'Simran' : 'Ayaan'} {new Date(selectedDate?.createdAt).toLocaleDateString()}
            </div>

          {/* Photos Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera size={20} />
                Photos ({selectedDate?.photos?.length || 0})
              </h3>
              <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
                <Plus size={16} />
                Add
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif,.heic,.heif"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {selectedDate?.photos && selectedDate.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {selectedDate.photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer"
                    onClick={() => openGallery(selectedDate.photos, index)}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-40 object-cover rounded-xl transition-all group-hover:brightness-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <ImageIcon size={24} className="text-gray-700" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {photo.uploadedBy === SIMRAN ? 'S' : 'A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No photos yet</p>
              </div>
            )}
          </div>

          {/* Voice Notes Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mic size={20} />
              Voice Notes ({selectedDate?.voiceNotes?.length || 0})
            </h3>

            {selectedDate?.voiceNotes && selectedDate.voiceNotes.length > 0 && (
              <div className="space-y-3 mb-4">
                {selectedDate.voiceNotes.map((note, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      note.uploadedBy === SIMRAN
                        ? 'bg-gradient-to-r from-pink-100 to-rose-100'
                        : 'bg-gradient-to-r from-blue-100 to-indigo-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                          note.uploadedBy === SIMRAN
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : 'bg-gradient-to-r from-blue-200 to-teal-300'
                        }`}>
                          {note.uploadedBy === SIMRAN ? 'S' : 'A'}
                        </div>
                        <span className="text-sm font-medium">
                          {note.uploadedBy === SIMRAN ? 'Simran' : 'Ayaan'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(note.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleAudio(note.url)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        playingAudio === note.url
                          ? 'bg-white shadow-md'
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    >
                      {playingAudio === note.url ? (
                        <Pause size={20} />
                      ) : (
                        <Play size={20} />
                      )}
                      <span className="text-sm font-medium">
                        {playingAudio === note.url ? 'Playing...' : 'Play Voice Note'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Recording Controls */}
            <div className="space-y-3">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Mic size={20} />
                  Start Recording
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <MicOff size={20} />
                  Stop Recording
                </button>
              )}

              {audioBlob && !isRecording && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAudioBlob(null)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={uploadVoiceNote}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Save Voice Note
                  </button>
                </div>
              )}
            </div>

            {selectedDate?.voiceNotes?.length === 0 && !isRecording && !audioBlob && (
              <div className="text-center py-4 text-gray-400">
                <Mic size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No voice notes yet</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Comments ({selectedDate?.comments?.length || 0})
            </h3>

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {selectedDate?.comments && selectedDate.comments.length > 0 ? (
                selectedDate.comments.map((comment, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl ${
                      comment.author === SIMRAN
                        ? 'bg-gradient-to-r from-pink-100 to-rose-100 ml-4'
                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 mr-4'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        comment.author === SIMRAN
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : 'bg-gradient-to-r from-blue-200 to-teal-300'
                      }`}>
                        {comment.author === SIMRAN ? 'S' : 'A'}
                      </div>
                      <span className="text-sm font-medium">
                        {comment.author === SIMRAN ? 'Simran' : 'Ayaan'}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(comment.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-all"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentUser === SIMRAN
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    : 'bg-gradient-to-r from-blue-300 to-teal-200'
                } text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      {!selectedDate && !showNewDateForm && !showNewInvitation && !showStats && !showWishlist && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <button
            onClick={() => setShowNewInvitation(true)}
            className="w-14 h-14 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          >
            <Send size={24} />
          </button>
          <button
            onClick={() => setShowNewDateForm(true)}
            className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          >
            <Plus size={28} />
          </button>
        </div>
      )}

      {/* Date Roulette Modal */}
      {showDateRoulette && (
        <DateRoulette
          customIdeas={dateIdeas}
          onClose={() => setShowDateRoulette(false)}
          currentUser={currentUser}
        />
      )}

      {/* Favorite Places Modal */}
      {showFavorites && (
        <FavoritePlaces
          places={favoritePlaces}
          onClose={() => setShowFavorites(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}