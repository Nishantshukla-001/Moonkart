"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import type { IUser } from "@/types/user";

interface AuthContextValue {
  supabaseUser: SupabaseUser | null;
  profile: IUser | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Client-side auth state (Supabase session + the app's `User` profile).
 * Server Components remain the authoritative source for protected-route
 * decisions (see lib/auth.ts) — this provider exists for reactive UI only
 * (navbar, account menus, conditional rendering).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setProfile(null);
        return;
      }
      const json = await response.json();
      setProfile(json.data ?? null);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setSupabaseUser(data.user);
      setIsLoading(false);
      if (data.user) {
        fetchProfile();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, router]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setProfile(null);
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ supabaseUser, profile, isLoading, refreshProfile: fetchProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
