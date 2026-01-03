import express from "express";
import prisma from "../config/prisma.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// protect all routes - employee must be logged in
router.use(isAuth);

function getTodayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
}

// helper: get employee by userId or return 404
async function getEmployeeOrSend404(userId, res) {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) {
    res.status(404).json({ success: false, message: "Employee record not found" });
    return null;
  }
  return employee;
}

/**
 * 1) GET /dashboard
 */
router.get("/dashboard", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const employee = await getEmployeeOrSend404(userId, res);
    if (!employee) return;

    const { today, tomorrow } = getTodayRange();

    const totalLeaves = await prisma.leaveRequest.count({
      where: { employeeId: employee.id },
    });

    const approvedLeaves = await prisma.leaveRequest.count({
      where: { employeeId: employee.id, status: "APPROVED" },
    });

    const pendingLeaves = await prisma.leaveRequest.count({
      where: { employeeId: employee.id, status: "PENDING" },
    });

    // todayStatus: check approved leave overlapping today
    const onLeave = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: "APPROVED",
        fromDate: { lt: tomorrow },
        toDate: { gte: today },
      },
      select: { id: true },
    });

    const todayStatus = onLeave ? "ON_LEAVE" : "WORKING";

    return res.status(200).json({
      success: true,
      message: "Employee dashboard",
      data: { totalLeaves, approvedLeaves, pendingLeaves, todayStatus },
    });
  } catch (err) {
    console.error("GET /employee/dashboard error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 2) GET /me
 */
router.get("/me", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        loginId: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            department: true,
            designation: true,
            dateOfJoin: true,
            profile: {
              select: {
                phone: true,
                addressLine: true,
                city: true,
                state: true,
                country: true,
                pincode: true,
                emergencyContactName: true,
                emergencyContactPhone: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ success: false, message: "Employee profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee profile",
      data: user,
    });
  } catch (err) {
    console.error("GET /employee/me error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 3) PATCH /me
 * Update only employee profile fields
 */
router.patch("/me", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const employee = await getEmployeeOrSend404(userId, res);
    if (!employee) return;

    const allowed = [
      "phone",
      "addressLine",
      "city",
      "state",
      "country",
      "pincode",
      "emergencyContactName",
      "emergencyContactPhone",
    ];

    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    // Upsert profile (EmployeeProfile.employeeId is unique)
    const profile = await prisma.employeeProfile.upsert({
      where: { employeeId: employee.id },
      create: { employeeId: employee.id, ...payload },
      update: { ...payload },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: profile,
    });
  } catch (err) {
    console.error("PATCH /employee/me error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 4) POST /leaves
 * Apply for leave
 */
router.post("/leaves", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const employee = await getEmployeeOrSend404(userId, res);
    if (!employee) return;

    const { fromDate, toDate, reason, attachmentDocumentId } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required",
      });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    if (from > to) {
      return res.status(400).json({
        success: false,
        message: "fromDate must be before or equal to toDate",
      });
    }

    // Optional: prevent overlapping leave requests (PENDING/APPROVED)
    const overlap = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: employee.id,
        status: { in: ["PENDING", "APPROVED"] },
        fromDate: { lt: to },
        toDate: { gte: from },
      },
      select: { id: true },
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: "Leave dates overlap with an existing request",
      });
    }

    const created = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        fromDate: from,
        toDate: to,
        reason: reason || null,
        attachmentDocumentId: attachmentDocumentId || null,
        status: "PENDING",
      },
      select: {
        id: true,
        employeeId: true,
        fromDate: true,
        toDate: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Leave applied",
      data: created,
    });
  } catch (err) {
    console.error("POST /employee/leaves error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 5) GET /leaves
 * List logged-in employee's leaves
 */
router.get("/leaves", async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const employee = await getEmployeeOrSend404(userId, res);
    if (!employee) return;

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      select: {
        id: true,
        status: true,
        fromDate: true,
        toDate: true,
        reason: true,
        approvedAt: true,
        createdAt: true,
        approvedByUser: { select: { id: true, name: true } },
        attachmentDocument: { select: { id: true, title: true, fileUrl: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Leave requests",
      data: leaves,
    });
  } catch (err) {
    console.error("GET /employee/leaves error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
