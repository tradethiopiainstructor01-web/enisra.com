const FavoriteJob = require('../models/FavoriteJob');
const Job = require('../models/Job');

exports.addFavorite = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if already favorited
    const existingFavorite = await FavoriteJob.findOne({ userId, jobId });
    if (existingFavorite) {
      return res.status(409).json({ success: false, message: 'Job already favorited' });
    }

    const favorite = await FavoriteJob.create({ userId, jobId });
    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to favorite job', error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const result = await FavoriteJob.deleteOne({ userId, jobId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove favorite', error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const favorites = await FavoriteJob.find({ userId })
      .populate({
        path: 'jobId',
        model: 'Job',
        populate: {
          path: 'postedBy',
          model: 'User',
          select: 'fullName username email'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch favorites', error: error.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const favorite = await FavoriteJob.findOne({ userId, jobId });
    res.json({ success: true, isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check favorite status', error: error.message });
  }
};