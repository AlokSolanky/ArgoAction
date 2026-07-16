const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const voteSchema = new mongoose.Schema({
  option: { type: String, unique: true },
  count: { type: Number, default: 0 },
});

const Vote = mongoose.model("Vote", voteSchema);

async function connectWithRetry() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/votingdb";
  while (true) {
    try {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB");
      await Vote.findOneAndUpdate(
        { option: "cat" },
        { $setOnInsert: { count: 0 } },
        { upsert: true }
      );
      await Vote.findOneAndUpdate(
        { option: "dog" },
        { $setOnInsert: { count: 0 } },
        { upsert: true }
      );
      break;
    } catch (err) {
      console.log("MongoDB not ready, retrying in 3s...");
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
}
connectWithRetry();

app.get("/votes", async (req, res) => {
  const votes = await Vote.find();
  res.json(votes);
});

app.post("/vote", async (req, res) => {
  const { option } = req.body;
  if (!["cat", "dog"].includes(option)) {
    return res.status(400).json({ error: "Invalid option" });
  }
  const updated = await Vote.findOneAndUpdate(
    { option },
    { $inc: { count: 1 } },
    { new: true }
  );
  res.json(updated);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
