"use client";

import React, { useState } from "react";
import { Modal, ModalCloseButton, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationBadge } from "./VerificationBadge";
import { AuditHistoryPanel } from "./AuditHistoryPanel";
import { toast } from "sonner";
import { ShieldAlert, LoaderCircle, Edit3, Eye, FileText, UserCheck } from "lucide-react";

type MembershipInfo = {
  team: {
    id: string;
    name: string;
    faculty: {
      name: string;
    } | null;
  } | null;
};

type StudentRecord = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  parentPhoneNumber: string | null;
  department: string | null;
  batchYear: string | null;
  rollNumber: string | null;
  createdAt: string;
  verificationStatus: "PENDING" | "VERIFIED" | "CORRECTION_REQUESTED" | "REJECTED";
  verifiedBy: string | null;
  verifiedAt: string | null;
  correctionRequestedAt: string | null;
  linkedinUrl: string | null;
  skills: string | null;
  bio: string | null;
  memberships?: MembershipInfo[];
};

type StudentDetailsDrawerProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentRecord;
  onSuccess: () => void;
};

export function StudentDetailsDrawer({
  isOpen,
  onOpenChange,
  student,
  onSuccess,
}: StudentDetailsDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    rollNumber: student.rollNumber || "",
    phoneNumber: student.phoneNumber || "",
    parentPhoneNumber: student.parentPhoneNumber || "",
    department: student.department || "",
    batchYear: student.batchYear || "",
  });
  const [editReason, setEditReason] = useState("");
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const teamInfo = student.memberships?.[0]?.team || null;
  const facultyAdvisor = teamInfo?.faculty?.name || "Unassigned";
  const teamName = teamInfo?.name || "Unassigned";

  // Reset edit fields when student changes
  React.useEffect(() => {
    setEditFields({
      rollNumber: student.rollNumber || "",
      phoneNumber: student.phoneNumber || "",
      parentPhoneNumber: student.parentPhoneNumber || "",
      department: student.department || "",
      batchYear: student.batchYear || "",
    });
    setIsEditing(false);
    setEditReason("");
  }, [student]);

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await fetch(`/api/faculty/student-verification/${student.id}/verify`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to verify student.");
      }

      toast.success("Student successfully verified.");
      onSuccess();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to verify student.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSaveChanges() {
    if (!editReason.trim()) {
      toast.error("Please enter a reason for modifying academic records.");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/faculty/student-verification/${student.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            rollNumber: editFields.rollNumber.trim() || null,
            phoneNumber: editFields.phoneNumber.trim() || null,
            parentPhoneNumber: editFields.parentPhoneNumber.trim() || null,
            department: editFields.department.trim() || null,
            batchYear: editFields.batchYear.trim() || null,
          },
          reason: editReason.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update details.");
      }

      toast.success("Student records updated successfully.");
      setIsEditing(false);
      setShowConfirmEdit(false);
      setEditReason("");
      onSuccess();
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update details.");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <>
      <Modal open={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 bg-[#f8fafc] rounded-3xl shadow-xl">
          <ModalHeader className="flex justify-between items-center border-b border-slate-200 pb-3 mb-5 bg-white -mx-6 -mt-6 p-6 rounded-t-3xl shadow-sm">
            <ModalTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="size-5 text-indigo-600" />
              <span>Student Profile Verification Details</span>
            </ModalTitle>
            <ModalCloseButton onClick={() => onOpenChange(false)} />
          </ModalHeader>

          <Tabs defaultValue="details" className="space-y-4 text-slate-900">
            <TabsList className="bg-slate-100 p-1 rounded-xl w-fit">
              <TabsTrigger value="details" className="rounded-lg px-4 py-1.5 text-xs font-semibold">
                <Eye className="size-3.5 mr-2 inline" /> Details &amp; Edit
              </TabsTrigger>
              <TabsTrigger value="audit" className="rounded-lg px-4 py-1.5 text-xs font-semibold">
                <FileText className="size-3.5 mr-2 inline" /> Audit Trail
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {/* Profile Card Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{student.name}</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{student.email}</p>
                </div>
                <VerificationBadge status={student.verificationStatus} />
              </div>

              {!isEditing ? (
                /* View Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="block text-slate-400 font-medium">Roll Number</span>
                          <span className="font-bold text-slate-700">{student.rollNumber || "Not Provided"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Department</span>
                          <span className="font-bold text-slate-700">{student.department || "Not Provided"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Batch</span>
                          <span className="font-bold text-slate-700">{student.batchYear || "Not Provided"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Reg Date</span>
                          <span className="font-bold text-slate-700">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Information</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="block text-slate-400 font-medium">Student Mobile</span>
                          <span className="font-bold text-slate-700">{student.phoneNumber || "Not Provided"}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Parent Mobile</span>
                          <span className="font-bold text-slate-700">{student.parentPhoneNumber || "Not Provided"}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-slate-400 font-medium">LinkedIn URL</span>
                          <span className="font-bold text-slate-700 truncate block">
                            {student.linkedinUrl ? (
                              <a href={student.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                                {student.linkedinUrl}
                              </a>
                            ) : "Not Provided"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Academic Info */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 md:col-span-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Routing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="block text-slate-400 font-medium">Team Assignment</span>
                          <span className="font-bold text-slate-750">{teamName}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Faculty Advisor</span>
                          <span className="font-bold text-slate-750">{facultyAdvisor}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Skills Cluster</span>
                          <span className="font-bold text-slate-700 truncate block" title={student.skills || ""}>
                            {student.skills || "None Mapped"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Info */}
                  {student.verificationStatus === "VERIFIED" && student.verifiedAt && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs flex items-center justify-between text-emerald-800">
                      <div>
                        Verified by <strong className="font-extrabold">{student.verifiedBy}</strong> on{" "}
                        {new Date(student.verifiedAt).toLocaleString()}
                      </div>
                      <UserCheck className="size-4 shrink-0" />
                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div className="flex justify-end gap-3 border-t border-slate-150 pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="h-10 rounded-xl font-semibold gap-1.5"
                    >
                      <Edit3 className="size-4" /> Edit Profile
                    </Button>

                    {student.verificationStatus !== "VERIFIED" && (
                      <Button
                        type="button"
                        onClick={handleVerify}
                        disabled={verifying}
                        className="h-10 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 px-5"
                      >
                        {verifying ? (
                          <>
                            <LoaderCircle className="size-4 animate-spin mr-2" /> Verifying...
                          </>
                        ) : (
                          "Verify Student"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowConfirmEdit(true);
                  }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Edit Academic &amp; Contact Records</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Roll Number *</label>
                        <Input
                          value={editFields.rollNumber}
                          onChange={(e) => setEditFields({ ...editFields, rollNumber: e.target.value })}
                          required
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Department *</label>
                        <Input
                          value={editFields.department}
                          onChange={(e) => setEditFields({ ...editFields, department: e.target.value })}
                          required
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Batch *</label>
                        <Input
                          value={editFields.batchYear}
                          onChange={(e) => setEditFields({ ...editFields, batchYear: e.target.value })}
                          required
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Student Phone</label>
                        <Input
                          value={editFields.phoneNumber}
                          onChange={(e) => setEditFields({ ...editFields, phoneNumber: e.target.value })}
                          className="h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Parent Phone</label>
                        <Input
                          value={editFields.parentPhoneNumber}
                          onChange={(e) => setEditFields({ ...editFields, parentPhoneNumber: e.target.value })}
                          className="h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-150 pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="h-10 rounded-xl font-semibold px-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md px-5 border-0"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="audit" className="pt-2">
              <AuditHistoryPanel studentId={student.id} refreshTrigger={refreshTrigger} />
            </TabsContent>
          </Tabs>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog Modal for Edits */}
      {showConfirmEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !savingEdit && setShowConfirmEdit(false)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200 text-slate-900">
            <div className="p-6 space-y-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <ShieldAlert className="size-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Academic Modifications</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  This action will modify the student's official academic credentials (department, roll, batch, or phone records). Please provide an audit reason for this change.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Reason for Edit *</label>
                <Input
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Corrected typo in roll number from student request"
                  disabled={savingEdit}
                  required
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl font-semibold px-4 text-xs"
                  disabled={savingEdit}
                  onClick={() => {
                    setShowConfirmEdit(false);
                    setEditReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold flex items-center justify-center gap-1.5 text-xs px-5 border-0"
                  disabled={savingEdit}
                  onClick={handleSaveChanges}
                >
                  {savingEdit ? (
                    <>
                      <LoaderCircle className="size-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Confirm & Save"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
