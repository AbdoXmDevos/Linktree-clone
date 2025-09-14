"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get("profileCreated") === "true") {
      setShowSuccessMessage(true);
      // Remove the query parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

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
          {showSuccessMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              🎉 Profile created successfully! Welcome to your dashboard.
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

          {/* Quick Actions */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-semibold mb-4 text-black">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              {profile && (
                <>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                    Edit Profile
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Add Links
                  </button>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    Customize Theme
                  </button>
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