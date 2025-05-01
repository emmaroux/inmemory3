'use client';

import { useState, useEffect, useCallback } from 'react';
import ResourceGrid from './components/resources/ResourceGrid';
import ResourceModal from './components/resources/ResourceModal';
import { Resource } from './types';
import Pagination from './components/common/Pagination';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { useApi } from './services/api';

interface ApiResponse {
  data: Array<{
    id: number;
    attributes: {
      title: string;
      description: string;
      imageUrl: string | null;
      link: string | null;
      isPublic: boolean;
      author: {
        data: {
          attributes: any;
        };
      };
      teams: {
        data: Array<{
          id: number;
          attributes: {
            name: string;
            color: string;
            isWelcomeTeam: boolean;
          };
        }>;
      };
      votes: {
        data: Array<{
          id: number;
          attributes: {
            value: number;
            date: string;
            author: {
              data: {
                attributes: any;
              };
            };
            team: {
              data: {
                attributes: any;
              };
            };
            resource: {
              data: {
                attributes: any;
              };
            };
          };
        }>;
      };
      comments: {
        data: Array<{
          id: number;
          attributes: {
            content: string;
            date: string;
            author: {
              data: {
                attributes: any;
              };
            };
            team: {
              data: {
                attributes: any;
              };
            };
            resource: {
              data: {
                attributes: any;
              };
            };
          };
        }>;
      };
    };
  }>;
  meta: {
    pagination?: {
      pageCount: number;
    };
  };
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12);
  const { user, token } = useAuth();
  const router = useRouter();
  const api = useApi();

  // Vérification de la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      if (!user || !token) {
        router.push('/auth/signin');
      }
    };
    checkSession();
  }, [user, token, router]);

  const handleCloseDetail = () => {
    setSelectedResource(null);
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const fetchData = useCallback(async () => {
    setLoadingState('loading');
    try {
      if (!user?.id || !token) {
        console.log('Données utilisateur:', { user, token });
        throw new Error('Utilisateur non connecté');
      }

      // Mise à jour de l'URL pour correspondre à la nouvelle route
      const resourcesUrl = `/api/teams/resources?userId=${user.id}&populate[author]=*&populate[teams]=*&populate[votes]=*&populate[comments]=*`;

      console.log('Tentative de récupération des ressources avec:', {
        url: resourcesUrl,
        userId: user.id
      });

      const resourcesData = await api.get<ApiResponse>(resourcesUrl);
      console.log('Données reçues de l\'API:', resourcesData);
      
      let formattedResources: Resource[] = [];
      
      if (Array.isArray(resourcesData.data)) {
        formattedResources = resourcesData.data
          .map((item) => {
            if (!item) {
              console.error('Structure invalide:', item);
              return null;
            }

            const resource = item.attributes;
            console.log('Traitement de la ressource:', resource);

            return {
              id: item.id,
              title: resource.title || 'Sans titre',
              description: resource.description || '',
              imageUrl: resource.imageUrl || null,
              link: resource.link || null,
              isPublic: resource.isPublic || false,
              author: resource.author?.data?.attributes || null,
              teams: (resource.teams?.data || []).map((team) => ({
                id: team.id,
                name: team.attributes.name || '',
                color: team.attributes.color || '',
                isWelcomeTeam: team.attributes.isWelcomeTeam || false
              })),
              votes: (resource.votes?.data || []).map((vote) => ({
                id: vote.id,
                value: vote.attributes.value || 0,
                date: vote.attributes.date,
                author: vote.attributes.author?.data?.attributes || null,
                team: vote.attributes.team?.data?.attributes || null,
                resource: vote.attributes.resource?.data?.attributes || null
              })),
              comments: (resource.comments?.data || []).map((comment) => ({
                id: comment.id,
                content: comment.attributes.content || '',
                date: comment.attributes.date,
                author: comment.attributes.author?.data?.attributes || null,
                team: comment.attributes.team?.data?.attributes || null,
                resource: comment.attributes.resource?.data?.attributes || null
              }))
            };
          })
          .filter((resource): resource is Resource => resource !== null);
      }
      
      console.log('Ressources formatées:', formattedResources);
      setResources(formattedResources);
      setTotalPages(resourcesData.meta?.pagination?.pageCount || 1);
      setError(null);
      setLoadingState('complete');
    } catch (err) {
      console.error('Erreur détaillée lors du chargement des données:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoadingState('complete');
    }
  }, [currentPage, pageSize, user, token, api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Ressources InMemory</h1>

      {error ? (
        <div className="text-red-500 text-center my-4">{error}</div>
      ) : loadingState !== 'complete' ? (
        <div className="text-center my-4">Chargement...</div>
      ) : resources.length === 0 ? (
        <div className="text-center my-4">Aucune ressource trouvée</div>
      ) : (
        <>
          <ResourceGrid
            resources={resources}
            onResourceClick={handleResourceClick}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {selectedResource && (
        <ResourceModal
          resource={selectedResource}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
