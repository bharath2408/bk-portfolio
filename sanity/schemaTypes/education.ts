import { defineField, defineType } from "sanity";

export default defineType({
  name: "education",
  title: "Education",
  type: "document",
  fields: [
    defineField({ name: "degree", type: "string", validation: (r) => r.required() }),
    defineField({ name: "school", type: "string" }),
    defineField({ name: "year", type: "string" }),
    defineField({ name: "cgpa", title: "CGPA", type: "string" }),
  ],
  preview: { select: { title: "degree", subtitle: "school" } },
});
