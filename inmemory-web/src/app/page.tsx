'use client';

import { useState, useEffect, useCallback } from 'react';
import ResourceGrid from './components/resources/ResourceGrid';
import ResourceModal from './components/resources/ResourceModal';
import { Resource, StrapiResponse } from './types';
import Pagination from './components/common/Pagination';
import { getSession } from './utils/session';

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12);

  const handleCloseDetail = () => {
    setSelectedResource(null);
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
  };

  const fetchData = useCallback(async () => {
    setLoadingState('loading');
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    try {
      // Récupérer la session utilisateur
      const session = await getSession();
      
      if (!session?.user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      let resourcesUrl = `${apiUrl}/api/resources/user/${session.user.id}?pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}&populate[teams]=true&populate[author]=true&populate[votes][populate][author]=true&populate[votes][populate][team]=true&populate[comments][populate][author]=true&populate[comments][populate][team]=true`;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.jwt) {
        headers.Authorization = `Bearer ${session.jwt}`;
      }

      console.log('Fetching resources from URL:', resourcesUrl);
      const resourcesResponse = await fetch(resourcesUrl, {
        headers,
        cache: 'no-store'
      });
      
      if (!resourcesResponse.ok) {
        throw new Error(`Erreur HTTP: ${resourcesResponse.status}`);
      }
      
      const resourcesData = await resourcesResponse.json();
      console.log('Raw resources data:', JSON.stringify(resourcesData, null, 2));
      
      let formattedResources: Resource[] = [];
      
      if (Array.isArray(resourcesData.data)) {
        formattedResources = resourcesData.data.map((item: any) => {
          console.log('Processing item:', JSON.stringify(item, null, 2));
          
          if (!item) {
            console.error('Invalid item structure:', item);
            return null;
          }

          const resource = item.attributes || item;

          return {
            id: item.id,
            title: resource.title || 'Sans titre',
            description: resource.description || '',
            imageUrl: resource.imageUrl || null,
            link: resource.link || null,
            isPublic: resource.isPublic || false,
            author: resource.author?.data?.attributes || null,
            teams: (resource.teams?.data || []).map((team: any) => ({
              id: team.id,
              name: team.attributes.name || '',
              color: team.attributes.color || '',
              isWelcomeTeam: team.attributes.isWelcomeTeam || false
            })),
            votes: (resource.votes?.data || []).map((vote: any) => ({
              id: vote.id,
              value: vote.attributes.value || 0,
              date: vote.attributes.date,
              author: vote.attributes.author?.data?.attributes || null,
              team: vote.attributes.team?.data?.attributes || null,
              resource: vote.attributes.resource?.data?.attributes || null
            })),
            comments: (resource.comments?.data || []).map((comment: any) => ({
              id: comment.id,
              content: comment.attributes.content || '',
              date: comment.attributes.date,
              author: comment.attributes.author?.data?.attributes || null,
              team: comment.attributes.team?.data?.attributes || null,
              resource: comment.attributes.resource?.data?.attributes || null
            }))
          };
        }).filter(Boolean);
      }
      
      console.log('Formatted resources:', formattedResources);
      setResources(formattedResources);
      setTotalPages(resourcesData.meta?.pagination?.pageCount || 1);
      setError(null);
      setLoadingState('complete');
    } catch (err) {
      console.error('Erreur détaillée lors du chargement des données:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setLoadingState('complete');
    }
  }, [currentPage, pageSize]);

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
