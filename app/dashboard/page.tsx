"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Menu, X, RefreshCw, Search, LogOut, GitFork, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  LayoutDashboard,  // Dashboard
  Package,          // Repositories
  TrendingUp        // Analytics
} from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// GitHub Repository Interface
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  updated_at: string;
  html_url: string;
  private: boolean;
}

export default function Dashboard() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [refreshing, setRefreshing] = useState(false);

const navItems = [
  { name: "Dashboard", icon: <LayoutDashboard /> },
  { name: "Repositories", icon: <Package />, count: repos.length },
  { name: "Analytics", icon: <TrendingUp /> },
];
  // Get unique languages from repos
  const languages = Array.from(new Set(repos.map(repo => repo.language).filter(Boolean))) as string[];

  // Fetch GitHub repositories using access token
  const fetchGitHubRepos = async (accessToken: string) => {
    try {
      setRefreshing(true);
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepos(data);
      
      if (!loading) {
        toast.success('Repositories refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast.error('Failed to fetch repositories. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();

      setProfile(data);
      
      // Fetch GitHub repos using the provider token
      const providerToken = session?.provider_token;
      if (providerToken) {
        await fetchGitHubRepos(providerToken);
      }
      
      setLoading(false);
    };

    checkSession();
  }, [supabase, router]);

  // Handle refresh
  const handleRefresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
      await fetchGitHubRepos(session.provider_token);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  // Filter repositories
  const filteredRepos = repos.filter(repo => {
    const matchesLanguage = selectedLanguage === 'all' || repo.language === selectedLanguage;
    const matchesSearch = 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLanguage && matchesSearch;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get language color
  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      JavaScript: 'bg-yellow-500',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      Java: 'bg-orange-500',
      'C++': 'bg-pink-500',
      Ruby: 'bg-red-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-600',
      PHP: 'bg-purple-500',
      Swift: 'bg-orange-400',
    };
    return colors[language || ''] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Collapsible Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url} alt={profile?.username || 'User'} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {sidebarOpen && profile && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {profile.full_name || profile.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{profile.username}
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="ml-2">{item.name}</span>
                      {item.count !== undefined && (
                        <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-8 w-8" /> : <Menu className="h-10 w-10" />}
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                GitHub Repositories
              </h1>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Repository List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Repositories ({filteredRepos.length})
              </h2>
              
              {repos.length === 0 && !refreshing ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No repositories found. Make sure your GitHub account has repositories.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-3 pr-4">
                    {filteredRepos.length === 0 ? (
                      <Card>
                        <CardContent className="p-10 text-center">
                          <p className="text-gray-500 dark:text-gray-400">
                            No repositories found matching your filters.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredRepos.map((repo) => (
                        <Card
                          key={repo.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open(repo.html_url, '_blank')}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {repo.name}
                                  </h3>
                                  {repo.private && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded">
                                      Private
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {repo.description || 'No description available'}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  {repo.language && (
                                    <span className="flex items-center gap-1">
                                      <span className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
                                      {repo.language}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {repo.stargazers_count}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <GitFork className="h-3 w-3" />
                                    {repo.forks_count}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {repo.watchers_count}
                                  </span>
                                  <span>Updated {formatDate(repo.updated_at)}</span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                window.open(repo.html_url, '_blank');
                              }}>
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}