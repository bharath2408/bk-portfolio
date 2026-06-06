import { type SchemaTypeDefinition } from "sanity";
import siteSettings from "./siteSettings";
import skillGroup from "./skillGroup";
import project from "./project";
import experience from "./experience";
import education from "./education";
import certification from "./certification";
import guestbook from "./guestbook";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [siteSettings, skillGroup, project, experience, education, certification, guestbook],
};
