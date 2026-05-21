export type FirebaseCourse = {
  id: string;
  title: string;
  description: string;
  duration?: string | null;
  image: string;
  reachUsLink?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseEvent = {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  applyLink?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseEnquiry = {
  id: string;
  enquiryNumber: string;
  fullName: string;
  qualification?: string;
  schoolCollege?: string;
  email: string;
  mobile: string;
  landline?: string;
  selectedCourse: string;
  enquirySources?: string[];
  presentAddress?: string;
  permanentAddress?: string;
  gender?: string;
  guardianName?: string;
  guardianOccupation?: string;
  referenceName?: string;
  remarks?: string;
  counselorName?: string;
  declarationAccepted?: boolean;
  status: "New" | "Contacted" | "Enrolled" | "Rejected";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseChatbotChat = {
  id: string;
  userMessage: string;
  botReply: string;
  guidedSelections?: string[];
  conversation?: Array<{
    from: "bot" | "user";
    text: string;
    time: string;
  }>;
  pageUrl: string;
  sessionId: string;
  timestamp: string;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseSettings = {
  whatsappEnabled: boolean;
  chatbotEnabled: boolean;
  instagramEnabled?: boolean;
  youtubeEnabled?: boolean;
  updatedAt?: string;
};

export type FirebaseEnquirySource = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseGalleryFolder = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseGalleryPhoto = {
  id: string;
  image: string;
  folderId?: string | null;
  folderName?: string | null;
  caption?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseWrittenTestimonial = {
  id: string;
  name: string;
  position: string;
  description: string;
  photo?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseVideoTestimonial = {
  id: string;
  video: string;
  name: string;
  position: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseFacultyUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseAdminUser = {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  isPrimary: boolean;
  role: string;
  createdAt: string;
  updatedAt?: string;
};

export type FirebaseLoginRole = "Admin" | "Staff" | "Counsellor";

export type FirebaseLoginAccount = {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: FirebaseLoginRole;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt?: string;
};
