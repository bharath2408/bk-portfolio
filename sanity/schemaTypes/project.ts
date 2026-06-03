import { defineField, defineType } from "sanity";

const ACCENTS = [
  { title: "Iris (violet)", value: "iris" },
  { title: "Cyan", value: "cyan" },
  { title: "Mint", value: "mint" },
];

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "kind", title: "Category label", type: "string" }),
    defineField({
      name: "accent",
      type: "string",
      options: { list: ACCENTS, layout: "radio" },
      initialValue: "iris",
    }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "description", type: "text", rows: 4 }),
    defineField({
      name: "tags",
      title: "Tech tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({ name: "url", title: "Live URL", type: "url" }),
    defineField({ name: "github", title: "GitHub URL", type: "url" }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "kind" } },
});
