'use client';

import { Resource } from '@/app/types';
import Image from 'next/image';
import { useState } from 'react';
import { formatDate } from '../../utils/date';

interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

const getInitials = (title: string): string => {
  return title
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = (text: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-orange-500'
  ];
  const index = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default function ResourceModal({ resource, onClose }: ResourceModalProps) {
  const [imageError, setImageError] = useState(false);
  const categoryName = resource.category?.name || 'Non catégorisé';
  const totalVotes = resource.votes?.length || 0;
  
  const initials = getInitials(resource.title || 'Resource');
  const bgColor = getRandomColor(resource.title || 'Resource');
  
  const date = new Date(resource.publishedAt);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{resource.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Fermer</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Informations de base */}
            <div>
              <p className="text-gray-600">{resource.description}</p>
              {resource.link && (
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-2 block"
                >
                  Voir la ressource
                </a>
              )}
            </div>

            {/* Image */}
            {resource.imageUrl && (
              <div className="mt-4">
                <img
                  src={resource.imageUrl}
                  alt={resource.title}
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}

            {/* Auteur et équipes */}
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Partagé par {resource.author?.username || 'Anonyme'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {resource.teams.map((team) => (
                  <span
                    key={team.id}
                    className="px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: team.color, color: '#fff' }}
                  >
                    {team.name}
                    {team.isWelcomeTeam && ' (Welcome)'}
                  </span>
                ))}
              </div>
            </div>

            {/* Votes */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Votes ({resource.votes.length})</h3>
              <div className="space-y-2">
                {resource.votes.map((vote) => (
                  <div key={vote.id} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{vote.author?.username || 'Anonyme'}</span>
                    <span className="text-gray-600">a donné</span>
                    <span className="font-bold">{vote.value}/5</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">{formatDate(vote.date)}</span>
                    <span className="text-gray-600">•</span>
                    <span
                      className="px-2 py-0.5 rounded text-sm"
                      style={{ backgroundColor: vote.team?.color, color: '#fff' }}
                    >
                      {vote.team?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Commentaires */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Commentaires ({resource.comments.length})</h3>
              <div className="space-y-4">
                {resource.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{comment.author?.username || 'Anonyme'}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-600">{formatDate(comment.date)}</span>
                      <span className="text-gray-600">•</span>
                      <span
                        className="px-2 py-0.5 rounded text-sm"
                        style={{ backgroundColor: comment.team?.color, color: '#fff' }}
                      >
                        {comment.team?.name}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 