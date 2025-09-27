"use client";

import { useState } from "react";
import { Stack, Card, Tabs, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { Profile } from "../../../db/schema";
import type { Link, LinkFormData, EnhancedDashboardState } from "../../../types/dashboard";
import { LinkManagementHeader } from "./LinkManagementHeader";
import { LinkList } from "./LinkList";
import { LinkForm } from "./LinkForm";
import { ProfileForm } from "./ProfileForm";
import { createLink, updateLink, deleteLink } from "../../lib/actions/links";

interface LeftPanelProps {
  profile: Profile;
  dashboardState: EnhancedDashboardState;
  updateDashboardState: (updates: Partial<EnhancedDashboardState>) => void;
  onRefreshLinks: () => void;
  onRefreshProfile: () => void;
  setSelectedLink: (link: Link | null) => void;
  setIsAddingLink: (isAdding: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
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
  setIsSubmitting,
  clearError,
  addLinkToState,
  updateLinkInState,
  removeLinkFromState
}: LeftPanelProps) {
  const { links, selectedLink, isAddingLink, isSubmitting, error } = dashboardState;
  const [activeTab, setActiveTab] = useState<string | null>("profile");

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
      setIsSubmitting(true);
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
      setIsSubmitting(false);
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

  const handleProfileSubmit = async (profileData: any) => {
    try {
      setIsSubmitting(true);
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
      setIsSubmitting(false);
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
        </Tabs.List>

        <Box style={{ flex: 1, paddingTop: "1rem" }}>
          <Tabs.Panel value="profile" style={{ height: "100%" }}>
            <Card padding="lg" radius="md" withBorder style={{ height: "100%" }}>
              <ProfileForm
                profile={profile}
                onSubmit={handleProfileSubmit}
                isLoading={isSubmitting}
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
                  onAddLink={handleAddLink}
                />
              </Card>

              {/* Links List */}
              <LinkList
                links={links}
                selectedLink={selectedLink}
                onEditLink={handleEditLink}
                onDeleteLink={handleDeleteLink}
                onAddLink={handleAddLink}
              />
            </Stack>
          </Tabs.Panel>
        </Box>
      </Tabs>

      {/* Link Form Modal */}
      <LinkForm
        opened={isAddingLink || selectedLink !== null}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        editingLink={selectedLink}
        isLoading={isSubmitting}
        error={error}
      />
    </Stack>
  );
}