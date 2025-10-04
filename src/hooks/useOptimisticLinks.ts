import { useCallback } from 'react';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { notifications } from '@mantine/notifications';
import type { Link } from '@/types/dashboard';

export interface OptimisticLinkOperations {
  createLink: (linkData: Partial<Link>) => Promise<Link | null>;
  updateLink: (id: string, updates: Partial<Link>) => Promise<Link | null>;
  deleteLink: (id: string) => Promise<boolean | null>;
  reorderLinks: (linkIds: string[], newOrder: number[]) => Promise<boolean | null>;
  bulkUpdateLinks: (linkIds: string[], updates: Partial<Link>) => Promise<boolean | null>;
}

export function useOptimisticLinks(
  links: Link[],
  onLinksChange: (links: Link[]) => void
): OptimisticLinkOperations & { optimisticState: any } {
  const { optimisticState, performOptimisticUpdate } = useOptimisticUpdate<Link[]>();

  const createLink = useCallback(
    async (linkData: Partial<Link>): Promise<Link | null> => {
      const tempId = `temp-${Date.now()}`;
      const optimisticLink: Link = {
        id: tempId,
        title: linkData.title || 'New Link',
        url: linkData.url || '',
        description: linkData.description || '',
        image_url: linkData.image_url || null,
        order_index: links.length,
        profile_id: linkData.profile_id || '',
        created_at: new Date(),
        updated_at: new Date(),
        ...linkData,
      } as Link;

      const optimisticLinks = [...links, optimisticLink];

      return performOptimisticUpdate(
        optimisticLinks,
        async () => {
          const formData = new FormData();
          Object.entries(linkData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value.toString());
            }
          });

          const response = await fetch('/api/links', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to create link');
          }

          const newLink = await response.json();
          const updatedLinks = [...links, newLink];
          onLinksChange(updatedLinks);
          
          return newLink;
        },
        {
          onSuccess: (newLink) => {
            notifications.show({
              title: 'Link Created',
              message: `"${newLink.title}" has been added successfully`,
              color: 'green',
            });
          },
          onError: (error) => {
            console.error('Failed to create link:', error);
          },
        }
      );
    },
    [links, onLinksChange, performOptimisticUpdate]
  );

  const updateLink = useCallback(
    async (id: string, updates: Partial<Link>): Promise<Link | null> => {
      const linkIndex = links.findIndex(link => link.id === id);
      if (linkIndex === -1) return null;

      const optimisticLinks = [...links];
      optimisticLinks[linkIndex] = { ...optimisticLinks[linkIndex], ...updates };

      return performOptimisticUpdate(
        optimisticLinks,
        async () => {
          const formData = new FormData();
          Object.entries(updates).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              formData.append(key, value.toString());
            }
          });

          const response = await fetch(`/api/links/${id}`, {
            method: 'PATCH',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to update link');
          }

          const updatedLink = await response.json();
          const updatedLinks = links.map(link => 
            link.id === id ? updatedLink : link
          );
          onLinksChange(updatedLinks);
          
          return updatedLink;
        },
        {
          onSuccess: (updatedLink) => {
            notifications.show({
              title: 'Link Updated',
              message: `"${updatedLink.title}" has been updated successfully`,
              color: 'blue',
            });
          },
        }
      );
    },
    [links, onLinksChange, performOptimisticUpdate]
  );

  const deleteLink = useCallback(
    async (id: string): Promise<boolean | null> => {
      const linkToDelete = links.find(link => link.id === id);
      if (!linkToDelete) return null;

      const optimisticLinks = links.filter(link => link.id !== id);

      return performOptimisticUpdate(
        optimisticLinks,
        async () => {
          const response = await fetch(`/api/links/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete link');
          }

          const updatedLinks = links.filter(link => link.id !== id);
          onLinksChange(updatedLinks);
          
          return true;
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Link Deleted',
              message: `"${linkToDelete.title}" has been deleted`,
              color: 'orange',
              action: {
                label: 'Undo',
                onClick: () => {
                  // Restore the deleted link
                  onLinksChange([...links]);
                },
              },
            });
          },
        }
      );
    },
    [links, onLinksChange, performOptimisticUpdate]
  );

  const reorderLinks = useCallback(
    async (linkIds: string[], newOrder: number[]): Promise<boolean | null> => {
      const optimisticLinks = [...links];
      
      // Apply new order optimistically
      linkIds.forEach((linkId, index) => {
        const linkIndex = optimisticLinks.findIndex(link => link.id === linkId);
        if (linkIndex !== -1) {
          optimisticLinks[linkIndex].order_index = newOrder[index];
        }
      });
      
      // Sort by new order
      optimisticLinks.sort((a, b) => a.order_index - b.order_index);

      return performOptimisticUpdate(
        optimisticLinks,
        async () => {
          const response = await fetch('/api/links/reorder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ linkIds, newOrder }),
          });

          if (!response.ok) {
            throw new Error('Failed to reorder links');
          }

          onLinksChange(optimisticLinks);
          return true;
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Links Reordered',
              message: 'Link order has been updated',
              color: 'blue',
            });
          },
        }
      );
    },
    [links, onLinksChange, performOptimisticUpdate]
  );

  const bulkUpdateLinks = useCallback(
    async (linkIds: string[], updates: Partial<Link>): Promise<boolean | null> => {
      const optimisticLinks = links.map(link =>
        linkIds.includes(link.id) ? { ...link, ...updates } : link
      );

      return performOptimisticUpdate(
        optimisticLinks,
        async () => {
          const response = await fetch('/api/links/bulk', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ linkIds, updates }),
          });

          if (!response.ok) {
            throw new Error('Failed to update links');
          }

          onLinksChange(optimisticLinks);
          return true;
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Links Updated',
              message: `${linkIds.length} links have been updated`,
              color: 'green',
            });
          },
        }
      );
    },
    [links, onLinksChange, performOptimisticUpdate]
  );

  return {
    optimisticState,
    createLink,
    updateLink,
    deleteLink,
    reorderLinks,
    bulkUpdateLinks,
  };
}