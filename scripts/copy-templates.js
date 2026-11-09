// Copies only *.hbs files from the whitelisted source dirs into build/.
// Nothing else from src/ is copied and the templates are never served statically.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const TEMPLATE_DIRS = ["src/service/jira/templates"];

for (const rel of TEMPLATE_DIRS) {
  const from = path.join(root, rel);
  const to = path.join(root, "build", rel);
  fs.mkdirSync(to, { recursive: true });
  for (const file of fs.readdirSync(from)) {
    if (path.extname(file) !== ".hbs") continue;
    fs.copyFileSync(path.join(from, file), path.join(to, file));
    console.log(`copied ${path.join(rel, file)}`);
  }
}
