import type { AdminDashboardData } from "@/lib/content-data";

export function getEmptyAdminDashboardData(): AdminDashboardData {
  return {
    databaseReady: false,
    firebaseError: null,
    courses: [],
    events: [],
    galleryFolders: [],
    galleryPhotos: [],
    writtenTestimonials: [],
    videoTestimonials: [],
    testimonialReviews: [],
    enquiries: [],
    enquirySources: [],
    facultyUsers: [],
    adminUsers: [],
    loginAccounts: [],
    chatbotChats: [],
    settings: {
      whatsappEnabled: true,
      chatbotEnabled: true,
      instagramEnabled: true,
      youtubeEnabled: true,
    },
  };
}
