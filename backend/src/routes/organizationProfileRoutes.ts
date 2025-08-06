import { Router, Request, Response } from "express";
import OrganizationProfile from "../models/OrganizationProfile";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get all organization profiles (public)
router.get("/profiles", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, game, verified } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter object
    const filter: any = { isActive: true };

    if (search) {
      filter.$or = [
        { organizationName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (game) {
      filter.games = { $in: [game] };
    }

    if (verified === "true") {
      filter.isVerified = true;
    }

    const organizations = await OrganizationProfile.find(filter)
      .populate("userId", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await OrganizationProfile.countDocuments(filter);

    res.json({
      success: true,
      organizations,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: skip + organizations.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа",
    });
  }
});

// Get specific organization profile (public)
router.get("/profiles/:id", async (req: Request, res: Response) => {
  try {
    const organization = await OrganizationProfile.findById(
      req.params.id
    ).populate("userId", "name email avatar");

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Байгууллага олдсонгүй",
      });
    }

    res.json({
      success: true,
      organization,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа",
    });
  }
});

// Get current user's organization profile (protected)
router.get(
  "/my-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const organization = await OrganizationProfile.findOne({
        userId,
      }).populate("userId", "name email avatar");

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: "Байгууллагын профайл олдсонгүй",
        });
      }

      res.json({
        success: true,
        organization,
      });
    } catch (error) {
      console.error("Error fetching my organization profile:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Check if user has organization profile (protected)
router.get(
  "/has-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const organization = await OrganizationProfile.findOne({ userId });

      res.json({
        success: true,
        hasProfile: !!organization,
      });
    } catch (error) {
      console.error("Error checking organization profile:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Create organization profile (protected)
router.post(
  "/create-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const {
        organizationName,
        description,
        logo,
        logoPublicId,
        website,
        location,
        foundedYear,
        teamSize,
        games,
        achievements,
        socialMedia,
        contactInfo,
      } = req.body;

      // Check if user already has a profile
      const existingProfile = await OrganizationProfile.findOne({ userId });
      if (existingProfile) {
        return res.status(409).json({
          success: false,
          message: "Байгууллагын профайл аль хэдийн үүссэн байна",
        });
      }

      // Validate required fields
      if (!organizationName || !description || !contactInfo?.email) {
        return res.status(400).json({
          success: false,
          message:
            "Байгууллагын нэр, тайлбар болон холбоо барих и-мэйл шаардлагатай",
        });
      }

      // Create new organization profile
      const newProfile = new OrganizationProfile({
        userId,
        organizationName: organizationName.trim(),
        description: description.trim(),
        logo,
        logoPublicId,
        website: website?.trim(),
        location: location?.trim(),
        foundedYear: foundedYear ? Number(foundedYear) : undefined,
        teamSize: teamSize ? Number(teamSize) : undefined,
        games: Array.isArray(games) ? games : [],
        achievements: Array.isArray(achievements) ? achievements : [],
        socialMedia: socialMedia || {},
        contactInfo: {
          email: contactInfo.email.toLowerCase().trim(),
          phone: contactInfo.phone?.trim(),
          address: contactInfo.address?.trim(),
        },
      });

      await newProfile.save();

      const populatedProfile = await OrganizationProfile.findById(
        newProfile._id
      ).populate("userId", "name email avatar");

      res.status(201).json({
        success: true,
        message: "Байгууллагын профайл амжилттай үүслээ",
        organization: populatedProfile,
      });
    } catch (error) {
      console.error("Error creating organization profile:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Update organization profile (protected)
router.put(
  "/update-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const {
        organizationName,
        description,
        logo,
        logoPublicId,
        website,
        location,
        foundedYear,
        teamSize,
        games,
        achievements,
        socialMedia,
        contactInfo,
      } = req.body;

      // Find existing profile
      const existingProfile = await OrganizationProfile.findOne({ userId });
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: "Байгууллагын профайл олдсонгүй",
        });
      }

      // Update profile
      const updateData: any = {};

      if (organizationName !== undefined) {
        updateData.organizationName = organizationName.trim();
      }
      if (description !== undefined) {
        updateData.description = description.trim();
      }
      if (logo !== undefined) {
        updateData.logo = logo;
      }
      if (logoPublicId !== undefined) {
        updateData.logoPublicId = logoPublicId;
      }
      if (website !== undefined) {
        updateData.website = website?.trim();
      }
      if (location !== undefined) {
        updateData.location = location?.trim();
      }
      if (foundedYear !== undefined) {
        updateData.foundedYear = foundedYear ? Number(foundedYear) : undefined;
      }
      if (teamSize !== undefined) {
        updateData.teamSize = teamSize ? Number(teamSize) : undefined;
      }
      if (games !== undefined) {
        updateData.games = Array.isArray(games) ? games : [];
      }
      if (achievements !== undefined) {
        updateData.achievements = Array.isArray(achievements)
          ? achievements
          : [];
      }
      if (socialMedia !== undefined) {
        updateData.socialMedia = socialMedia || {};
      }
      if (contactInfo !== undefined) {
        updateData.contactInfo = {
          email: contactInfo.email?.toLowerCase().trim(),
          phone: contactInfo.phone?.trim(),
          address: contactInfo.address?.trim(),
        };
      }

      const updatedProfile = await OrganizationProfile.findByIdAndUpdate(
        existingProfile._id,
        updateData,
        { new: true }
      ).populate("userId", "name email avatar");

      res.json({
        success: true,
        message: "Байгууллагын профайл амжилттай шинэчлэгдлээ",
        organization: updatedProfile,
      });
    } catch (error) {
      console.error("Error updating organization profile:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Delete organization profile (protected)
router.delete(
  "/delete-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const organization = await OrganizationProfile.findOne({ userId });
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: "Байгууллагын профайл олдсонгүй",
        });
      }

      await OrganizationProfile.findByIdAndDelete(organization._id);

      res.json({
        success: true,
        message: "Байгууллагын профайл амжилттай устгагдлаа",
      });
    } catch (error) {
      console.error("Error deleting organization profile:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

export default router;
