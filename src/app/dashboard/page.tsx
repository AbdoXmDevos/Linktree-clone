"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressSteps from "../../components/ProgressSteps";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  order_index: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showSetupComplete, setShowSetupComplete] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get("setupComplete") === "true") {
      setShowSetupComplete(true);
      // Remove the query parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
      
      // Hide the message after 10 seconds
      setTimeout(() => {
        setShowSetupComplete(false);
      }, 10000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  useEffect(() => {
    if (profile?.id) {
      fetchLinks();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profiles?userId=${session?.user?.id}`);
      if (res.ok) {
        const profileData = await res.json();
        setProfile(profileData);
      } else if (res.status === 404) {
        // Profile doesn't exist, redirect to create profile
        router.push(`/create-profile?userId=${session?.user?.id}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch(`/api/links?profileId=${profile?.id}`);
      if (res.ok) {
        const linksData = await res.json();
        setLinks(linksData);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  if (status === "loading" || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-black">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Message */}
          {showSetupComplete && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <ProgressSteps 
                currentStep={4} 
                steps={["Create Profile", "Add Links", "Dashboard"]} 
              />
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">🎉 Setup Complete!</h2>
                <p className="text-gray-600">
                  Welcome to your dashboard. Your profile is live and ready to share!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-semibold mb-4 text-black">Account Information</h2>
              <div className="space-y-2 text-black">
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Name:</strong> {session.user?.name || "Not provided"}</p>
                <p><strong>User ID:</strong> {session.user?.id}</p>
              </div>
            </div>

            {/* Profile Info Card */}
            {profile && (
              <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold mb-4 text-black">Profile Information</h2>
                <div className="space-y-2 text-black">
                  <p><strong>Username:</strong> @{profile.username}</p>
                  <p><strong>Display Name:</strong> {profile.display_name || "Not set"}</p>
                  <p><strong>Bio:</strong> {profile.bio || "No bio yet"}</p>
                  {profile.avatar_url && (
                    <div>
                      <strong>Avatar:</strong>
                      <img
                        src={profile.avatar_url}
                        alt="Profile avatar"
                        className="w-16 h-16 rounded-full mt-2"
                      />
                    </div>
                  )}
                  <p><strong>Profile URL:</strong>
                    <a
                      href={`/${profile.username}`}
                      className="text-blue-600 hover:text-blue-800 ml-1 underline"
                      target="_blank"
                    >
                      /{profile.username}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Links Section */}
          {profile && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-black">Your Links ({links.length})</h2>
                <button
                  onClick={() => router.push(`/add-links?profileId=${profile.id}`)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  {links.length === 0 ? "Add Your First Link" : "Manage Links"}
                </button>
              </div>
              
              {links.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No links added yet</p>
                  <p className="text-sm">Add links to your social media, website, or anything you want to share</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.slice(0, 5).map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        {link.icon && (
                          <span className="text-lg">{link.icon}</span>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{link.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {link.url}
                          </p>
                        </div>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Visit
                      </a>
                    </div>
                  ))}
                  {links.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      And {links.length - 5} more links...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4 text-black">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              {profile && (
                <>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                    Edit Profile
                  </button>
                  <button
                    onClick={() => router.push(`/add-links?profileId=${profile.id}`)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Manage Links
                  </button>
                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded inline-block"
                  >
                    View Public Profile
                  </a>
                </>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}