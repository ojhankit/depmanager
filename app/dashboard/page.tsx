"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // user canceled or not signed in → redirect back
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    checkSession();
  }, [supabase, router]);

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {profile?.username}</h1>
      <Button onClick={async () => {
        await supabase.auth.signOut();
        router.replace("/");
      }}>
        Logout
      </Button>
    </main>
  );
}
