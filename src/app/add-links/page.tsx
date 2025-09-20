"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import ProgressSteps from "../../components/ProgressSteps";

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
}

export default function AddLinksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profileId");
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only redirect to login if we're sure the user is unauthenticated AND we don't have a profileId
    // This allows the onboarding flow to continue even if session is still loading
    if (status === "unauthenticated" && !profileId) {
      router.push("/login");
    }
  }, [status, router, profileId]);

  useEffect(() => {
    if (!profileId) {
      // Only redirect to dashboard if we don't have a profileId and we're authenticated
      if (status === "authenticated") {
        router.push("/dashboard");
      }
      return;
    }
    
    // Wait for session to load before fetching profile data
    if (status !== "loading") {
      fetchProfile();
      fetchLinks();
    }
  }, [profileId, status]);

  const fetchProfile = async () => {
    try {
      // If we have a session, use the userId from it
      if (session?.user?.id) {
        const res = await fetch(`/api/profiles?userId=${session.user.id}`);
        if (res.ok) {
          const profileData = await res.json();
          setProfile(profileData);
        }
      } else if (profileId) {
        // If we don't have a session yet but have profileId, fetch profile by profileId
        const res = await fetch(`/api/profiles/by-id?profileId=${profileId}`);
        if (res.ok) {
          const profileData = await res.json();
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch(`/api/links?profileId=${profileId}`);
      if (res.ok) {
        const linksData = await res.json();
        setLinks(linksData);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLink.title || !newLink.url) {
      setError("Title and URL are required");
      return;
    }

    // Basic URL validation
    let url = newLink.url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          title: newLink.title,
          url,
          icon: newLink.icon || null,
        }),
      });

      if (res.ok) {
        setNewLink({ title: "", url: "", icon: "" });
        fetchLinks(); // Refresh the links list
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add link");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const res = await fetch(`/api/links?linkId=${linkId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchLinks(); // Refresh the links list
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  const handleFinish = async () => {
    try {
      // If user is not authenticated, auto-signin them
      if (status !== "authenticated" && profileId) {
        const res = await fetch("/api/auth/auto-signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId }),
        });

        if (res.ok) {
          const data = await res.json();
          // Use NextAuth signIn with special auto-signin credentials
          const result = await signIn("credentials", {
            email: data.user.email,
            password: "AUTO_SIGNIN_ONBOARDING",
            redirect: false,
          });

          if (result?.ok) {
            router.push("/dashboard?setupComplete=true");
          } else {
            router.push("/login?message=Please sign in to continue");
          }
        } else {
          router.push("/login?message=Please sign in to continue");
        }
      } else {
        // User is already authenticated
        router.push("/dashboard?setupComplete=true");
      }
    } catch (error) {
      console.error("Error during finish:", error);
      router.push("/login?message=Please sign in to continue");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <ProgressSteps 
            currentStep={2} 
            steps={["Create Profile", "Add Links", "Dashboard"]} 
          />

          <h1 className="text-3xl font-extrabold text-gray-900">
            Step 2: Add Links to Your Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Add links to your social media, website, or anything you want to share
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Profile: @{profile.username}
          </p>
        </div>

        {/* Add New Link Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Link</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAddLink} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Link Title *
              </label>
              <input
                id="title"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., My Website, Instagram, YouTube"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                URL *
              </label>
              <input
                id="url"
                type="url"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., https://example.com or example.com"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
                Icon (optional)
              </label>
              <input
                id="icon"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 🌐, 📱, 🎵 or emoji"
                value={newLink.icon}
                onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Link"}
            </button>
          </form>
        </div>

        {/* Current Links */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Your Links ({links.length})
          </h2>
          
          {links.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No links added yet. Add your first link above!
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
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
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleFinish}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md"
          >
            {links.length > 0 ? "Complete Setup → Dashboard" : "Skip Links → Dashboard"}
          </button>
          
          {links.length > 0 && (
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md text-center"
            >
              Preview Profile
            </a>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            {links.length === 0 
              ? "You can always add links later from your dashboard" 
              : `You've added ${links.length} link${links.length === 1 ? '' : 's'}. You can add more anytime!`
            }
          </p>
        </div>
      </div>
    </div>
  );
}