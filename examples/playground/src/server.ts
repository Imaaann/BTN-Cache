import express from "express";
import path from "path";
import apiRouter from "./api/index";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use("/api", apiRouter);

const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
