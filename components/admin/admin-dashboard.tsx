"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Users,
  Package,
  TrendingUp,
  Plus,
  Trash2,
  Youtube,
  Link as LinkIcon,
  Instagram,
  Slack,
  Twitter
} from "lucide-react";
import {
  createAnnouncement,
  deleteAnnouncement,
  addVideo,
  deleteVideo,
  updateSocialLink
} from "@/lib/actions/admin";
import { toast } from "sonner";
import Image from "next/image";

interface AdminDashboardProps {
  announcements: any[];
  videos: any[];
  socialLinks: Record<string, string>;
}

export function AdminDashboard({ announcements, videos, socialLinks }: AdminDashboardProps) {
  const [newAd, setNewAd] = useState({ title: "", content: "", imageUrl: "", targetLink: "" });
  const [newVideoId, setNewVideoId] = useState("");
  const [socials, setSocials] = useState({
    instagram: socialLinks.social_instagram || "",
    reddit: socialLinks.social_reddit || "",
    slack: socialLinks.social_slack || "",
    x: socialLinks.social_x || ""
  });
  const [youtubeLink, setYoutubeLink] = useState(socialLinks.social_youtube || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createAnnouncement(newAd);
      toast.success("Announcement created");
      setNewAd({ title: "", content: "", imageUrl: "", targetLink: "" });
    } catch (error) {
      toast.error("Failed to create announcement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addVideo(newVideoId);
      toast.success("Video added");
      setNewVideoId("");
    } catch (error) {
      toast.error("Failed to add video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteVideo(id);
      toast.success("Video deleted");
    } catch (error) {
      toast.error("Failed to delete video");
    }
  };

  const handleUpdateSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateSocialLink("instagram", socials.instagram);
      await updateSocialLink("reddit", socials.reddit);
      await updateSocialLink("slack", socials.slack);
      await updateSocialLink("x", socials.x);
      toast.success("Social links updated");
    } catch (error) {
      toast.error("Failed to update links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateYoutubeLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateSocialLink("youtube", youtubeLink);
      toast.success("YouTube link updated");
    } catch (error) {
      toast.error("Failed to update YouTube link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="ads">Ad Manager</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Manager</TabsTrigger>
          <TabsTrigger value="socials">Social Links</TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+1,234</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,345</div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 since last hour</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {/* Mock Chart */}
                <div className="h-[200px] flex items-end justify-between gap-2 px-4">
                  {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                    <div key={i} className="bg-primary/20 hover:bg-primary/40 w-full rounded-t-md transition-all" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>You made 265 sales this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Olivia Martin</p>
                      <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                    </div>
                    <div className="ml-auto font-medium">+$1,999.00</div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Jackson Lee</p>
                      <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                    </div>
                    <div className="ml-auto font-medium">+$39.00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ad Manager Tab */}
        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Announcement</CardTitle>
              <CardDescription>Add a new advertising post to the landing page.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newAd.title}
                      onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Link</Label>
                    <Input
                      value={newAd.targetLink}
                      onChange={(e) => setNewAd({...newAd, targetLink: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={newAd.imageUrl}
                    onChange={(e) => setNewAd({...newAd, imageUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Input
                    value={newAd.content}
                    onChange={(e) => setNewAd({...newAd, content: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" /> Create Ad
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {announcements.map((ad) => (
              <Card key={ad.id}>
                <CardHeader>
                  <CardTitle className="text-lg truncate">{ad.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ad.content}</p>
                  {ad.image_url && (
                    <div className="relative h-32 w-full mb-4 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={ad.image_url}
                        alt={ad.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <a
                      href={ad.target_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View Link
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* YouTube Manager Tab */}
        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Channel Link</CardTitle>
              <CardDescription>Link for the "View Demo" button on the landing page.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateYoutubeLink} className="space-y-4">
                <div className="space-y-2">
                  <Label>Channel / Video URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                    <Button type="submit" disabled={isLoading}>
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add YouTube Video</CardTitle>
              <CardDescription>Enter the YouTube Video ID (e.g., dQw4w9WgXcQ).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVideo} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Video ID</Label>
                  <Input
                    value={newVideoId}
                    onChange={(e) => setNewVideoId(e.target.value)}
                    placeholder="dQw4w9WgXcQ"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  <Youtube className="mr-2 h-4 w-4" /> Add Video
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono">{video.youtube_id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full rounded-md overflow-hidden bg-black mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.youtube_id}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Video
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Social Link Manager Tab */}
        <TabsContent value="socials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Update the global links for social platforms.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSocials} className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" /> Instagram URL
                  </Label>
                  <Input
                    value={socials.instagram}
                    onChange={(e) => setSocials({...socials, instagram: e.target.value})}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Reddit URL
                  </Label>
                  <Input
                    value={socials.reddit}
                    onChange={(e) => setSocials({...socials, reddit: e.target.value})}
                    placeholder="https://reddit.com/r/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Slack className="h-4 w-4" /> Slack URL
                  </Label>
                  <Input
                    value={socials.slack}
                    onChange={(e) => setSocials({...socials, slack: e.target.value})}
                    placeholder="https://slack.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" /> X (Twitter) URL
                  </Label>
                  <Input
                    value={socials.x}
                    onChange={(e) => setSocials({...socials, x: e.target.value})}
                    placeholder="https://x.com/..."
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
