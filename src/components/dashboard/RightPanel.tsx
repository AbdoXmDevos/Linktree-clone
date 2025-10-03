"use client";

import { useState } from "react";
import { Tabs } from "@mantine/core";
import { IconDeviceMobile, IconChartBar } from "@tabler/icons-react";
import { PreviewTabs } from "./PreviewTabs";
import { AnalyticsPanel } from "./AnalyticsPanel";
import type { Profile } from "../../../db/schema";
import type { Link } from "../../../types/dashboard";

interface RightPanelProps {
  profile: Profile;
  links: Link[];
  isLoading?: boolean;
}

export function RightPanel({ profile, links, isLoading = false }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>("preview");

  return (
    <Tabs value={activeTab} onChange={setActiveTab} orientation="vertical">
      <Tabs.List>
        <Tabs.Tab value="preview" leftSection={<IconDeviceMobile size={16} />}>
          Preview
        </Tabs.Tab>
        <Tabs.Tab value="analytics" leftSection={<IconChartBar size={16} />}>
          Analytics
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="preview" pl="md">
        <PreviewTabs profile={profile} links={links} isLoading={isLoading} />
      </Tabs.Panel>

      <Tabs.Panel value="analytics" pl="md">
        <AnalyticsPanel profileId={profile.id} />
      </Tabs.Panel>
    </Tabs>
  );
}