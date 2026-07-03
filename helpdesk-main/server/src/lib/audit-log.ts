import prisma from "../db";

export async function logAudit(action: string, userId: string, details: string) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
