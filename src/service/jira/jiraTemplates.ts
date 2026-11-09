import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

// Templates live in a fixed directory next to this file. Only names from this
// whitelist can be rendered, so request input can never select a file path.
const TEMPLATES_DIR = path.join(__dirname, "templates");

const TEMPLATE_FILES = {
  tntEpics: "tntEpics.hbs",
  groupedIssues: "groupedIssues.hbs",
  groupedIssuesByEpic: "groupedIssuesByEpic.hbs",
} as const;

export type TemplateName = keyof typeof TEMPLATE_FILES;

const compiled = new Map<TemplateName, HandlebarsTemplateDelegate>();

export const renderTemplate = (name: TemplateName, data: unknown): string => {
  let template = compiled.get(name);
  if (!template) {
    template = Handlebars.compile(
      fs.readFileSync(path.join(TEMPLATES_DIR, TEMPLATE_FILES[name]), "utf8"),
    );
    compiled.set(name, template);
  }
  return template(data);
};
