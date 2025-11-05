import React, { useState } from 'react';
import { Calendar, Clock, Heart, Check, X, Trash2 } from 'lucide-react';

const SIMRAN = 'simran';
const AYAAN = 'ayaan';

export function InvitationCard({ invite, currentUser, onAccept, onDelete }) {
  const [acceptanceNote, setAcceptanceNote] = useState('');
  const isReceiver = invite.to === currentUser;
  const isSender = invite.from === currentUser;
  const isAccepted = invite.status === 'accepted';

  return (
    <div className={`rounded-2xl p-6 shadow-lg relative overflow-hidden ${
      isAccepted 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
        : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200'
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
              Share your excitement! 💕
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