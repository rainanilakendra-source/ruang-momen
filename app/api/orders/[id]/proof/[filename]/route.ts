import { getCurrentUser } from "../../../../../lib/auth";
import { ADMIN_ROLES, hasRole } from "../../../../../lib/roles";
import { orderProofStorageKey } from "../../../../../lib/orders";
import { prisma } from "../../../../../lib/prisma";
import { storage } from "../../../../../lib/storage";
const mime: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; filename: string }> }) { const user = await getCurrentUser(); if (!user) return new Response("Unauthorized", { status: 401 }); const { id, filename } = await params; const proof = await prisma.paymentProof.findFirst({ where: { orderId: id, ...(hasRole(user, ADMIN_ROLES) ? {} : { order: { userId: user.id } }) }, select: { fileUrl: true } }); if (!proof?.fileUrl.endsWith(`/${filename}`)) return new Response("Not found", { status: 404 }); const key = orderProofStorageKey(id, proof.fileUrl); const contentType = mime[filename.split(".").pop() ?? ""]; if (!key || !contentType) return new Response("Not found", { status: 404 }); try { const bytes = await storage.read(key); return new Response(Uint8Array.from(bytes).buffer, { headers: { "Content-Type": contentType, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } }); } catch { return new Response("Not found", { status: 404 }); } }
