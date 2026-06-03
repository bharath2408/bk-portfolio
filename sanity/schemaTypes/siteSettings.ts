import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "email", type: "string" }),
    defineField({ name: "phone", type: "string" }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url" }),
    defineField({ name: "tagline", type: "string" }),
    defineField({ name: "blurb", title: "Hero blurb", type: "text", rows: 3 }),
    defineField({ name: "about", title: "About paragraph", type: "text", rows: 5 }),
    defineField({
      name: "stats",
      type: "array",
      of: [
        defineField({
          name: "stat",
          type: "object",
          fields: [
            { name: "value", type: "string" },
            { name: "label", type: "string" },
          ],
        }),
      ],
    }),
    defineField({
      name: "highlights",
      type: "array",
      of: [
        defineField({
          name: "highlight",
          type: "object",
          fields: [
            { name: "title", type: "string" },
            { name: "sub", type: "string" },
          ],
        }),
      ],
    }),
    defineField({
      name: "marquee",
      title: "Marquee tech strip",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
