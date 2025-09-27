"use client";

import { PreviewTabs } from "./PreviewTabs";
import type { Profile } from "../../../db/schema";
import type { Link } from "../../../types/dashboard";

interface RightPanelProps {
  profile: Profile;
  links: Link[];
  isLoading?: boolean;
}

export function RightPanel({ profile, links, isLoading = false }: RightPanelProps) {
  return <PreviewTabs profile={profile} links={links} isLoading={isLoading} />;
}