"use client";

import React, { useEffect, useState, useDeferredValue } from "react";
import { VerificationBadge } from "./VerificationBadge";
import { StudentDetailsDrawer } from "./StudentDetailsDrawer";
import { CorrectionRequestModal } from "./CorrectionRequestModal";
import { Search, LoaderCircle, Users2, Eye, UserCheck, AlertOctagon, Edit3, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

export function StudentVerificationTable() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  // Drawer / Modal states
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Directly verifying inline state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (selectedStatus !== "ALL") queryParams.append("status", selectedStatus);
        if (selectedDept !== "ALL") queryParams.append("department", selectedDept);
        if (deferredSearchQuery) queryParams.append("searchQuery", deferredSearchQuery);

        const res = await fetch(`/api/faculty/student-verification?${queryParams.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || "Failed to fetch students.");
        }

        setStudents(data.students || []);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load verification list.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [selectedStatus, selectedDept, deferredSearchQuery, refreshTrigger]);

  async function handleVerify(studentId: string, studentName: string) {
    setVerifyingId(studentId);
    try {
      const res = await fetch(`/api/faculty/student-verification/${studentId}/verify`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to verify student.");
      }

      toast.success(`${studentName} successfully verified.`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to verify student.");
    } finally {
      setVerifyingId(null);
    }
  }

  const departments = ["CSE", "AIML", "ECE", "IT", "DS"];

  const statusTabs = [
    { value: "ALL", label: "All Students" },
    { value: "PENDING", label: "Pending" },
    { value: "CORRECTION_REQUESTED", label: "Correction Requested" },
    { value: "VERIFIED", label: "Verified" },
    { value: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="space-y-6 bg-white -mx-4 -my-6 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-4.5rem)] text-slate-950">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Student Verification</h1>
        <p className="text-sm text-slate-500 font-medium">
          Validate and audit student profile details to prevent incorrect or fake academic records.
        </p>
      </div>

      {/* Toolbar filter controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-11 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-slate-950"
            placeholder="Search student by name, email, roll..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-slate-450" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-11 w-[160px] rounded-xl border-slate-200 bg-slate-50/50 text-xs shadow-none px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Tab list */}
      <div className="border-b border-slate-100 flex flex-wrap gap-2 pb-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all duration-150 ${
              selectedStatus === tab.value
                ? "border-indigo-650 text-indigo-650"
                : "border-transparent text-slate-450 hover:text-slate-750"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-450">
            <LoaderCircle className="size-8 animate-spin text-indigo-650 mb-3" />
            <p className="text-sm font-semibold">Loading verification roster...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-150 text-sm">
              <thead className="bg-slate-50/60">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dept</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Contact</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Parent Contact</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reg Date</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {students.map((student) => {
                  const regDateStr = new Date(student.createdAt).toLocaleDateString();
                  
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 leading-snug">{student.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium mt-0.5">{student.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700">{student.rollNumber || "Not Provided"}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-600">{student.department || "N/A"}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700">{student.phoneNumber || "Not Provided"}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700">{student.parentPhoneNumber || "Not Provided"}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-500">{regDateStr}</span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <VerificationBadge status={student.verificationStatus} />
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg text-slate-500 hover:text-indigo-650 hover:bg-slate-100/50"
                            onClick={() => {
                              setActiveStudent(student);
                              setDrawerOpen(true);
                            }}
                          >
                            <Eye className="size-3.5 mr-1" /> View
                          </Button>

                          {student.verificationStatus !== "VERIFIED" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100/50"
                              disabled={verifyingId === student.id}
                              onClick={() => handleVerify(student.id, student.name)}
                            >
                              <UserCheck className="size-3.5 mr-1" /> Verify
                            </Button>
                          )}

                          {student.verificationStatus !== "CORRECTION_REQUESTED" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-slate-100/50"
                              onClick={() => {
                                setActiveStudent(student);
                                setCorrectionModalOpen(true);
                              }}
                            >
                              <AlertOctagon className="size-3.5 mr-1" /> Fix
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {students.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      <Users2 className="size-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold mt-4 text-slate-700">No students found</p>
                      <p className="text-xs text-slate-400 mt-1">Try relaxing filters or changing search terms.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer for Details */}
      {activeStudent && drawerOpen && (
        <StudentDetailsDrawer
          isOpen={drawerOpen}
          onOpenChange={setDrawerOpen}
          student={activeStudent}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {/* Modal for Correction Request */}
      {activeStudent && correctionModalOpen && (
        <CorrectionRequestModal
          isOpen={correctionModalOpen}
          onOpenChange={setCorrectionModalOpen}
          studentId={activeStudent.id}
          studentName={activeStudent.name}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
