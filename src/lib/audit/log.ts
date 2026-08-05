import type { NextRequest } from "next/server";
import { ActivityLog } from "@/models";
import type { ActivityAction } from "@/constants";
import { getClientIp } from "@/lib/security/rate-limit";

export async function logActivity(params: {
  actorId?: string;
  actorRole?: string;
  action: ActivityAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  request?: NextRequest | Request;
}) {
  try {
    await ActivityLog.create({
      actor: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata,
      ip: params.request ? getClientIp(params.request) : undefined,
      userAgent: params.request?.headers.get("user-agent") ?? undefined,
    });
  } catch (err) {
    console.error("[audit_log_failed]", err);
  }
}
