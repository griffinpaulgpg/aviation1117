import { z } from "zod";

const requiredText = (field: string) => z.string().trim().min(1, `${field} is required`);

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const enquirySchema = z
  .object({
    fullName: requiredText("Full name").max(120),
    enquiryDate: optionalText,
    enquiryFormNumber: optionalText,
    qualification: requiredText("Qualification").max(120),
    schoolCollege: requiredText("School/College").max(180),
    selectedCourse: requiredText("Course").max(160),

    presentAddress: requiredText("Present address").max(1000),
    permanentAddress: requiredText("Permanent address").max(1000),

    email: requiredText("Email").email("Enter a valid email address").max(180),
    mobile: requiredText("Mobile")
      .max(30)
      .regex(/^[0-9+\-\s()]{7,30}$/, "Enter a valid mobile number"),
    landline: optionalText,

    dateOfBirth: requiredText("Date of birth").refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Enter a valid date of birth",
    ),
    gender: z.enum(["Female", "Male", "Other"], {
      message: "Gender is required",
    }),

    guardianName: requiredText("Guardian name").max(120),
    guardianOccupation: optionalText,

    enquirySources: z
      .array(requiredText("Enquiry source"))
      .min(1, "Select at least one enquiry source"),
    otherEnquirySource: optionalText,

    referenceName: optionalText,
    remarks: optionalText,
    counselorName: optionalText,
  })
  .superRefine((data, context) => {
    if (data.enquirySources.includes("Other") && !data.otherEnquirySource) {
      context.addIssue({
        code: "custom",
        message: "Other source details are required",
        path: ["otherEnquirySource"],
      });
    }
  });

export type EnquiryInput = z.infer<typeof enquirySchema>;
