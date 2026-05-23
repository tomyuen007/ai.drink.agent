const express = require("express");
const path = require("path");

const app = express();
const DIST = path.join(__dirname, "dist");

app.use(express.static(DIST, { maxAge: "1h", index: "index.html" }));
app.get("*", (_req, res) => res.sendFile(path.join(DIST, "index.html")));

if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // Lambda mode — export handler for serverless-http
  const serverless = require("serverless-http");
  module.exports.handler = serverless(app);
} else {
  // Standalone mode — listen directly (npm run serve:lambda)
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`UI  →  http://localhost:${PORT}`);
    console.log(`      (serving ${DIST})`);
  });
}
