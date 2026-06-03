import { defineField, defineType } from "sanity";

export default defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({ name: "role", type: "string", validation: (r) => r.required() }),
    defineField({ name: "company", type: "string" }),
    defineField({ name: "place", type: "string" }),
    defineField({ name: "period", type: "string" }),
    defineField({ name: "summary", type: "text", rows: 4 }),
    defineField({
      name: "bullets",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "order", type: "number" }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "role", subtitle: "company" } },
});
