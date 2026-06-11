import { useEffect, useState } from "react";
import { loadProfile, type Profile } from "@/lib/profile";

export function useProfile(): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    setProfile(loadProfile());
    const onChange = () => setProfile(loadProfile());
    window.addEventListener("di:profile-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("di:profile-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return profile;
}
