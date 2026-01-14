import { verifyAdmin } from "@/lib/actions/admin-auth";
import { getAnnouncements, getVideos, getSocialLinks } from "@/lib/actions/admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminLogin } from "@/components/admin/admin-login";

export default async function AdminPage() {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  // Parallel data fetching
  const [announcements, videos, socialLinks] = await Promise.all([
    getAnnouncements(),
    getVideos(),
    getSocialLinks(),
  ]);

  return (
    <AdminDashboard
      announcements={announcements}
      videos={videos}
      socialLinks={socialLinks}
    />
  );
}
