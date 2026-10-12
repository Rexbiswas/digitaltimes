"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  KeyRound,
  ShieldAlert
} from "lucide-react";
import { marketTickers, dashboardRecommendedStories, leadStory as fallbackLeadStory } from "@/data/newspaperData";

// RFC 5322 Standard Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const NAME_REGEX = /^[a-zA-Z\s'.-]{2,50}$/;
// Passcode regex requiring minimum 8 characters with at least one uppercase, one lowercase, and one digit
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^~_.\-+=[\]{}()]{8,}$/;

export default function EditorialAuthScreen({
  onLogin,
  onBrowseGuest,
  leadStory,
  articles
}) {
  const [authMode, setAuthMode] = useState("signin"); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isAuthPending, setIsAuthPending] = useState(false);

  // Top banner alert
  const [authBanner, setAuthBanner] = useState(null); // { type: "error" | "success", message: string }

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Request Code | 2: Reset Passcode | 3: Done
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotResetCode, setForgotResetCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotTouched, setForgotTouched] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotErrorMsg, setForgotErrorMsg] = useState("");
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");
  const [isForgotPending, setIsForgotPending] = useState(false);

  // Dynamic live stories pool
  const [liveStories, setLiveStories] = useState(() => {
    if (Array.isArray(articles) && articles.length > 0) return articles;
    return dashboardRecommendedStories;
  });

  // Fetch updated news wire if articles not passed
  useEffect(() => {
    let isMounted = true;
    const fetchFresh = async () => {
      try {
        const res = await fetch("/api/articles?limit=10", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.articles && json.articles.length > 0 && isMounted) {
            setLiveStories(json.articles);
          }
        }
      } catch (err) {}
    };

    if (!articles || articles.length === 0) {
      fetchFresh();
    }
    return () => {
      isMounted = false;
    };
  }, [articles]);

  useEffect(() => {
    if (Array.isArray(articles) && articles.length > 0) {
      setLiveStories(articles);
    }
  }, [articles]);

  // Combined pool of available updated stories
  const storiesPool = useMemo(() => {
    const list = [];
    if (leadStory) list.push(leadStory);
    if (Array.isArray(liveStories)) {
      liveStories.forEach((s) => {
        if (!list.some((existing) => existing.id === s.id || existing.headline === s.headline)) {
          list.push(s);
        }
      });
    }
    if (list.length === 0) {
      list.push(fallbackLeadStory);
    }
    return list;
  }, [leadStory, liveStories]);

  // Auto-cycle updated news visual showcase every 6 seconds
  useEffect(() => {
    if (storiesPool.length <= 1) return;
    const interval = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % storiesPool.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [storiesPool.length]);

  const currentShowcase = useMemo(() => {
    return storiesPool[activeStoryIndex % storiesPool.length] || storiesPool[0] || fallbackLeadStory;
  }, [storiesPool, activeStoryIndex]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SIGN IN STATE & VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [signInTouched, setSignInTouched] = useState({ email: false, password: false });
  const [signInSubmitted, setSignInSubmitted] = useState(false);

  const signInErrors = useMemo(() => {
    const errors = {};
    const emailTrimmed = signInEmail.trim();

    if (!emailTrimmed) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(emailTrimmed)) {
      errors.email = "Please enter a valid email address (e.g. reader@times.com).";
    }

    if (!signInPassword) {
      errors.password = "Cipher passcode is required.";
    } else if (signInPassword.length < 8) {
      errors.password = "Passcode must contain at least 8 characters.";
    } else if (!PASSWORD_REGEX.test(signInPassword)) {
      errors.password = "Passcode must have at least 8 characters with uppercase, lowercase, and a number.";
    }

    return errors;
  }, [signInEmail, signInPassword]);

  const isSignInValid = Object.keys(signInErrors).length === 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // SIGN UP STATE & VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState([
    "Artificial Intelligence",
    "Startups",
    "Cybersecurity"
  ]);

  const [signUpTouched, setSignUpTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    topics: false,
    agreeTerms: false
  });
  const [signUpSubmitted, setSignUpSubmitted] = useState(false);

  const availableTopics = [
    "Artificial Intelligence",
    "Startups",
    "Cybersecurity",
    "Web Development",
    "Technology",
    "Editorial Design",
    "Deep Tech",
    "Markets"
  ];

  const toggleTopic = (topic) => {
    setSignUpTouched((prev) => ({ ...prev, topics: true }));
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Detailed Password Criteria & Strength Evaluation
  const passwordCriteria = useMemo(() => {
    const pwd = signUpPassword;
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd)
    };
  }, [signUpPassword]);

  const passwordStrength = useMemo(() => {
    const pwd = signUpPassword;
    if (!pwd) {
      return { score: 0, label: "NONE", color: "bg-stone-300", textColor: "text-stone-500", percent: 0 };
    }
    const score = Object.values(passwordCriteria).filter(Boolean).length;
    if (score <= 2 || pwd.length < 8) {
      return { score: 1, label: "WEAK", color: "bg-[#9F3028]", textColor: "text-[#9F3028]", percent: 25 };
    }
    if (score === 3) {
      return { score: 2, label: "MODERATE", color: "bg-[#B8860B]", textColor: "text-[#B8860B]", percent: 50 };
    }
    if (score === 4) {
      return { score: 3, label: "SECURE", color: "bg-[#1E5F74]", textColor: "text-[#1E5F74]", percent: 75 };
    }
    return { score: 4, label: "VERY STRONG", color: "bg-[#2D6A4F]", textColor: "text-[#2D6A4F]", percent: 100 };
  }, [signUpPassword, passwordCriteria]);

  const signUpErrors = useMemo(() => {
    const errors = {};
    const nameTrimmed = signUpName.trim();
    const emailTrimmed = signUpEmail.trim();

    // Name
    if (!nameTrimmed) {
      errors.name = "Correspondent full name is required.";
    } else if (nameTrimmed.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (!NAME_REGEX.test(nameTrimmed)) {
      errors.name = "Name should contain letters, spaces, and hyphens only.";
    }

    // Email
    if (!emailTrimmed) {
      errors.email = "Telegraph email address is required.";
    } else if (!EMAIL_REGEX.test(emailTrimmed)) {
      errors.email = "Please enter a valid email address (e.g. reader@times.com).";
    }

    // Password
    if (!signUpPassword) {
      errors.password = "A cipher passcode is required.";
    } else if (signUpPassword.length < 8) {
      errors.password = "Passcode must contain at least 8 characters.";
    } else if (!PASSWORD_REGEX.test(signUpPassword)) {
      errors.password = "Passcode must have at least 8 characters with uppercase, lowercase, and a number.";
    }

    // Confirm Password
    if (!signUpConfirmPassword) {
      errors.confirmPassword = "Confirm your cipher passcode.";
    } else if (signUpConfirmPassword !== signUpPassword) {
      errors.confirmPassword = "Passcodes do not match.";
    }

    // Topics
    if (selectedTopics.length === 0) {
      errors.topics = "Select at least 1 editorial beat.";
    }

    // Terms
    if (!agreeTerms) {
      errors.agreeTerms = "You must agree to the subscriber codex.";
    }

    return errors;
  }, [signUpName, signUpEmail, signUpPassword, signUpConfirmPassword, passwordStrength, selectedTopics, agreeTerms]);

  const isSignUpValid = Object.keys(signUpErrors).length === 0;

  // Forgot Password Validation
  const forgotError = useMemo(() => {
    const trimmed = forgotEmail.trim();
    if (!trimmed) return "Email address is required.";
    if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address.";
    return null;
  }, [forgotEmail]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBMISSION HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setSignInSubmitted(true);
    setSignInTouched({ email: true, password: true });

    if (!isSignInValid) {
      setAuthBanner({
        type: "error",
        message: "Submission halted: Please enter a valid email and 8+ character passcode."
      });
      return;
    }

    setAuthBanner(null);
    setIsAuthPending(true);
    let token = null;

    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: signInEmail.trim().toLowerCase(),
          password: signInPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          token = data.token;
          try {
            localStorage.setItem("times_auth_token", token);
          } catch (err) {}
        }

        const user = {
          name: data.user?.name || signInEmail.split("@")[0] || "Reader",
          email: signInEmail.trim().toLowerCase(),
          token: token,
          avatar: null,
          topics: data.user?.preferences?.topics || [
            "Artificial Intelligence",
            "Startups",
            "Cybersecurity",
            "Web Development",
            "Technology"
          ],
          role: data.user?.role || "Pro Reader",
          edition: "Edition № 001"
        };
        onLogin(user);
      } else {
        if (res.status === 404 || data.code === "USER_NOT_FOUND") {
          setSignUpEmail(signInEmail.trim().toLowerCase());
          setAuthBanner({
            type: "error",
            message: data.message || "No subscriber account found for this email. New users must sign up first."
          });
        } else {
          setAuthBanner({
            type: "error",
            message: data.message || "Authentication rejected: Invalid email or passcode."
          });
        }
      }
    } catch (err) {
      console.warn("Auth request error:", err);
      setAuthBanner({
        type: "error",
        message: "Dispatch connection error: Unable to contact registry. Please verify the server is running."
      });
    } finally {
      setIsAuthPending(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSignUpSubmitted(true);
    setSignUpTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      topics: true,
      agreeTerms: true
    });

    if (!isSignUpValid) {
      setAuthBanner({
        type: "error",
        message: "Registration halted: Please resolve the highlighted fields and meet passcode rules."
      });
      return;
    }

    setAuthBanner(null);
    setIsAuthPending(true);

    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          email: signUpEmail.trim().toLowerCase(),
          name: signUpName.trim(),
          password: signUpPassword,
          topics: selectedTopics,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Enforce signup first, then user logs in
        const registeredEmail = signUpEmail.trim().toLowerCase();
        setSignInEmail(registeredEmail);
        setSignInPassword("");
        setSignUpPassword("");
        setSignUpConfirmPassword("");
        setAuthMode("signin");
        setAuthBanner({
          type: "success",
          message: data.message || "Account created successfully! Please sign in with your email and passcode to proceed."
        });
      } else {
        if (res.status === 409 || data.code === "USER_EXISTS") {
          setSignInEmail(signUpEmail.trim().toLowerCase());
          setAuthBanner({
            type: "error",
            message: data.message || "An account with this email already exists. Please sign in directly."
          });
        } else {
          setAuthBanner({
            type: "error",
            message: data.message || "Registration failed. Please review your details."
          });
        }
      }
    } catch (err) {
      console.warn("Sign up request error:", err);
      setAuthBanner({
        type: "error",
        message: "Dispatch connection error: Unable to register user. Please try again."
      });
    } finally {
      setIsAuthPending(false);
    }
  };

  const handleForgotRequestCode = async (e) => {
    e.preventDefault();
    setForgotTouched(true);
    setForgotSubmitted(true);
    setForgotErrorMsg("");

    const emailTrimmed = forgotEmail.trim().toLowerCase();
    if (!emailTrimmed) {
      setForgotErrorMsg("Telegraph email address is required.");
      return;
    }
    if (!EMAIL_REGEX.test(emailTrimmed)) {
      setForgotErrorMsg("Please enter a valid email address format.");
      return;
    }

    setIsForgotPending(true);
    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "forgot-password",
          email: emailTrimmed,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotResetCode("");
        setForgotSuccessMsg(
          data.message ||
            `A 6-digit recovery code has been dispatched to ${emailTrimmed}. Please check your email inbox and enter the code below.`
        );
        setForgotStep(2);
      } else {
        setForgotErrorMsg(data.message || "No subscriber profile found with this telegraph email.");
      }
    } catch (err) {
      console.warn("Forgot password request error:", err);
      setForgotErrorMsg("Dispatch connection error: Unable to contact registry.");
    } finally {
      setIsForgotPending(false);
    }
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setForgotErrorMsg("");

    const codeTrimmed = forgotResetCode.trim();
    if (!codeTrimmed) {
      setForgotErrorMsg("6-digit recovery cipher code is required.");
      return;
    }
    if (!forgotNewPassword) {
      setForgotErrorMsg("New cipher passcode is required.");
      return;
    }
    if (forgotNewPassword.length < 8) {
      setForgotErrorMsg("Passcode must contain at least 8 characters.");
      return;
    }
    if (!PASSWORD_REGEX.test(forgotNewPassword)) {
      setForgotErrorMsg("Passcode must meet the security pattern: 8+ characters, uppercase, lowercase, and a number.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotErrorMsg("Passcodes do not match. Please verify confirmation.");
      return;
    }

    setIsForgotPending(true);
    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          email: forgotEmail.trim().toLowerCase(),
          resetCode: codeTrimmed,
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotStep(3);
        setSignInEmail(forgotEmail.trim().toLowerCase());
        setSignInPassword("");
      } else {
        setForgotErrorMsg(data.message || "Failed to reset passcode. Please check your verification code.");
      }
    } catch (err) {
      console.warn("Reset password error:", err);
      setForgotErrorMsg("Dispatch connection error: Unable to update cipher passcode.");
    } finally {
      setIsForgotPending(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#E8DFC8] text-[#201E19] font-sans flex flex-col lg:flex-row select-none overflow-y-auto lg:overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: GRAND EDITORIAL BROADSHEET SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 2xl:w-7/12 h-full overflow-hidden flex-col justify-between p-3 lg:p-3.5 xl:p-4 2xl:p-6 border-r-2 border-[#766E5F] relative bg-[#DFD5BC]/50">
        {/* Top Broadsheet Ear Bar */}
        <div className="shrink-0">
          <div className="flex items-center justify-between text-[10px] xl:text-[11px] font-mono tracking-wider text-[#39352D] pb-1 border-b border-[#766E5F]/30">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#201E19]">{currentShowcase.editionBadge || "EDITION Nº 001"}</span>
              <span>•</span>
              <span className="truncate">{currentShowcase.location || "GLOBAL PRINT WIRE"} • {currentShowcase.date || "TODAY"}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-[#201E19] text-[9.5px]">LIVE WIRE ACTIVE</span>
            </div>
          </div>

          {/* Oxford Header Frame */}
          <div className="rule-oxford my-1" />

          {/* Grand Masthead */}
          <div className="py-0.5 xl:py-1 text-center group cursor-default">
            <div className="flex items-center justify-center gap-2.5 mb-0.5 opacity-85">
              <span className="h-[1px] w-6 xl:w-8 bg-[#766E5F]" />
              <span className="text-[8px] xl:text-[9px] tracking-[0.2em] font-mono uppercase text-[#39352D]">
                ESTABLISHED IN THE DAWN OF THE GLOBAL NETWORK
              </span>
              <span className="h-[1px] w-6 xl:w-8 bg-[#766E5F]" />
            </div>

            <h1 className="font-masthead text-3xl lg:text-4xl xl:text-5xl font-normal text-[#201E19] transition-transform duration-500 group-hover:scale-[1.01] leading-none">
              The Digital Times
            </h1>

            <p className="mt-0.5 text-[9px] xl:text-[10px] tracking-[0.25em] uppercase font-serif text-[#39352D] font-semibold">
              THE STORIES SHAPING THE DIGITAL WORLD
            </p>
          </div>

          <div className="rule-oxford my-1" />
        </div>

        {/* Center Feature Broadsheet Article Showcase */}
        <div className="py-1 xl:py-2 flex flex-col gap-1.5 xl:gap-2 max-w-xl mx-auto w-full my-auto">
          {/* Hero Article Photo with Hover Parallax Zoom */}
          <div className="relative aspect-[16/9] max-h-[135px] sm:max-h-[150px] lg:max-h-[155px] xl:max-h-[175px] 2xl:max-h-[210px] w-full rounded-xl overflow-hidden border-2 border-[#766E5F] shadow-md bg-[#EFE8D5] group shrink-0">
            <Image
              src={currentShowcase.urlToImage || currentShowcase.image || "/window.svg"}
              alt={currentShowcase.headline || "The Digital Times Broadsheet Editorial"}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
              onError={(e) => {
                e.currentTarget.srcset = "";
                e.currentTarget.src = "/window.svg";
              }}
            />
            <div className="absolute top-2 left-2 bg-[#9F3028] text-[#E8DFC8] text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs flex items-center gap-1 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{currentShowcase.kicker || "UPDATED DISPATCH"}</span>
            </div>

            {/* Stories Rotation Pills Overlay */}
            {storiesPool.length > 1 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#201E19]/85 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 z-10">
                {storiesPool.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStoryIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeStoryIndex === idx ? "w-3.5 bg-[#9F3028]" : "w-1.5 bg-white/40 hover:bg-white/80"
                    }`}
                    title={`View story ${idx + 1}`}
                    aria-label={`View story ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Article Editorial Commentary */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#9F3028] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#9F3028]" />
                <span>THE {(currentShowcase.desk || "TECHNOLOGY").toUpperCase()} DESK</span>
              </span>
              <span className="text-[9px] font-mono text-[#666666]">
                {currentShowcase.date || "TODAY"}
              </span>
            </div>

            <h2 className="font-serif font-bold text-base lg:text-lg xl:text-xl text-[#201E19] leading-tight mb-1 line-clamp-2">
              {currentShowcase.headline}
            </h2>
            <p className="font-serif text-[10.5px] xl:text-[11.5px] text-[#39352D] leading-relaxed mb-1 line-clamp-2">
              {currentShowcase.deck || currentShowcase.leadParagraph}
            </p>

            {/* Reader Quote / Metadata Block */}
            <div className="border-l-2 border-[#766E5F] pl-2 py-0.5 bg-[#EFE8D5]/70 text-[10px] xl:text-[11px] italic font-serif text-[#39352D] shadow-xs flex items-center justify-between">
              <span>{currentShowcase.readTime || "4 MIN READ"} • {currentShowcase.author || "By THE DIGITAL TIMES WIRE"}</span>
              {currentShowcase.topic && (
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#9F3028] not-italic font-bold">
                  {currentShowcase.topic}
                </span>
              )}
            </div>

            {/* Interactive Story Rotation Controls */}
            {storiesPool.length > 1 && (
              <div className="flex items-center justify-between pt-1.5 text-[9px] font-mono text-[#666666]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#201E19]">DISPATCH {activeStoryIndex + 1} OF {storiesPool.length}</span>
                  <span className="text-[8.5px] text-[#9F3028] font-bold">• UPDATED NEWS</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveStoryIndex((prev) => (prev > 0 ? prev - 1 : storiesPool.length - 1))}
                    className="px-1.5 py-0.5 rounded border border-[#766E5F]/20 hover:bg-[#EAE4D6] transition-colors cursor-pointer"
                    title="Previous story"
                    aria-label="Previous story"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStoryIndex((prev) => (prev + 1) % storiesPool.length)}
                    className="px-1.5 py-0.5 rounded border border-[#766E5F]/20 hover:bg-[#EAE4D6] transition-colors cursor-pointer"
                    title="Next story"
                    aria-label="Next story"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Market Wire Telemetry */}
        <div className="mt-auto shrink-0 border-t border-[#766E5F]/30 pt-1.5 pb-1 bg-[#DFD5BC]/60 px-2 rounded-lg flex items-center justify-between text-[9px] xl:text-[10px] font-mono text-[#39352D] overflow-hidden gap-3">
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <span className="bg-[#201E19] text-[#E8DFC8] px-1.5 py-0.5 font-bold uppercase text-[8.5px] tracking-wider">
              COMPUTE TICKER
            </span>
            <span className="font-bold text-[#201E19]">NASDAQ-TECH 19,842.10</span>
            <span className="text-emerald-700 font-bold bg-emerald-600/10 px-1 py-0.2 rounded text-[8.5px]">
              +1.38%
            </span>
          </div>

          <div className="overflow-hidden flex-1 hidden md:block">
            <div className="animate-ticker flex items-center gap-6 whitespace-nowrap">
              {marketTickers.map((t, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <span className="font-bold text-[#201E19]">{t.symbol}</span>
                  <span className="text-[#39352D]">{t.value}</span>
                  <span className={`text-[8.5px] font-bold ${t.up ? "text-emerald-700" : "text-[#9F3028]"}`}>
                    {t.change}
                  </span>
                  <span className="text-[#888888]">•</span>
                </span>
              ))}
            </div>
          </div>

          <span className="text-[8.5px] font-mono text-[#777777] shrink-0 hidden xl:inline">
            1,840,290 BROADSHEETS CIRCULATED
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: FULL-HEIGHT AUTHENTICATION CONSOLE (Responsive)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-1/2 2xl:w-5/12 min-h-screen lg:min-h-0 lg:h-full overflow-y-auto no-scrollbar flex flex-col justify-between p-3.5 sm:p-5 lg:py-2.5 lg:px-4 xl:py-3 xl:px-6 2xl:px-8 bg-[#EFE8D5]">
        {/* Mobile & Tablet Portrait Masthead (Visible only on < lg) */}
        <div className="lg:hidden w-full max-w-sm sm:max-w-md mx-auto text-center pt-1 pb-1.5 shrink-0">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#39352D] pb-0.5 border-b border-[#766E5F]/20">
            <span className="font-bold text-[#201E19]">EDITION Nº 001</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-[#201E19] text-[9px]">LIVE WIRE</span>
            </div>
          </div>
          <div className="rule-oxford my-0.5" />
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#201E19]">
            THE DIGITAL TIMES
          </h1>
          <p className="text-[8.5px] sm:text-[9.5px] tracking-[0.2em] uppercase font-serif text-[#39352D] font-semibold mt-0.5">
            THE STORIES SHAPING THE DIGITAL WORLD
          </p>
          <div className="rule-oxford my-0.5" />
        </div>

        {/* Central Auth Docket */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-1 sm:py-2 flex flex-col justify-center">
          <div className="border-2 border-[#766E5F] bg-[#EFE8D5] p-3 sm:p-4 shadow-[4px_4px_0px_#766E5F] relative">
            {/* Broadsheet Docket Folio Header */}
            <div className="flex items-center justify-between pb-1 sm:pb-1.5 mb-2 sm:mb-2.5 border-b-2 border-[#766E5F] text-[8.5px] sm:text-[9px] font-mono tracking-widest uppercase">
              <div className="flex items-center gap-1.5 font-bold text-[#201E19]">
                <span className="w-1.5 h-1.5 bg-[#9F3028] inline-block"></span>
                <span>{authMode === "signin" ? "DISPATCH REGISTRY • SUBSCRIBER ACCESS" : "DISPATCH REGISTRY • NEW READER PROFILE"}</span>
              </div>
              <span className="stamp-classified text-[8.5px] py-0 px-1.5">
                {authMode === "signin" ? "PRESS PASS" : "ENROLLMENT"}
              </span>
            </div>

            {/* Top Server or Validation Banner */}
            {authBanner && (
              <div
                role="alert"
                className={`mb-2.5 p-2 text-[10px] sm:text-[10.5px] font-mono flex items-start justify-between gap-2 border-2 ${
                  authBanner.type === "error"
                    ? "bg-[#FAF2F2] border-[#9F3028] text-[#9F3028]"
                    : "bg-emerald-50 border-emerald-700 text-emerald-800"
                } shadow-[2px_2px_0px_currentColor]`}
              >
                <div className="flex items-start gap-1.5">
                  {authBanner.type === "error" ? (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  )}
                  <span className="font-semibold leading-snug">{authBanner.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthBanner(null)}
                  className="text-stone-500 hover:text-[#201E19] cursor-pointer"
                  aria-label="Dismiss message"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* ── 1. SIGN IN VIEW ────────────────────────────────────────── */}
            {authMode === "signin" && (
              <form
                onSubmit={handleSignInSubmit}
                noValidate
                className="space-y-2 sm:space-y-2.5 animate-in fade-in duration-300"
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-serif font-black text-lg sm:text-xl xl:text-2xl text-[#201E19] tracking-tight">
                      Welcome Back, Reader
                    </h2>
                    <span className="text-[8.5px] sm:text-[9px] font-mono font-bold text-[#9F3028] uppercase tracking-wider">
                      EDITION VOL. XXVI
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#39352D] font-serif italic mt-0.5">
                    Sign in to access your customized &ldquo;Your Times&rdquo; dispatch.
                  </p>
                  <div className="rule-oxford my-1.5" />
                </div>

                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      htmlFor="signin-email"
                      className="block text-[9.5px] sm:text-[10px] font-mono font-bold text-[#201E19] uppercase tracking-wider"
                    >
                      § CORRESPONDENT EMAIL ADDRESS
                    </label>
                    {signInTouched.email && !signInErrors.email && signInEmail.trim() && (
                      <span className="text-emerald-700 font-mono text-[9px] font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> VALID
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signin-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="alex@email.com"
                      value={signInEmail}
                      aria-invalid={signInTouched.email && !!signInErrors.email}
                      aria-describedby={signInTouched.email && signInErrors.email ? "signin-email-error" : undefined}
                      onBlur={() => setSignInTouched((p) => ({ ...p, email: true }))}
                      onChange={(e) => {
                        setSignInEmail(e.target.value);
                        if (authBanner) setAuthBanner(null);
                      }}
                      className={`w-full border-2 pl-8 pr-2.5 py-1.5 sm:py-2 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none transition-all shadow-[2px_2px_0px_#766E5F] ${
                        signInTouched.email && signInErrors.email
                          ? "bg-[#FAF2F2] border-[#9F3028] ring-1 ring-[#9F3028]/40 focus:border-[#9F3028]"
                          : signInTouched.email && !signInErrors.email && signInEmail.trim()
                          ? "bg-[#F4F9F5] border-[#2D6A4F] focus:border-[#2D6A4F]"
                          : "bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] focus:ring-1 focus:ring-[#201E19]"
                      }`}
                    />
                  </div>
                  {signInTouched.email && signInErrors.email && (
                    <p
                      id="signin-email-error"
                      role="alert"
                      className="text-[9.5px] font-mono font-semibold text-[#9F3028] flex items-center gap-1 mt-1 animate-in fade-in"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{signInErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      htmlFor="signin-password"
                      className="block text-[9.5px] sm:text-[10px] font-mono font-bold text-[#201E19] uppercase tracking-wider"
                    >
                      § CIPHER PASSCODE
                    </label>
                    {signInTouched.password && !signInErrors.password && signInPassword && (
                      <span className="text-emerald-700 font-mono text-[9px] font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> ENTERED
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••••••"
                      value={signInPassword}
                      aria-invalid={signInTouched.password && !!signInErrors.password}
                      aria-describedby={signInTouched.password && signInErrors.password ? "signin-password-error" : undefined}
                      onBlur={() => setSignInTouched((p) => ({ ...p, password: true }))}
                      onChange={(e) => {
                        setSignInPassword(e.target.value);
                        if (authBanner) setAuthBanner(null);
                      }}
                      className={`w-full border-2 pl-8 pr-8 py-1.5 sm:py-2 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none transition-all shadow-[2px_2px_0px_#766E5F] ${
                        signInTouched.password && signInErrors.password
                          ? "bg-[#FAF2F2] border-[#9F3028] ring-1 ring-[#9F3028]/40 focus:border-[#9F3028]"
                          : signInTouched.password && !signInErrors.password && signInPassword
                          ? "bg-[#F4F9F5] border-[#2D6A4F] focus:border-[#2D6A4F]"
                          : "bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] focus:ring-1 focus:ring-[#201E19]"
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide passcode" : "Show passcode"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#201E19] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {signInTouched.password && signInErrors.password && (
                    <p
                      id="signin-password-error"
                      role="alert"
                      className="text-[9.5px] font-mono font-semibold text-[#9F3028] flex items-center gap-1 mt-1 animate-in fade-in"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{signInErrors.password}</span>
                    </p>
                  )}
                </div>

                {/* Remember Me & Forget Password */}
                <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] font-mono text-[#39352D] pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-none border-2 border-[#766E5F] text-[#201E19] accent-[#201E19] cursor-pointer"
                    />
                    <span className="font-semibold uppercase tracking-wider text-[9.5px] sm:text-[10px]">Remember this station</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotStep(1);
                      setForgotEmail(signInEmail || "");
                      setForgotResetCode("");
                      setForgotNewPassword("");
                      setForgotConfirmPassword("");
                      setForgotTouched(false);
                      setForgotSubmitted(false);
                      setForgotErrorMsg("");
                      setForgotSuccessMsg("");
                    }}
                    className="text-[9.5px] sm:text-[10px] text-[#9F3028] hover:text-[#201E19] font-mono font-bold uppercase tracking-wider underline underline-offset-2 cursor-pointer"
                  >
                    Forget Password?
                  </button>
                </div>

                {/* Submit Sign In Button */}
                <div className="pt-0.5 sm:pt-1">
                  <button
                    type="submit"
                    disabled={isAuthPending}
                    className="w-full bg-[#201E19] hover:bg-[#9F3028] disabled:bg-[#333333] disabled:cursor-not-allowed text-[#EFE8D5] text-xs font-bold py-2 sm:py-2.5 px-3 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 border-2 border-[#766E5F] shadow-[3px_3px_0px_#766E5F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#766E5F] font-mono tracking-[0.14em] uppercase"
                  >
                    {isAuthPending ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>AUTHENTICATING CIPHER...</span>
                      </span>
                    ) : (
                      <>
                        <span>SIGN IN &amp; OPEN YOUR TIMES</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Link to Create Account Form */}
                <div className="pt-2 text-center border-t border-[#766E5F]/15 mt-2">
                  <p className="text-[10px] sm:text-[10.5px] font-mono text-[#39352D]">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setAuthBanner(null);
                      }}
                      className="text-[#201E19] hover:text-[#9F3028] font-bold underline underline-offset-2 cursor-pointer uppercase tracking-wider transition-colors ml-1 inline-flex items-center gap-1"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ── 2. SIGN UP VIEW ────────────────────────────────────────── */}
            {authMode === "signup" && (
              <form
                onSubmit={handleSignUpSubmit}
                noValidate
                className="space-y-1.5 sm:space-y-2 animate-in fade-in duration-300"
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-serif font-black text-lg sm:text-xl xl:text-2xl text-[#201E19] tracking-tight">
                      Create Reader Profile
                    </h2>
                    <span className="text-[8.5px] sm:text-[9px] font-mono font-bold text-[#9F3028] uppercase tracking-wider">
                      NEW DISPATCH
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#39352D] font-serif italic mt-0.5">
                    Subscribe to receive tailored real-time algorithmic editions.
                  </p>
                  <div className="rule-oxford my-1 sm:my-1.5" />
                </div>

                {/* Full Name Field */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      htmlFor="signup-name"
                      className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider"
                    >
                      § CORRESPONDENT FULL NAME
                    </label>
                    {signUpTouched.name && !signUpErrors.name && signUpName.trim() && (
                      <span className="text-emerald-700 font-mono text-[8.5px] font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={signUpName}
                      aria-invalid={signUpTouched.name && !!signUpErrors.name}
                      aria-describedby={signUpTouched.name && signUpErrors.name ? "signup-name-error" : undefined}
                      onBlur={() => setSignUpTouched((p) => ({ ...p, name: true }))}
                      onChange={(e) => {
                        setSignUpName(e.target.value);
                        if (authBanner) setAuthBanner(null);
                      }}
                      className={`w-full border-2 pl-8 pr-2.5 py-1 sm:py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none transition-all shadow-[2px_2px_0px_#766E5F] ${
                        signUpTouched.name && signUpErrors.name
                          ? "bg-[#FAF2F2] border-[#9F3028] ring-1 ring-[#9F3028]/40 focus:border-[#9F3028]"
                          : signUpTouched.name && !signUpErrors.name && signUpName.trim()
                          ? "bg-[#F4F9F5] border-[#2D6A4F] focus:border-[#2D6A4F]"
                          : "bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] focus:ring-1 focus:ring-[#201E19]"
                      }`}
                    />
                  </div>
                  {signUpTouched.name && signUpErrors.name && (
                    <p
                      id="signup-name-error"
                      role="alert"
                      className="text-[9px] font-mono font-semibold text-[#9F3028] flex items-center gap-1 mt-0.5"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{signUpErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email Address Field */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      htmlFor="signup-email"
                      className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider"
                    >
                      § TELEGRAPH EMAIL ADDRESS
                    </label>
                    {signUpTouched.email && !signUpErrors.email && signUpEmail.trim() && (
                      <span className="text-emerald-700 font-mono text-[8.5px] font-bold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="alex@email.com"
                      value={signUpEmail}
                      aria-invalid={signUpTouched.email && !!signUpErrors.email}
                      aria-describedby={signUpTouched.email && signUpErrors.email ? "signup-email-error" : undefined}
                      onBlur={() => setSignUpTouched((p) => ({ ...p, email: true }))}
                      onChange={(e) => {
                        setSignUpEmail(e.target.value);
                        if (authBanner) setAuthBanner(null);
                      }}
                      className={`w-full border-2 pl-8 pr-2.5 py-1 sm:py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none transition-all shadow-[2px_2px_0px_#766E5F] ${
                        signUpTouched.email && signUpErrors.email
                          ? "bg-[#FAF2F2] border-[#9F3028] ring-1 ring-[#9F3028]/40 focus:border-[#9F3028]"
                          : signUpTouched.email && !signUpErrors.email && signUpEmail.trim()
                          ? "bg-[#F4F9F5] border-[#2D6A4F] focus:border-[#2D6A4F]"
                          : "bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] focus:ring-1 focus:ring-[#201E19]"
                      }`}
                    />
                  </div>
                  {signUpTouched.email && signUpErrors.email && (
                    <p
                      id="signup-email-error"
                      role="alert"
                      className="text-[9px] font-mono font-semibold text-[#9F3028] flex items-center gap-1 mt-0.5"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{signUpErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Field with Real-Time Strength Meter */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      htmlFor="signup-password"
                      className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider"
                    >
                      § ASSIGN CIPHER PASSCODE
                    </label>
                    {signUpPassword && (
                      <span className={`text-[8.5px] font-mono font-bold tracking-wider ${passwordStrength.textColor}`}>
                        {passwordStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-password"
                      name="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Min. 8 characters"
                      value={signUpPassword}
                      aria-invalid={signUpTouched.password && !!signUpErrors.password}
                      aria-describedby={signUpTouched.password && signUpErrors.password ? "signup-password-error" : undefined}
                      onBlur={() => setSignUpTouched((p) => ({ ...p, password: true }))}
                      onChange={(e) => {
                        setSignUpPassword(e.target.value);
                        if (authBanner) setAuthBanner(null);
                      }}
                      className={`w-full border-2 pl-8 pr-8 py-1 sm:py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none transition-all shadow-[2px_2px_0px_#766E5F] ${
                        signUpTouched.password && signUpErrors.password
                          ? "bg-[#FAF2F2] border-[#9F3028] ring-1 ring-[#9F3028]/40 focus:border-[#9F3028]"
                          : signUpTouched.password && !signUpErrors.password && signUpPassword
                          ? "bg-[#F4F9F5] border-[#2D6A4F] focus:border-[#2D6A4F]"
                          : "bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] focus:ring-1 focus:ring-[#201E19]"
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide passcode" : "Show passcode"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#201E19] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Visual Strength Gauge & Live Security Checklist */}
                  {signUpPassword && (
                    <div className="mt-1 p-1.5 bg-[#DFD5BC]/50 border border-[#766E5F]/30 animate-in fade-in">
                      {/* Gauge Bar */}
                      <div className="w-full bg-[#766E5F]/20 h-1.5 rounded-none overflow-hidden mb-1.5">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>

                      {/* Criteria Checklist */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8px] sm:text-[8.5px] font-mono">
                        <span className={`flex items-center gap-1 ${passwordCriteria.minLength ? "text-[#2D6A4F] font-bold" : "text-[#766E5F]"}`}>
                          {passwordCriteria.minLength ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span>•</span>}
                          <span>8+ Characters</span>
                        </span>
                        <span className={`flex items-center gap-1 ${passwordCriteria.hasUpper ? "text-[#2D6A4F] font-bold" : "text-[#766E5F]"}`}>
                          {passwordCriteria.hasUpper ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span>•</span>}
                          <span>Uppercase (A-Z)</span>
                        </span>
                        <span className={`flex items-center gap-1 ${passwordCriteria.hasLower ? "text-[#2D6A4F] font-bold" : "text-[#766E5F]"}`}>
                          {passwordCriteria.hasLower ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span>•</span>}
                          <span>Lowercase (a-z)</span>
                        </span>
                        <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? "text-[#2D6A4F] font-bold" : "text-[#766E5F]"}`}>
                          {passwordCriteria.hasNumber ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span>•</span>}
                          <span>Number (0-9)</span>
                        </span>
                        <span className={`flex items-center gap-1 col-span-2 ${passwordCriteria.hasSpecial ? "text-[#2D6A4F] font-bold" : "text-[#766E5F]"}`}>
                          {passwordCriteria.hasSpecial ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span>•</span>}
                          <span>Special Symbol (!@#$...)</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {signUpTouched.password && signUpErrors.password && (
                    <p
                      id="signup-password-error"
                      role="alert"
                      className="text-[9px] font-mono font-semibold text-[#9F3028] flex items-center gap-1 mt-0.5"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{signUpErrors.password}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      htmlFor="signup-confirm-password"
                      className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider"
                    >
                      § CONFIRM CIPHER PASSCODE
                    </label>
                    {signUpConfirmPassword && (
                      signUpConfirmPassword === signUpPassword ? (
                        <span className="text-[#2D6A4F] font-mono text-[8.5px] font-bold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> CIPHER MATCHED
                        </span>
                      ) : (
                        <span className="text-[#9F3028] font-mono text-[8.5px] font-bold flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5" /> MISMATCH
                        </span>
                      )
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="Re-enter cipher passcode"
                      value={signUpConfirmPassword}
                      aria-invalid={signUpTouched.confirmPassword && !!signUpErrors.confirmPassword}
                      aria-describedby={signUpTouched.confirmPassword && signUpErrors.confirmPassword ? "signup-confirm-error" : undefined}
                      onBlur={() => setSignUpTouched((p) => ({ ...p, confirmPassword: true }))}
                      onChange={(e) => {
                        setSignUpConfirmPassword(e.target.value);
                        if (authBanner) setAuthBanner(null);
                      }}
                      className={`w-full border-2 pl-8 pr-8 py-1 sm:py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none transition-all shadow-[2px_2px_0px_#766E5F] ${
                        signUpTouched.confirmPassword && signUpErrors.confirmPassword
                          ? "bg-[#FAF2F2] border-[#9F3028] ring-1 ring-[#9F3028]/40 focus:border-[#9F3028]"
                          : signUpTouched.confirmPassword && !signUpErrors.confirmPassword && signUpConfirmPassword
                          ? "bg-[#F4F9F5] border-[#2D6A4F] focus:border-[#2D6A4F]"
                          : "bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] focus:ring-1 focus:ring-[#201E19]"
                      }`}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide passcode" : "Show passcode"}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#201E19] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {signUpTouched.confirmPassword && signUpErrors.confirmPassword && (
                    <p
                      id="signup-confirm-error"
                      role="alert"
                      className="text-[9px] font-mono font-semibold text-[#9F3028] flex items-center gap-1 mt-0.5"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{signUpErrors.confirmPassword}</span>
                    </p>
                  )}
                </div>

                {/* Preferred Topics Selector */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider">
                      § SELECT EDITORIAL BEATS:
                    </label>
                    <span className="text-[8px] font-mono text-[#766E5F]">
                      {selectedTopics.length} SELECTED
                    </span>
                  </div>
                  <div className={`flex flex-wrap gap-1 p-1 bg-[#DFD5BC]/60 border transition-colors ${
                    signUpTouched.topics && signUpErrors.topics ? "border-[#9F3028] bg-[#FAF2F2]" : "border-[#766E5F]/30"
                  }`}>
                    {availableTopics.map((topic) => {
                      const isSelected = selectedTopics.includes(topic);
                      return (
                        <button
                          type="button"
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className={`text-[8px] sm:text-[8.5px] font-mono font-bold px-1.5 py-0.5 transition-all cursor-pointer border flex items-center gap-0.5 uppercase tracking-wider ${
                            isSelected
                              ? "bg-[#201E19] text-[#EFE8D5] border-[#766E5F] shadow-[1px_1px_0px_#766E5F]"
                              : "bg-[#EFE8D5] text-[#39352D] border-[#766E5F]/30 hover:bg-[#D7CCB2] hover:text-[#201E19]"
                          }`}
                        >
                          {isSelected && <Check className="w-2 h-2 text-emerald-400 stroke-[3]" />}
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                  {signUpTouched.topics && signUpErrors.topics && (
                    <p role="alert" className="text-[9px] font-mono font-semibold text-[#9F3028] flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{signUpErrors.topics}</span>
                    </p>
                  )}
                </div>

                {/* Terms and Subscriber Codex Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-start gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        setSignUpTouched((p) => ({ ...p, agreeTerms: true }));
                      }}
                      className="w-3.5 h-3.5 mt-0.5 rounded-none border-2 border-[#766E5F] text-[#201E19] accent-[#201E19] cursor-pointer"
                    />
                    <span className="text-[9px] sm:text-[9.5px] font-mono text-[#39352D] leading-tight">
                      I agree to the Digital Times Sovereign Registry terms &amp; editorial guidelines.
                    </span>
                  </label>
                  {signUpTouched.agreeTerms && signUpErrors.agreeTerms && (
                    <p role="alert" className="text-[9px] font-mono font-semibold text-[#9F3028] flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{signUpErrors.agreeTerms}</span>
                    </p>
                  )}
                </div>

                {/* Submit Sign Up Button */}
                <div className="pt-0.5 sm:pt-1">
                  <button
                    type="submit"
                    disabled={isAuthPending}
                    className="w-full bg-[#201E19] hover:bg-[#9F3028] disabled:bg-[#333333] disabled:cursor-not-allowed text-[#EFE8D5] text-xs font-bold py-2 sm:py-2.5 px-3 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 border-2 border-[#766E5F] shadow-[3px_3px_0px_#766E5F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#766E5F] font-mono tracking-[0.14em] uppercase"
                  >
                    {isAuthPending ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>ENROLLING SUBSCRIBER...</span>
                      </span>
                    ) : (
                      <>
                        <span>CREATE ACCOUNT &amp; PROCEED TO LOGIN</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Link to Sign In Form */}
                <div className="pt-2 text-center border-t border-[#766E5F]/15 mt-2">
                  <p className="text-[10px] sm:text-[10.5px] font-mono text-[#39352D]">
                    Already registered reader?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setAuthBanner(null);
                      }}
                      className="text-[#201E19] hover:text-[#9F3028] font-bold underline underline-offset-2 cursor-pointer uppercase tracking-wider transition-colors ml-1 inline-flex items-center gap-1"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Imprint Footer */}
        <div className="shrink-0 w-full text-center pt-1.5 pb-0.5 text-[8.5px] sm:text-[9px] font-mono text-[#777777] border-t border-[#766E5F]/10 mt-auto">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <span>THE DIGITAL TIMES CO.</span>
            <span>•</span>
            <span>SOVEREIGN ARCHIVE</span>
            <span>•</span>
            <span>EST. 2026</span>
          </div>
          <p className="text-[8px] sm:text-[8.5px] text-[#888888]">
            Encrypted authentication with local client-side memory. No intrusive tracking.
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TELEGRAPH PASSCODE RECOVERY MODAL
         ───────────────────────────────────────────────────────────── */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm border-2 border-[#766E5F] bg-[#EFE8D5] p-4 shadow-[6px_6px_0px_#201E19] relative animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b-2 border-[#766E5F] text-[9px] font-mono tracking-widest uppercase">
              <span className="font-bold text-[#201E19] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#9F3028] inline-block" />
                PASSCODE RECOVERY WIRE
              </span>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-stone-600 hover:text-black cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {forgotStep === 3 ? (
              <div className="text-center py-3 space-y-2 animate-in fade-in">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-700 flex items-center justify-center text-emerald-800">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#201E19]">
                  Cipher Passcode Reset Complete
                </h3>
                <p className="text-[11px] font-mono text-[#39352D] leading-relaxed">
                  Your new credentials have been recorded in the Digital Times subscriber registry for <span className="font-bold underline">{forgotEmail}</span>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setAuthMode("signin");
                      setAuthBanner({
                        type: "success",
                        message: "Cipher passcode successfully reset! Please sign in with your new passcode.",
                      });
                    }}
                    className="w-full bg-[#201E19] hover:bg-[#9F3028] text-[#EFE8D5] text-xs font-bold py-2 font-mono uppercase tracking-wider border-2 border-[#766E5F] cursor-pointer shadow-[2px_2px_0px_#766E5F]"
                  >
                    RETURN TO SIGN IN &amp; ACCESS DISPATCH
                  </button>
                </div>
              </div>
            ) : forgotStep === 2 ? (
              /* STEP 2: ENTER CODE & SET NEW PASSCODE */
              <form onSubmit={handleForgotResetPassword} noValidate className="space-y-2.5 animate-in fade-in">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#201E19]">
                    Set New Cipher Passcode
                  </h3>
                  <p className="text-[10px] font-serif italic text-[#39352D] mt-0.5">
                    Recovery wire transmitted for <span className="font-bold not-italic font-mono">{forgotEmail}</span>. Enter code &amp; assign a new passcode.
                  </p>
                </div>

                {/* Dispatch Code Announcement Banner */}
                {forgotSuccessMsg && (
                  <div className="p-2 bg-emerald-50 border-2 border-emerald-700 text-emerald-900 text-[10px] font-mono font-semibold leading-tight shadow-xs">
                    {forgotSuccessMsg}
                  </div>
                )}

                {/* Error Banner */}
                {forgotErrorMsg && (
                  <div role="alert" className="p-2 bg-[#FAF2F2] border-2 border-[#9F3028] text-[#9F3028] text-[10px] font-mono font-semibold flex items-center gap-1.5 shadow-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{forgotErrorMsg}</span>
                  </div>
                )}

                {/* 6-Digit Code */}
                <div>
                  <label htmlFor="forgot-code" className="block text-[9px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-0.5">
                    § 6-DIGIT VERIFICATION CIPHER
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="forgot-code"
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 683880"
                      value={forgotResetCode}
                      onChange={(e) => {
                        setForgotResetCode(e.target.value.replace(/\D/g, ""));
                        setForgotErrorMsg("");
                      }}
                      className="w-full border-2 pl-8 pr-2.5 py-1.5 text-xs font-mono font-bold tracking-widest text-[#201E19] placeholder-[#888888] focus:outline-none bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] shadow-[2px_2px_0px_#766E5F]"
                    />
                  </div>
                </div>

                {/* New Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label htmlFor="forgot-new-pwd" className="block text-[9px] font-mono font-bold text-[#201E19] uppercase tracking-wider">
                      § NEW CIPHER PASSCODE (MIN 8 CHARS)
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="forgot-new-pwd"
                      type={showForgotNewPassword ? "text" : "password"}
                      required
                      placeholder="Min. 8 chars (upper, lower, digit)"
                      value={forgotNewPassword}
                      onChange={(e) => {
                        setForgotNewPassword(e.target.value);
                        setForgotErrorMsg("");
                      }}
                      className="w-full border-2 pl-8 pr-8 py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] shadow-[2px_2px_0px_#766E5F]"
                    />
                    <button
                      type="button"
                      aria-label={showForgotNewPassword ? "Hide passcode" : "Show passcode"}
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#201E19] cursor-pointer"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div>
                  <label htmlFor="forgot-confirm-pwd" className="block text-[9px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-0.5">
                    § CONFIRM NEW PASSCODE
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="forgot-confirm-pwd"
                      type={showForgotNewPassword ? "text" : "password"}
                      required
                      placeholder="Confirm new passcode"
                      value={forgotConfirmPassword}
                      onChange={(e) => {
                        setForgotConfirmPassword(e.target.value);
                        setForgotErrorMsg("");
                      }}
                      className="w-full border-2 pl-8 pr-2.5 py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19] shadow-[2px_2px_0px_#766E5F]"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotErrorMsg("");
                    }}
                    className="w-1/3 bg-[#DFD5BC] hover:bg-[#D4C8AD] text-[#201E19] text-xs font-bold py-2 font-mono uppercase tracking-wider border-2 border-[#766E5F] cursor-pointer"
                  >
                    BACK
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotPending}
                    className="w-2/3 bg-[#201E19] hover:bg-[#9F3028] disabled:bg-[#444] text-[#EFE8D5] text-xs font-bold py-2 font-mono uppercase tracking-wider border-2 border-[#766E5F] shadow-[2px_2px_0px_#766E5F] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isForgotPending ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>UPDATING...</span>
                      </>
                    ) : (
                      <>
                        <span>UPDATE PASSCODE</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 1: REQUEST RECOVERY DISPATCH */
              <form onSubmit={handleForgotRequestCode} noValidate className="space-y-2.5 animate-in fade-in">
                <div>
                  <h3 className="font-serif font-black text-lg text-[#201E19]">
                    Recover Subscriber Cipher
                  </h3>
                  <p className="text-[10.5px] font-serif italic text-[#39352D] mt-0.5">
                    Enter your registered email address to verify your account and receive a recovery code.
                  </p>
                </div>

                {/* Error Banner */}
                {forgotErrorMsg && (
                  <div role="alert" className="p-2 bg-[#FAF2F2] border-2 border-[#9F3028] text-[#9F3028] text-[10px] font-mono font-semibold flex items-center gap-1.5 shadow-xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{forgotErrorMsg}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-[9px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-1"
                  >
                    § CORRESPONDENT TELEGRAPH ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="alex@email.com"
                      value={forgotEmail}
                      onBlur={() => setForgotTouched(true)}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setForgotErrorMsg("");
                      }}
                      className="w-full border-2 pl-8 pr-2.5 py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none transition-all shadow-[2px_2px_0px_#766E5F] bg-[#EFE8D5] focus:bg-white border-[#766E5F] focus:border-[#201E19]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/2 bg-[#DFD5BC] hover:bg-[#D4C8AD] text-[#201E19] text-xs font-bold py-2 font-mono uppercase tracking-wider border-2 border-[#766E5F] cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotPending}
                    className="w-1/2 bg-[#201E19] hover:bg-[#9F3028] disabled:bg-[#444] text-[#EFE8D5] text-xs font-bold py-2 font-mono uppercase tracking-wider border-2 border-[#766E5F] shadow-[2px_2px_0px_#766E5F] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isForgotPending ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>CHECKING...</span>
                      </>
                    ) : (
                      <>
                        <span>TRANSMIT</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
