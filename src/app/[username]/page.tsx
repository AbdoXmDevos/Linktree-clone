import { db } from "../../../lib/db";
import * as schema from "../../../db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
}

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

async function getProfileData(username: string) {
  try {
    // Get profile
    const profile = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.username, username))
      .limit(1);

    if (profile.length === 0) {
      return null;
    }

    // Get links
    const links = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.profile_id, profile[0].id))
      .orderBy(schema.links.order_index);

    return {
      profile: profile[0],
      links,
    };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const data = await getProfileData(params.username);

  if (!data) {
    notFound();
  }

  const { profile, links } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-8">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
              />
            )}
            <h1 className="text-2xl font-bold text-white mb-2">
              {profile.display_name || `@${profile.username}`}
            </h1>
            {profile.bio && (
              <p className="text-white/90 text-sm max-w-xs mx-auto">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
                <p className="text-white">No links added yet</p>
              </div>
            ) : (
              links.map((link: Link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 rounded-lg p-4 text-center group"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {link.icon && (
                      <span className="text-xl">{link.icon}</span>
                    )}
                    <span className="text-white font-medium group-hover:scale-105 transition-transform">
                      {link.title}
                    </span>
                  </div>
                </a>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/70 text-xs">
              Powered by Linktree Clone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}