import { defineField, defineType } from "sanity";

const ACCENTS = [
  { title: "Iris (violet)", value: "iris" },
  { title: "Cyan", value: "cyan" },
  { title: "Mint", value: "mint" },
];

export default defineType({
  name: "skillGroup",
  title: "Skill Group",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "accent",
      type: "string",
      options: { list: ACCENTS, layout: "radio" },
      initialValue: "iris",
    }),
    defineField({ name: "order", type: "number" }),
    defineField({
      name: "items",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "accent" } },
});
