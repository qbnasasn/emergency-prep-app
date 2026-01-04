import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAnnouncements, getVideos, getSocialLinks } from "@/lib/actions/admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

const ADMIN_EMAIL = "admin@prepsafe.app";

export default async function AdminPage() {
  const user = await getAuthUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/");
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
