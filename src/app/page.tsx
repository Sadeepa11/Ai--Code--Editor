"use client";
import React, { useState, useEffect } from 'react';
import Dashboard from "@/components/Dashboard";
import Auth from "@/components/Auth";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data && data.id) {
          setUser(data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <main className="h-screen w-full">
      <Dashboard user={user} setUser={setUser} />
    </main>
  );
}
