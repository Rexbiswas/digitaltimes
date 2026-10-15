"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Building,
  Link2,
  Plus,
  Trash2,
  X,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  UserCheck,
  Check,
} from "lucide-react";
import {
  submitVerificationRequestApi,
  fetchVerificationStatusApi,
  fetchVerificationRequestsAdminApi,
  approveVerificationAdminApi,
  rejectVerificationAdminApi,
} from "@/services/api";
import { useToast } from "@/context/ToastContext";

export default function VerificationModal({ isOpen, onClose, onVerificationUpdated }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("status"); // "status" | "apply" | "guidelines" | "admin"
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRequests, setAdminRequests] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState({});

  // Form State
  const [category, setCategory] = useState("journalist"); // "journalist" | "editor" | "publication"
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [titleOrRole, setTitleOrRole] = useState("");
  const [workLinks, setWorkLinks] = useState([""]);
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load status and check admin role
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const checkRole = () => {
      try {
        const saved = localStorage.getItem("times_auth_user") || localStorage.getItem("times_user_session");
        if (saved) {
          const u = JSON.parse(saved);
          if (u.role === "admin" || u.role === "editor") {
            setIsAdmin(true);
          }
        }
      } catch (e) {}
    };
    checkRole();

    const loadStatus = async () => {
      setLoading(true);
      const res = await fetchVerificationStatusApi();
      if (mounted && res && res.success) {
        setStatusData(res);
        if (res.status === "unverified" && !res.request) {
          setActiveTab("apply");
        } else {
          setActiveTab("status");
        }
      }
      if (mounted) setLoading(false);
    };

    loadStatus();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Load admin requests if admin tab clicked
  const loadAdminRequests = async () => {
    setLoadingAdmin(true);
    try {
      const res = await fetchVerificationRequestsAdminApi({ status: "all", limit: 50 });
      if (res && res.success && Array.isArray(res.data)) {
        setAdminRequests(res.data);
      }
    } catch (e) {} finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin" && isAdmin) {
      loadAdminRequests();
    }
  }, [activeTab, isAdmin]);

  const handleAddWorkLink = () => {
    if (workLinks.length < 5) {
      setWorkLinks([...workLinks, ""]);
    }
  };

  const handleRemoveWorkLink = (index) => {
    setWorkLinks(workLinks.filter((_, idx) => idx !== index));
  };

  const handleWorkLinkChange = (index, value) => {
    const updated = [...workLinks];
    updated[index] = value;
    setWorkLinks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !organization.trim() || !evidence.trim()) {
      toast("Please complete all required fields.", "warning");
      return;
    }

    setSubmitting(true);
    const validLinks = workLinks.filter((l) => l.trim().length > 0);

    const payload = {
      category,
      name: name.trim(),
      organization: organization.trim(),
      titleOrRole: titleOrRole.trim(),
      workLinks: validLinks,
      evidence: evidence.trim(),
    };

    const res = await submitVerificationRequestApi(payload);
    setSubmitting(false);

    if (res && res.success) {
      toast("Application submitted to Editorial Board for review.", "success");
      setStatusData({
        status: "pending",
        category,
        request: res.data,
      });
      setActiveTab("status");
      if (typeof onVerificationUpdated === "function") {
        onVerificationUpdated();
      }
    } else {
      toast(res?.message || "Failed to submit verification application.", "error");
    }
  };

  const handleApproveAdmin = async (reqId) => {
    const res = await approveVerificationAdminApi(reqId, {
      reviewerNotes: "Approved via editorial board administration verification panel.",
    });
    if (res && res.success) {
      toast("Application approved. Verified badge issued.", "success");
      loadAdminRequests();
      if (typeof onVerificationUpdated === "function") {
        onVerificationUpdated();
      }
    } else {
      toast(res?.message || "Failed to approve request.", "error");
    }
  };

  const handleRejectAdmin = async (reqId) => {
    const reason = rejectReasonInput[reqId] || "Credentials could not be verified against official press records.";
    const res = await rejectVerificationAdminApi(reqId, {
      rejectionReason: reason,
      reviewerNotes: "Rejected during editorial administrative audit.",
    });
    if (res && res.success) {
      toast("Verification request rejected.", "success");
      loadAdminRequests();
      if (typeof onVerificationUpdated === "function") {
        onVerificationUpdated();
      }
    } else {
      toast(res?.message || "Failed to reject request.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#E8DFC8] border-2 border-[#201E19] shadow-2xl rounded-none text-[#201E19] max-h-[90vh] flex flex-col font-serif">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#201E19] px-6 py-4 bg-[#DFD6BD]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#1A365D]" />
            <div>
              <h2 className="text-xl font-bold tracking-tight uppercase">
                Editorial Press Verification
              </h2>
              <p className="text-[10px] font-mono text-[#666666] tracking-widest uppercase">
                The Digital Times Broadside Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#201E19]/10 rounded transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#201E19]" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-[#766E5F]/30 bg-[#E8DFC8] px-6 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab("status")}
            className={`py-2.5 px-4 font-bold uppercase transition-colors border-b-2 shrink-0 ${
              activeTab === "status"
                ? "border-[#201E19] text-[#201E19] bg-[#DFD6BD]/50"
                : "border-transparent text-[#666666] hover:text-[#201E19]"
            }`}
          >
            Application Status
          </button>
          <button
            onClick={() => setActiveTab("apply")}
            className={`py-2.5 px-4 font-bold uppercase transition-colors border-b-2 shrink-0 ${
              activeTab === "apply"
                ? "border-[#201E19] text-[#201E19] bg-[#DFD6BD]/50"
                : "border-transparent text-[#666666] hover:text-[#201E19]"
            }`}
          >
            Request Verification
          </button>
          <button
            onClick={() => setActiveTab("guidelines")}
            className={`py-2.5 px-4 font-bold uppercase transition-colors border-b-2 shrink-0 ${
              activeTab === "guidelines"
                ? "border-[#201E19] text-[#201E19] bg-[#DFD6BD]/50"
                : "border-transparent text-[#666666] hover:text-[#201E19]"
            }`}
          >
            Eligibility Policy
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`py-2.5 px-4 font-bold uppercase transition-colors border-b-2 shrink-0 ${
                activeTab === "admin"
                  ? "border-[#9F3028] text-[#9F3028] bg-[#9F3028]/10 font-bold"
                  : "border-transparent text-[#9F3028] hover:bg-[#9F3028]/5"
              }`}
            >
              Admin Review ({adminRequests.filter((r) => r.status === "pending").length})
            </button>
          )}
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          {/* TAB 1: STATUS */}
          {activeTab === "status" && (
            <div className="space-y-6">
              {loading ? (
                <div className="py-12 text-center font-mono text-xs text-[#666666] animate-pulse">
                  Querying broadsheet press registry...
                </div>
              ) : statusData?.status === "verified" ? (
                <div className="border border-[#2B6CB0]/40 bg-[#1A365D]/5 p-6 rounded-none text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#1A365D] text-[#E8DFC8] flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#1A365D]">
                    Official Broadsheet Verified Credentials
                  </h3>
                  <p className="text-sm text-[#39352D] max-w-md mx-auto">
                    Your profile holds verified <strong>{statusData?.category || "editorial"}</strong> standing.
                    The official blue broadsheet seal is attached to your bylines, comments, and profile.
                  </p>
                  <div className="text-xs font-mono text-[#666666] pt-2">
                    Verified on: {statusData?.verifiedAt ? new Date(statusData.verifiedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Active Record"}
                  </div>
                </div>
              ) : statusData?.status === "pending" ? (
                <div className="border border-[#D4AF37] bg-[#D4AF37]/10 p-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#D4AF37] text-[#201E19] flex items-center justify-center">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif font-bold text-2xl text-[#201E19]">
                    Review in Progress
                  </h3>
                  <p className="text-sm text-[#39352D] max-w-md mx-auto">
                    Your verification request for <strong>{statusData?.request?.category || statusData?.category}</strong> accreditation is actively being evaluated by the Editorial Board.
                  </p>
                  <div className="text-xs font-mono text-[#666666] pt-2">
                    Application submitted on {new Date(statusData?.request?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              ) : statusData?.status === "rejected" ? (
                <div className="border border-[#9F3028]/40 bg-[#9F3028]/5 p-6 space-y-4">
                  <div className="flex items-center gap-3 text-[#9F3028]">
                    <XCircle className="w-7 h-7" />
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#201E19]">
                        Application Not Approved
                      </h3>
                      <p className="text-xs font-mono text-[#9F3028] uppercase">
                        Editorial Decision
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#DFD6BD]/50 p-3 text-xs text-[#39352D] border-l-2 border-[#9F3028]">
                    <strong>Reason: </strong>
                    {statusData?.request?.rejectionReason || "Credentials could not be authenticated against public registers."}
                  </div>
                  <p className="text-xs text-[#666666]">
                    You may re-apply after ensuring your evidence meets the broadsheet eligibility standards.
                  </p>
                  <button
                    onClick={() => setActiveTab("apply")}
                    className="px-4 py-2 bg-[#201E19] text-[#E8DFC8] text-xs font-mono uppercase font-bold hover:bg-[#39352D] transition-colors cursor-pointer"
                  >
                    Submit New Application
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#DFD6BD] text-[#666666] flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#766E5F]" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#201E19]">
                    No Active Verification Application
                  </h3>
                  <p className="text-xs text-[#666666] max-w-sm mx-auto">
                    Journalists, editors, and news agencies may request verified broadsheet credentials to display an official checkmark on their bylines and profile.
                  </p>
                  <button
                    onClick={() => setActiveTab("apply")}
                    className="px-5 py-2.5 bg-[#201E19] text-[#E8DFC8] text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#39352D] transition-colors cursor-pointer"
                  >
                    Start Verification Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUEST FORM */}
          {activeTab === "apply" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] mb-1">
                  Account Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "journalist", title: "Journalist", sub: "Reporter, Correspondent, Columnist" },
                    { id: "editor", title: "Editor", sub: "Editorial Board, Desk Lead" },
                    { id: "publication", title: "Publication", sub: "Newsroom, Syndicate, Media Outlet" },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 text-left border transition-all cursor-pointer ${
                        category === cat.id
                          ? "border-[#1A365D] bg-[#1A365D]/10 font-bold"
                          : "border-[#766E5F]/30 bg-[#DFD6BD]/30 hover:border-[#201E19]"
                      }`}
                    >
                      <div className="text-xs font-serif font-bold text-[#201E19]">{cat.title}</div>
                      <div className="text-[10px] text-[#666666] leading-tight mt-0.5">{cat.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#201E19] mb-1">
                    Full Professional Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jessica Hamzelou"
                    className="w-full px-3 py-2 bg-[#DFD6BD]/50 border border-[#766E5F]/40 text-xs text-[#201E19] focus:outline-hidden focus:border-[#201E19]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#201E19] mb-1">
                    Organization / Affiliation *
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. MIT Technology Review / Independent"
                    className="w-full px-3 py-2 bg-[#DFD6BD]/50 border border-[#766E5F]/40 text-xs text-[#201E19] focus:outline-hidden focus:border-[#201E19]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#201E19] mb-1">
                  Title / Role
                </label>
                <input
                  type="text"
                  value={titleOrRole}
                  onChange={(e) => setTitleOrRole(e.target.value)}
                  placeholder="e.g. Senior Biotechnology Correspondent"
                  className="w-full px-3 py-2 bg-[#DFD6BD]/50 border border-[#766E5F]/40 text-xs text-[#201E19] focus:outline-hidden focus:border-[#201E19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#201E19] mb-1 flex items-center justify-between">
                  <span>Public Work Links (Articles, Masthead, Portfolio)</span>
                  {workLinks.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddWorkLink}
                      className="text-[10px] text-[#1A365D] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                  )}
                </label>
                <div className="space-y-2">
                  {workLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleWorkLinkChange(idx, e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-1.5 bg-[#DFD6BD]/50 border border-[#766E5F]/40 text-xs text-[#201E19] focus:outline-hidden focus:border-[#201E19]"
                      />
                      {workLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkLink(idx)}
                          className="p-1.5 text-[#888888] hover:text-[#9F3028] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-[#201E19] mb-1">
                  Supporting Credentials & Accreditation Evidence *
                </label>
                <textarea
                  rows={3}
                  required
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Provide press card number, institutional email reference, or author verification details..."
                  className="w-full px-3 py-2 bg-[#DFD6BD]/50 border border-[#766E5F]/40 text-xs text-[#201E19] focus:outline-hidden focus:border-[#201E19]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("status")}
                  className="px-4 py-2 border border-[#766E5F]/40 text-xs font-mono uppercase hover:bg-[#DFD6BD] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#201E19] text-[#E8DFC8] text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#39352D] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {submitting ? "Transmitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: GUIDELINES */}
          {activeTab === "guidelines" && (
            <div className="space-y-4 text-xs text-[#39352D] leading-relaxed">
              <div className="border-b border-[#766E5F]/20 pb-3">
                <h4 className="font-serif font-bold text-base text-[#201E19] mb-1">
                  Broadsheet Verification Standards
                </h4>
                <p className="text-[11px] text-[#666666]">
                  The Digital Times maintains strict editorial integrity. Badges are not for sale and are never automatically granted based on follower counts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#DFD6BD]/30 p-3 border border-[#766E5F]/20">
                  <h5 className="font-bold text-[#201E19] uppercase font-mono text-[11px] mb-1">
                    Journalist Eligibility
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#555555]">
                    <li>Regular bylines in reputable broadsheets or trade publications.</li>
                    <li>Demonstrable history of original reporting or commentary.</li>
                    <li>Verified institutional email or press credential.</li>
                  </ul>
                </div>

                <div className="bg-[#DFD6BD]/30 p-3 border border-[#766E5F]/20">
                  <h5 className="font-bold text-[#201E19] uppercase font-mono text-[11px] mb-1">
                    Publication Eligibility
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#555555]">
                    <li>Registered media entity with transparent editorial leadership.</li>
                    <li>Published masthead, editorial standards, and ethics policy.</li>
                    <li>Official domain and syndication authorizations.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-[#1A365D]/5 border-l-2 border-[#1A365D] text-[11px]">
                <strong>Privacy Policy:</strong> Submitted credentials and reviewer notes remain private and are only accessible by authorized editors. Identity documents are never exposed through public APIs.
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN REVIEW (FOR EDITORS/ADMINS) */}
          {activeTab === "admin" && isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#766E5F]/20 pb-2">
                <h4 className="font-serif font-bold text-base text-[#201E19]">
                  Editorial Board Application Registry
                </h4>
                <button
                  type="button"
                  onClick={loadAdminRequests}
                  className="text-xs font-mono text-[#9F3028] hover:underline"
                >
                  Refresh
                </button>
              </div>

              {loadingAdmin ? (
                <div className="py-8 text-center font-mono text-xs text-[#666666]">
                  Loading editorial requests...
                </div>
              ) : adminRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#666666] font-mono">
                  No verification applications found.
                </div>
              ) : (
                <div className="space-y-3">
                  {adminRequests.map((item) => (
                    <div
                      key={item._id}
                      className="bg-[#DFD6BD]/40 border border-[#766E5F]/30 p-4 rounded-none space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-serif text-sm text-[#201E19]">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-[#1A365D] text-[#E8DFC8] px-1.5 py-0.2 rounded uppercase">
                              {item.category}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                                item.status === "verified"
                                  ? "bg-emerald-600 text-white"
                                  : item.status === "rejected"
                                  ? "bg-[#9F3028] text-white"
                                  : "bg-[#D4AF37] text-[#201E19]"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#555555]">
                            {item.organization} • {item.titleOrRole || "Correspondent"} ({item.email})
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-[#777777]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-[#E8DFC8] p-2 border border-[#766E5F]/20 text-[11px] text-[#333333]">
                        <strong>Evidence:</strong> {item.evidence}
                      </div>

                      {Array.isArray(item.workLinks) && item.workLinks.length > 0 && (
                        <div className="text-[10px] font-mono text-[#1A365D] space-x-2">
                          <span>Links:</span>
                          {item.workLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-[#201E19]"
                            >
                              Work #{idx + 1}
                            </a>
                          ))}
                        </div>
                      )}

                      {item.status === "pending" && (
                        <div className="pt-2 border-t border-[#766E5F]/15 flex flex-col sm:flex-row items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Rejection reason if declining..."
                            value={rejectReasonInput[item._id] || ""}
                            onChange={(e) =>
                              setRejectReasonInput({
                                ...rejectReasonInput,
                                [item._id]: e.target.value,
                              })
                            }
                            className="w-full sm:w-64 px-2 py-1 text-[10px] bg-[#E8DFC8] border border-[#766E5F]/40"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRejectAdmin(item._id)}
                              className="px-3 py-1 bg-[#9F3028] text-white text-[10px] font-mono uppercase font-bold hover:bg-[#80251F] cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveAdmin(item._id)}
                              className="px-3 py-1 bg-[#1A365D] text-white text-[10px] font-mono uppercase font-bold hover:bg-[#142642] cursor-pointer"
                            >
                              Approve & Verify
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
