import type { StructureResolver } from "sanity/structure";

const SINGLETONS = [
  { id: "siteSettings", title: "Site Settings", type: "siteSettings" },
  { id: "education", title: "Education", type: "education" },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map((s) =>
        S.listItem()
          .title(s.title)
          .id(s.id)
          .child(S.document().schemaType(s.type).documentId(s.id)),
      ),
      S.divider(),
      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("skillGroup").title("Skill Groups"),
      S.documentTypeListItem("experience").title("Experience"),
      S.documentTypeListItem("certification").title("Certifications"),
    ]);
