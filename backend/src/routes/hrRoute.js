import express from "express";
import prisma from "../config/prisma.js";
import isAuth from "../middlewares/isAuth.js";
import isAdminOrHR from "../middlewares/isAdminOrHR.js";

const router = express.Router();

// Apply auth + role middleware for ALL HR routes
router.use(isAuth, isAdminOrHR);

/**
 * Get today's date range [today 00:00, tomorrow 00:00)
 */
function getTodayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return { today, tomorrow };
}

/**
 * 1) GET /dashboard
 * HR dashboard summary
 * NOTE: Attendance model is NOT present in your schema yet, so presentToday = 0 for now.
 */
router.get("/dashboard", async (req, res) => {
  try {
    const { today, tomorrow } = getTodayRange();

    // Only count real employees (role EMPLOYEE AND employee relation exists)
    const totalEmployees = await prisma.user.count({
      where: { role: "EMPLOYEE", employee: { isNot: null } },
    });

    // Attendance not implemented yet
    const presentToday = 0;

    // ✅ Correct overlap logic: fromDate < tomorrow AND toDate >= today
    const onLeaveToday = await prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
        fromDate: { lt: tomorrow },
        toDate: { gte: today },
      },
    });

    const pendingLeaves = await prisma.leaveRequest.count({
      where: { status: "PENDING" },
    });

    const absentToday = Math.max(totalEmployees - presentToday - onLeaveToday, 0);

    return res.status(200).json({
      success: true,
      message: "HR dashboard",
      data: {
        totalEmployees,
        presentToday,
        absentToday,
        onLeaveToday,
        pendingLeaves,
      },
    });
  } catch (err) {
    console.error("GET /dashboard error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * 2) GET /employees
 * Employee list for card UI (workStatus based on leave only for now)
 * Query params:
 * - search (name/email contains)
 * - department (exact match)
 */
router.get("/employees", async (req, res) => {
  try {
    const { search, department } = req.query;
    const { today, tomorrow } = getTodayRange();

    const where = {
      role: "EMPLOYEE",
      employee: { isNot: null },
    };

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
      ];
    }

    if (department) {
      // relation filter to match Employee.department exactly
      where.employee = { is: { department: String(department) } };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        employee: {
          select: {
            id: true,
            department: true,
            designation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!users.length) {
      return res.status(200).json({
        success: true,
        message: "No employees found",
        data: [],
      });
    }

    const employeeIds = users.map((u) => u.employee.id);

    // Batch query approved leaves overlapping today (NO N+1)
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId: { in: employeeIds },
        status: "APPROVED",
        fromDate: { lt: tomorrow },
        toDate: { gte: today },
      },
      select: { employeeId: true },
    });

    const onLeaveSet = new Set(leaves.map((l) => l.employeeId));

    const data = users.map((u) => ({
      userId: u.id,
      employeeId: u.employee.id,
      name: u.name,
      email: u.email,
      department: u.employee.department,
      designation: u.employee.designation,
      // Until attendance exists: ON_LEAVE else ABSENT
      workStatus: onLeaveSet.has(u.employee.id) ? "ON_LEAVE" : "ABSENT",
    }));

    return res.status(200).json({
      success: true,
      message: "Employee list",
      data,
    });
  } catch (err) {
    console.error("GET /employees error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * 3) GET /employees/:id
 * View-only employee profile (safe fields)
 * :id is User.id
 */
router.get("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        loginId: true,
        role: true,
        isActive: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            department: true,
            designation: true,
            dateOfJoin: true,
            yearOfJoining: true,
            managerId: true,
            profile: {
              select: {
                phone: true,
                dob: true,
                gender: true,
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
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee profile",
      data: user,
    });
  } catch (err) {
    console.error("GET /employees/:id error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * 4) GET /leaves/pending
 * Pending leave requests for HR approval
 */
router.get("/leaves/pending", async (req, res) => {
  try {
    const pending = await prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        fromDate: true,
        toDate: true,
        reason: true,
        status: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            department: true,
            designation: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        attachmentDocument: {
          select: { id: true, fileUrl: true, title: true, type: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Pending leave requests",
      data: pending,
    });
  } catch (err) {
    console.error("GET /leaves/pending error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * 5) PATCH /leaves/:id/approve
 * Approve leave request
 */
router.patch("/leaves/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const approverId = req.userId;

    if (!approverId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedByUserId: approverId,
        approvedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        approvedAt: true,
        approvedByUser: { select: { id: true, name: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Leave approved",
      data: updated,
    });
  } catch (err) {
    console.error("PATCH /leaves/:id/approve error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * 6) PATCH /leaves/:id/reject
 * Reject leave request
 * NOTE: Schema has no rejectedBy/rejectedAt fields, so we only set status and optional reason.
 */
router.patch("/leaves/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const leave = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        ...(reason ? { reason: String(reason) } : {}),
      },
      select: { id: true, status: true, reason: true },
    });

    return res.status(200).json({
      success: true,
      message: "Leave rejected",
      data: updated,
    });
  } catch (err) {
    console.error("PATCH /leaves/:id/reject error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
