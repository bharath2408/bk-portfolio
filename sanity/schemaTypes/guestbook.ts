import { defineField, defineType } from "sanity";

export default defineType({
  name:  "guestbookEntry",
  title: "Guestbook Entry",
  type:  "document",
  fields: [
    defineField({
      name:       "name",
      type:       "string",
      title:      "Name",
      validation: (r) => r.required().max(50),
    }),
    defineField({
      name:       "message",
      type:       "text",
      title:      "Message",
      rows:       3,
      validation: (r) => r.required().max(280),
    }),
    defineField({
      name:  "location",
      type:  "string",
      title: "Location (optional)",
    }),
    defineField({
      name:         "emoji",
      type:         "string",
      title:        "Emoji avatar",
      initialValue: "👋",
    }),
    defineField({
      name:         "approved",
      type:         "boolean",
      title:        "Approved",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "message" },
  },
  orderings: [
    {
      title: "Newest first",
      name:  "createdDesc",
      by:    [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
