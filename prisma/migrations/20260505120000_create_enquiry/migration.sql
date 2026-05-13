-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "enquiryNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "schoolCollege" TEXT NOT NULL,
    "selectedCourse" TEXT NOT NULL,
    "presentAddress" TEXT NOT NULL,
    "permanentAddress" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "landline" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianOccupation" TEXT,
    "enquirySources" TEXT[],
    "otherEnquirySource" TEXT,
    "referenceName" TEXT,
    "remarks" TEXT,
    "counselorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT,
    "image" TEXT NOT NULL,
    "reachUsLink" TEXT NOT NULL DEFAULT '/enquiry',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "applyLink" TEXT NOT NULL DEFAULT '/enquiry',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "caption" TEXT,
    "folderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrittenTestimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WrittenTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTestimonial" (
    "id" TEXT NOT NULL,
    "video" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'faculty',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSeed" (
    "key" TEXT NOT NULL,
    "seededAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentSeed_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_enquiryNumber_key" ON "Enquiry"("enquiryNumber");

-- CreateIndex
CREATE INDEX "Enquiry_email_idx" ON "Enquiry"("email");

-- CreateIndex
CREATE INDEX "Enquiry_mobile_idx" ON "Enquiry"("mobile");

-- CreateIndex
CREATE INDEX "Enquiry_selectedCourse_idx" ON "Enquiry"("selectedCourse");

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

-- CreateIndex
CREATE INDEX "Course_title_idx" ON "Course"("title");

-- CreateIndex
CREATE INDEX "Course_createdAt_idx" ON "Course"("createdAt");

-- CreateIndex
CREATE INDEX "Event_title_idx" ON "Event"("title");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryFolder_name_key" ON "GalleryFolder"("name");

-- CreateIndex
CREATE INDEX "GalleryPhoto_folderId_idx" ON "GalleryPhoto"("folderId");

-- CreateIndex
CREATE INDEX "GalleryPhoto_createdAt_idx" ON "GalleryPhoto"("createdAt");

-- CreateIndex
CREATE INDEX "WrittenTestimonial_name_idx" ON "WrittenTestimonial"("name");

-- CreateIndex
CREATE INDEX "WrittenTestimonial_createdAt_idx" ON "WrittenTestimonial"("createdAt");

-- CreateIndex
CREATE INDEX "VideoTestimonial_name_idx" ON "VideoTestimonial"("name");

-- CreateIndex
CREATE INDEX "VideoTestimonial_createdAt_idx" ON "VideoTestimonial"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyUser_email_key" ON "FacultyUser"("email");

-- CreateIndex
CREATE INDEX "FacultyUser_role_idx" ON "FacultyUser"("role");

-- CreateIndex
CREATE INDEX "FacultyUser_createdAt_idx" ON "FacultyUser"("createdAt");

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "GalleryFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
