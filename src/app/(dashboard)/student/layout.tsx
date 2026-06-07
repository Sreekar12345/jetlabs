import { requirePageRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { OnboardingClient } from "@/app/(auth)/student/onboarding/onboarding-client";
import { REQUIRE_VERIFICATION_BEFORE_ACCESS } from "@/lib/auth/verification-settings";
import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export default async function StudentSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePageRole("STUDENT");

  // Fetch student record from database to verify team assignment and check verification status
  const student = await db.user.findUnique({
    where: { id: session.user.id },
    select: { teamId: true, verificationStatus: true },
  });

  const showOnboarding = !student || !student.teamId;

  const status = student?.verificationStatus;
  const isVerified = status === "VERIFIED";

  return (
    <div className="space-y-6">
      {showOnboarding ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 lg:p-10 overflow-y-auto">
          <OnboardingClient userName={session.user.name || "Student"} />
        </div>
      ) : (
        <>
          {REQUIRE_VERIFICATION_BEFORE_ACCESS && !isVerified && (
            <div className="w-full">
              {status === "CORRECTION_REQUESTED" ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-sm text-orange-900 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-orange-100 p-2 text-orange-700 shrink-0">
                      <ShieldAlert className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-orange-950">Action Required: Correction Requested</p>
                      <p className="text-xs text-orange-700 mt-1">
                        Faculty has requested updates to your academic profile. Action features are locked.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/profile"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-orange-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors shrink-0"
                  >
                    Update Profile Info
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-amber-100 p-2 text-amber-700 shrink-0">
                      <AlertTriangle className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-950">Verification Pending</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Your student record is awaiting faculty verification. Some features will remain restricted.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/profile"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-white border border-amber-200 text-amber-800 px-4 text-xs font-semibold shadow-sm hover:bg-amber-100/50 transition-colors shrink-0"
                  >
                    View Status Details
                  </Link>
                </div>
              )}
            </div>
          )}
          {children}
        </>
      )}
    </div>
  );
}

