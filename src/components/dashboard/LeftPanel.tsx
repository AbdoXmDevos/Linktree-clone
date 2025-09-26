"use client";

import { Stack, Card } from "@mantine/core";
import { Profile, DashboardState } from "./DashboardLayout";
import { LinkManagementHeader } from "./LinkManagementHeader";
import { LinkList } from "./LinkList";
import { LinkForm } from "./LinkForm";
import { LinkFormData } from "../../../types/dashboard";

interface LeftPanelProps {
  profile: Profile;
  dashboardState: DashboardState;
  updateDashboardState: (updates: Partial<DashboardState>) => void;
  onRefreshLinks: () => void;
}

export function LeftPanel({ 
  profile, 
  dashboardState, 
  updateDashboardState, 
  onRefreshLinks 
}: LeftPanelProps) {
  const { links, selectedLink, isAddingLink } = dashboardState;

  const handleAddLink = () => {
    updateDashboardState({ isAddingLink: true, selectedLink: null });
  };

  const handleEditLink = (link: any) => {
    updateDashboardState({ selectedLink: link, isAddingLink: false });
  };

  const handleCloseForm = () => {
    updateDashboardState({ isAddingLink: false, selectedLink: null });
  };

  const handleSubmitForm = async (formData: LinkFormData) => {
    // TODO: Implement actual API calls for creating/updating links
    // This will be implemented in later tasks
    console.log("Form submitted:", formData);
    
    // For now, just close the form and refresh links
    handleCloseForm();
    onRefreshLinks();
  };

  const handleDeleteLink = async (linkId: string) => {
    // TODO: Implement actual API call for deleting links
    // This will be implemented in later tasks
    console.log("Delete link:", linkId);
    onRefreshLinks();
  };

  return (
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

      {/* Link Form Modal */}
      <LinkForm
        opened={isAddingLink || selectedLink !== null}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        editingLink={selectedLink}
        isLoading={false}
      />
    </Stack>
  );
}