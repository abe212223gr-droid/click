const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware (መረጃዎችን በ JSON እና CORS ለመቀበል)
app.use(express.json());
app.use(cors());

// 1. የ MongoDB Connection Link (የእርስዎን የዳታቤዝ ሊንክ እና ፓስወርድ እዚህ ይተኩ)
const MONGO_URI = "mongodb+srv://abe212223gr_db_user:EMUHwhB0uLTwzn4l@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority";

// ከ MongoDB ጋር ማያያዝ
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Database በደህና ተገናኝቷል!"))
  .catch((err) => console.error("❌ የዳታቤዝ ኤረር:", err));

// 2. የተጫዋች መረጃ Schema (መዋቅር)
const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  firstName: { type: String, default: '' },
  score: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// 3. API - የነካውን (Tap) ነጥብ ለመጨመር እና ሴቭ ለማድረግ
app.post('/api/tap', async (req, res) => {
  const { telegramId, firstName } = req.body;

  if (!telegramId) {
    return res.status(400).json({ error: "Telegram ID ያስፈልጋል!" });
  }

  try {
    // ተጫዋቹ ካለ ነጥቡን +1 ይጨምራል፤ ከሌለ አዲስ ይመዘግባል
    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({ telegramId, firstName, score: 1 });
    } else {
      user.score += 1;
    }

    await user.save();
    res.json({ success: true, score: user.score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. API - የተጫዋቹን ነጥብ ለማንበብ (Get User Score)
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.id });
    if (user) {
      res.json({ score: user.score });
    } else {
      res.json({ score: 0 });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ሰርቨሩን ማስነሳት
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ሰርቨሩ በ Port ${PORT} ላይ እየሰራ ነው`));
