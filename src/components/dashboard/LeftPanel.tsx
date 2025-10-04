"use client";

import { useState, useEffect } from "react";
import { Stack, Card, Tabs, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { Profile } from "../../../db/schema";
import type { Link, LinkFormData, EnhancedDashboardState } from "../../../types/dashboard";
import { LinkManagementHeader } from "./LinkManagementHeader";
import { DragDropLinkList } from "./DragDropLinkList";
import { LinkForm } from "./LinkForm";
import { ProfileForm } from "./ProfileForm";
import { AnalyticsWidget } from "./AnalyticsWidget";
import { SearchAndFilter } from "./SearchAndFilter";
import { QuickActions } from "./QuickActions";
import { createLink, updateLink, deleteLink } from "../../lib/actions/links";

interface LeftPanelProps {
  profile: Profile;
  dashboardState: EnhancedDashboardState;
  updateDashboardState: (updates: Partial<EnhancedDashboardState>) => void;
  onRefreshLinks: () => void;
  onRefreshProfile: () => void;
  setSelectedLink: (link: Link | null) => void;
  setIsAddingLink: (isAdding: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  clearError: () => void;
  addLinkToState: (newLink: Link) => void;
  updateLinkInState: (updatedLink: Link) => void;
  removeLinkFromState: (linkId: string) => void;
}

export function LeftPanel({ 
  profile, 
  dashboardState, 
  updateDashboardState, 
  onRefreshLinks,
  onRefreshProfile,
  setSelectedLink,
  setIsAddingLink,
  setIsSaving,
  clearError,
  addLinkToState,
  updateLinkInState,
  removeLinkFromState
}: LeftPanelProps) {
  const { links, selectedLink, isAddingLink, isSaving, error } = dashboardState;
  const [activeTab, setActiveTab] = useState<string | null>("profile");
  const [filteredLinks, setFilteredLinks] = useState<Link[]>(links);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedSearches, setSavedSearches] = useState<Array<{
    id: string;
    name: string;
    filters: any;
    createdAt: Date;
  }>>([]);

  const handleAddLink = () => {
    clearError();
    setIsAddingLink(true);
    setSelectedLink(null);
  };

  const handleEditLink = (link: Link) => {
    clearError();
    setSelectedLink(link);
    setIsAddingLink(false);
  };

  const handleCloseForm = () => {
    setIsAddingLink(false);
    setSelectedLink(null);
    clearError();
  };

  const handleSubmitForm = async (formData: LinkFormData) => {
    if (!profile?.id) return;

    try {
      setIsSaving(true);
      clearError();

      if (selectedLink) {
        // Update existing link with optimistic update
        const optimisticLink: Link = {
          ...selectedLink,
          title: formData.title,
          url: formData.url,
          description: formData.description || null,
          icon: formData.icon || null,
        };
        
        // Apply optimistic update
        updateLinkInState(optimisticLink);
        
        try {
          // Perform actual update
          const result = await updateLink(selectedLink.id, formData);
          
          if (result.success && result.data) {
            // Update with server response (in case of any differences)
            updateLinkInState(result.data);
            
            notifications.show({
              title: "Success",
              message: "Link updated successfully",
              color: "green",
              icon: <IconCheck size={16} />,
            });
          } else {
            // Rollback optimistic update on error
            updateLinkInState(selectedLink);
            throw result.error || new Error("Failed to update link");
          }
        } catch (error) {
          // Rollback optimistic update on error
          updateLinkInState(selectedLink);
          throw error;
        }
      } else {
        // Create new link with optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticLink: Link = {
          id: tempId,
          profile_id: profile.id,
          title: formData.title,
          url: formData.url,
          description: formData.description || null,
          icon: formData.icon || null,
          order_index: links.length,
          category: null,
          tags: null,
          custom_styling: null,
          is_featured: false,
          created_at: new Date(),
        };
        
        // Apply optimistic update
        addLinkToState(optimisticLink);
        
        try {
          // Perform actual creation
          const result = await createLink(profile.id, formData);
          
          if (result.success && result.data) {
            // Remove temporary link and add real link
            removeLinkFromState(tempId);
            addLinkToState(result.data);
            
            notifications.show({
              title: "Success",
              message: "Link added successfully",
              color: "green",
              icon: <IconCheck size={16} />,
            });
          } else {
            // Rollback optimistic update on error
            removeLinkFromState(tempId);
            throw result.error || new Error("Failed to create link");
          }
        } catch (error) {
          // Rollback optimistic update on error
          removeLinkFromState(tempId);
          throw error;
        }
      }

      handleCloseForm();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      
      // Enhanced error handling based on error type
      let errorMessage = "An unexpected error occurred";
      let errorTitle = "Error";
      
      if (error?.type) {
        switch (error.type) {
          case 'validation':
            errorTitle = "Validation Error";
            errorMessage = error.message;
            break;
          case 'network':
            errorTitle = "Connection Error";
            errorMessage = error.message;
            break;
          case 'database':
            errorTitle = "Database Error";
            errorMessage = error.message;
            break;
          case 'not_found':
            errorTitle = "Not Found";
            errorMessage = error.message;
            // Refresh links to sync state
            onRefreshLinks();
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      updateDashboardState({ error: errorMessage });
      
      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
        autoClose: error?.retryable ? 8000 : 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    const linkToDelete = links.find(link => link.id === linkId);
    if (!linkToDelete) return;

    try {
      clearError();
      
      // Apply optimistic update (remove from UI immediately)
      removeLinkFromState(linkId);
      
      try {
        // Perform actual deletion
        const result = await deleteLink(linkId);
        
        if (result.success) {
          notifications.show({
            title: "Success",
            message: "Link deleted successfully",
            color: "green",
            icon: <IconCheck size={16} />,
          });
        } else {
          // Rollback optimistic update on error
          addLinkToState(linkToDelete);
          throw result.error || new Error("Failed to delete link");
        }
      } catch (error) {
        // Rollback optimistic update on error
        addLinkToState(linkToDelete);
        throw error;
      }
    } catch (error: any) {
      console.error("Error deleting link:", error);
      
      // Enhanced error handling based on error type
      let errorMessage = "Failed to delete link";
      let errorTitle = "Error";
      
      if (error?.type) {
        switch (error.type) {
          case 'network':
            errorTitle = "Connection Error";
            errorMessage = error.message;
            break;
          case 'not_found':
            errorTitle = "Link Not Found";
            errorMessage = error.message;
            // Refresh links to sync state
            onRefreshLinks();
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      updateDashboardState({ error: errorMessage });
      
      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
        autoClose: error?.retryable ? 8000 : 5000,
      });
    }
  };

  const handleSaveSearch = (search: any) => {
    setSavedSearches(prev => [...prev, search]);
    // In a real app, you'd save this to the backend
    localStorage.setItem('savedSearches', JSON.stringify([...savedSearches, search]));
  };

  const handleDeleteSavedSearch = (searchId: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== searchId));
    // In a real app, you'd delete this from the backend
    const updated = savedSearches.filter(s => s.id !== searchId);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Quick Actions handlers
  const handleBulkDelete = (linkIds: string[]) => {
    linkIds.forEach(id => handleDeleteLink(id));
  };

  const handleBulkToggleFeatured = (linkIds: string[]) => {
    // TODO: Implement bulk toggle featured
    console.log("Bulk toggle featured:", linkIds);
  };

  const handleBulkCategorize = (linkIds: string[], category: string) => {
    // TODO: Implement bulk categorize
    console.log("Bulk categorize:", linkIds, category);
  };

  const handleBulkStyle = (linkIds: string[], style: any) => {
    // TODO: Implement bulk style
    console.log("Bulk style:", linkIds, style);
  };

  const handleBulkReorder = (linkIds: string[], direction: 'up' | 'down') => {
    // TODO: Implement bulk reorder
    console.log("Bulk reorder:", linkIds, direction);
  };

  const handleExportLinks = (linkIds: string[]) => {
    const selectedLinks = links.filter(link => linkIds.includes(link.id));
    const dataStr = JSON.stringify(selectedLinks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'links.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Load saved searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedSearches(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load saved searches:', error);
      }
    }
  }, []);

  // Update filtered links when original links change
  useEffect(() => {
    if (!searchQuery && filteredLinks.length !== links.length) {
      setFilteredLinks(links);
    }
  }, [links, searchQuery, filteredLinks.length]);

  const handleProfileSubmit = async (profileData: any) => {
    try {
      setIsSaving(true);
      clearError();
      
      // Call the profile update API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: profileData.display_name,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      if (result.success) {
        // Refresh profile data to get the latest from the server
        onRefreshProfile();
        
        notifications.show({
          title: "Success",
          message: "Profile updated successfully",
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      let errorMessage = "Failed to update profile";
      let errorTitle = "Error";
      
      // Handle different types of errors
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorTitle = "Connection Error";
        errorMessage = "Unable to connect to server. Please check your connection and try again.";
      }
      
      updateDashboardState({ error: errorMessage });
      
      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 8000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack gap="lg" style={{ height: "100%" }} className="mobile-safe-area">
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Tabs.List grow>
          <Tabs.Tab
            value="profile"
            style={{
              transition: "all 0.2s ease",
              fontWeight: activeTab === "profile" ? 600 : 400
            }}
          >
            Profile
          </Tabs.Tab>
          <Tabs.Tab
            value="links"
            style={{
              transition: "all 0.2s ease",
              fontWeight: activeTab === "links" ? 600 : 400
            }}
          >
            Links
          </Tabs.Tab>
          <Tabs.Tab
            value="analytics"
            style={{
              transition: "all 0.2s ease",
              fontWeight: activeTab === "analytics" ? 600 : 400
            }}
          >
            Analytics
          </Tabs.Tab>
        </Tabs.List>

        <Box style={{ flex: 1, paddingTop: "1rem" }}>
          <Tabs.Panel value="profile" style={{ height: "100%" }}>
            <Card padding="lg" radius="md" withBorder style={{ height: "100%" }}>
              <ProfileForm
                profile={profile}
                onSubmit={handleProfileSubmit}
                isLoading={isSaving}
                error={error}
              />
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="links" style={{ height: "100%" }}>
            <Stack gap="lg" style={{ height: "100%" }}>
              {/* Header Section */}
              <Card padding="lg" radius="md" withBorder>
                <LinkManagementHeader
                  username={profile.username}
                  linkCount={links.length}
                  filteredCount={filteredLinks.length}
                  searchQuery={searchQuery}
                  onAddLink={handleAddLink}
                />
              </Card>

              {/* Search and Filter */}
              <SearchAndFilter
                links={links}
                onFilteredLinksChange={setFilteredLinks}
                onSearchChange={setSearchQuery}
                savedSearches={savedSearches}
                onSaveSearch={handleSaveSearch}
                onDeleteSavedSearch={handleDeleteSavedSearch}
              />

              {/* Links List */}
              <DragDropLinkList
                links={filteredLinks}
                selectedLink={selectedLink}
                selectedLinks={dashboardState.selectedLinks || []}
                onEditLink={handleEditLink}
                onDeleteLink={handleDeleteLink}
                onAddLink={handleAddLink}
                onSelectLink={(linkId, isSelected) => {
                  const currentSelected = dashboardState.selectedLinks || [];
                  const newSelected = isSelected
                    ? [...currentSelected, linkId]
                    : currentSelected.filter(id => id !== linkId);
                  updateDashboardState({ selectedLinks: newSelected });
                }}
                profileId={profile.id}
                onLinksReorder={(reorderedLinks) => {
                  // Update the original links array, not the filtered one
                  updateDashboardState({ links: reorderedLinks });
                }}
                onLinksUpdate={(updatedLinks) => {
                  // Update the original links array, not the filtered one
                  updateDashboardState({ links: updatedLinks });
                }}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="analytics" style={{ height: "100%" }}>
            <AnalyticsWidget 
              profileId={profile.id}
              onViewDetails={() => {
                // This could open the analytics modal or navigate to analytics tab in right panel
                console.log("View detailed analytics");
              }}
            />
          </Tabs.Panel>
        </Box>
      </Tabs>

      {/* Link Form Modal */}
      <LinkForm
        opened={isAddingLink || selectedLink !== null}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        editingLink={selectedLink}
        isLoading={isSaving}
        error={error}
      />

      {/* Quick Actions for Bulk Operations */}
      <QuickActions
        selectedLinks={dashboardState.selectedLinks || []}
        links={links}
        onBulkDelete={handleBulkDelete}
        onBulkToggleFeatured={handleBulkToggleFeatured}
        onBulkCategorize={handleBulkCategorize}
        onBulkStyle={handleBulkStyle}
        onBulkReorder={handleBulkReorder}
        onExportLinks={handleExportLinks}
        onClearSelection={() => updateDashboardState({ selectedLinks: [] })}
      />
    </Stack>
  );
}