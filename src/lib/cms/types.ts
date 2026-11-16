import type { Project } from "@/data/projects";
export type ManagedProject = Project & {
  id: number;
  status: "draft" | "publish" | "trash";
  order: number;
  modified: string;
};
export type AdminUser = {
  id: number;
  name: string;
  canManageSettings: boolean;
};
export type CompanySettings = Partial<
  Record<
    | "thaiDescription"
    | "aboutHeading"
    | "about"
    | "invitation"
    | "legalName"
    | "address"
    | "hours"
    | "email",
    string
  >
>;
