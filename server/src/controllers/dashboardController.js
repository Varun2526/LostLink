import ItemPost from "../models/ItemPost.js";
import Claim from "../models/Claim.js";

// Everything the dashboard needs in one request, so the page does not
// have to fire five queries of its own.
const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const [
      myPosts,
      myLost,
      myFound,
      myOpen,
      myClaimed,
      myResolved,
      claimsMade,
      claimsApproved,
      claimsPending,
      claimsReceived,
      pendingOnMyPosts,
      campusOpen,
    ] = await Promise.all([
      ItemPost.countDocuments({ postedBy: userId }),
      ItemPost.countDocuments({ postedBy: userId, type: "lost" }),
      ItemPost.countDocuments({ postedBy: userId, type: "found" }),
      ItemPost.countDocuments({ postedBy: userId, status: "open" }),
      ItemPost.countDocuments({ postedBy: userId, status: "claimed" }),
      ItemPost.countDocuments({ postedBy: userId, status: "resolved" }),
      Claim.countDocuments({ claimant: userId }),
      Claim.countDocuments({ claimant: userId, status: "approved" }),
      Claim.countDocuments({ claimant: userId, status: "pending" }),
      Claim.countDocuments({ owner: userId }),
      Claim.countDocuments({ owner: userId, status: "pending" }),
      ItemPost.countDocuments({ status: "open" }),
    ]);

    const recentPosts = await ItemPost.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title type status category createdAt");

    res.json({
      posts: {
        total: myPosts,
        lost: myLost,
        found: myFound,
        open: myOpen,
        claimed: myClaimed,
        resolved: myResolved,
      },
      claims: {
        made: claimsMade,
        approved: claimsApproved,
        pending: claimsPending,
        received: claimsReceived,
        awaitingMyDecision: pendingOnMyPosts,
      },
      campus: {
        openPosts: campusOpen,
      },
      recentPosts,
    });
  } catch (error) {
    console.log("Dashboard stats error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export { getStats };
