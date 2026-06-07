import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VerificationBadgeProps = {
  status: "PENDING" | "VERIFIED" | "CORRECTION_REQUESTED" | "REJECTED";
  className?: string;
};

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const styles = {
    PENDING: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-50",
    VERIFIED: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    CORRECTION_REQUESTED: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-50",
    REJECTED: "bg-red-50 border-red-200 text-red-700 hover:bg-red-50",
  };

  const labels = {
    PENDING: "Pending Verification",
    VERIFIED: "Verified",
    CORRECTION_REQUESTED: "Correction Requested",
    REJECTED: "Rejected",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-lg text-[11px] px-2.5 py-0.5 font-bold tracking-wide border shadow-none",
        styles[status] || styles.PENDING,
        className
      )}
    >
      {labels[status] || status}
    </Badge>
  );
}
