import Poll from "../Models/Poll.js";
import User from "../Models/User.js"; // Assuming User model is needed for created_by or society lookup

export const createPoll = async (req, res) => {
  try {
    const { question, options, expires_at, society_id } = req.body;

    if (!question || !options || !Array.isArray(options)) {
      return res
        .status(400)
        .json({ message: "Question and options are required." });
    }

    if (options.length < 2 || options.length > 6) {
      return res
        .status(400)
        .json({ message: "Poll must have between 2 to 6 options." });
    }

    const formattedOptions = options
      .map((text) => (typeof text === "string" ? text.trim() : null))
      .filter((text) => text);

    if (formattedOptions.length !== options.length) {
      return res
        .status(400)
        .json({ message: "All options must be non-empty strings." });
    }

    const poll = await Poll.create({
      question: question.trim(),
      type: req.body.type || "single",
      logo: req.body.logo || "",
      options: formattedOptions.map((text) => ({ text })),
      created_by: req.user._id,
      society_id: society_id || req.user.joined_society,
      expires_at,
    });

    res.status(201).json({
      message: "Poll created successfully",
      poll,
    });
  } catch (err) {
    console.error("Create poll error:", err);
    res.status(500).json({ message: "Server error during poll creation" });
  }
};

export const getPollsBySociety = async (req, res) => {
  try {
    const societyId = req.params.societyId || req.user.joined_society;

    const polls = await Poll.find({ society_id: societyId }).populate(
      "created_by",
      "name"
    );

    res.status(200).json(polls);
  } catch (err) {
    console.error("Get polls error:", err);
    res.status(500).json({ message: "Server error while fetching polls" });
  }
};

export const voteInPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (
      typeof optionIndex !== "number" ||
      optionIndex < 0 ||
      optionIndex >= poll.options.length
    ) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    const isSingleVote = poll.type === "single";

    const alreadyVoted = poll.options.some((opt) =>
      opt.votes.some((voterId) => voterId.toString() === userId.toString())
    );

    if (isSingleVote && alreadyVoted) {
      return res
        .status(400)
        .json({ message: "You have already voted in this poll" });
    }

    poll.options[optionIndex].votes.push(userId);
    await poll.save();

    res.status(200).json({ message: "Vote registered successfully", poll });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Server error during voting" });
  }
};

export const getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const results = poll.options.map((opt) => ({
      text: opt.text,
      votes: opt.votes.length,
    }));

    res.status(200).json({
      question: poll.question,
      results,
      totalVotes: results.reduce((sum, r) => sum + r.votes, 0),
    });
  } catch (err) {
    console.error("Poll results error:", err);
    res.status(500).json({ message: "Server error while fetching results" });
  }
};

export const togglePollLock = async (req, res) => {
  const { pollId } = req.params;
  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    poll.locked = !poll.locked;
    await poll.save();

    res.status(200).json({ message: "Poll lock toggled", poll });
  } catch (err) {
    console.error("Toggle lock error:", err);
    res.status(500).json({ message: "Server error while toggling lock" });
  }
};