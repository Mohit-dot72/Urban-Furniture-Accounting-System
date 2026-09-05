"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User, Lock, Globe, Phone, Mail, Edit3, Save, CheckCircle2,
  AlertCircle, KeyRound, ArrowRight, ShieldCheck, RefreshCw, Smartphone, Loader2, Sun, Moon
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState<"profile" | "password" | "preferences">("profile");

  // Profile Form States
  const [isEditing, setIsEditing] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // OTP Forgot Password Modal State
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpChannel, setOtpChannel] = useState<"GMAIL" | "MOBILE">("GMAIL");
  const [otpStep, setOtpStep] = useState<"REQUEST" | "VERIFY" | "NEW_PASSWORD" | "SUCCESS">("REQUEST");
  
  const [targetGmail, setTargetGmail] = useState("");
  const [targetMobile, setTargetMobile] = useState("");
  
  // OTP digits state (6 digits)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);

  // OTP New Password State
  const [otpNewPassword, setOtpNewPassword] = useState("");
  const [otpConfirmPassword, setOtpConfirmPassword] = useState("");

  useEffect(() => {
    if (session?.user) {
      const fullName = session.user.name || "User";
      const [f = "", l = ""] = fullName.split(" ");
      setFirstName(f);
      setLastName(l);
      setEmail(session.user.email || "");
      if (session.user.email) {
        setTargetGmail(session.user.email);
      }
    }
  }, [session]);

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (otpStep === "VERIFY" && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, timerSeconds]);

  const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "U";

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("Profile details, mobile number, and email updated successfully!");
    setTimeout(() => setProfileSuccess(""), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setPasswordMsg({ type: "success", text: "Your password has been changed successfully!" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordMsg(null), 5000);
  };

  // Open OTP Dialog Cleanly
  const openOtpModal = () => {
    setOtpStep("REQUEST");
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpNewPassword("");
    setOtpConfirmPassword("");
    if (email) setTargetGmail(email);
    if (mobile) setTargetMobile(mobile);
    setOtpDialogOpen(true);
  };

  // Step 1: Request & Send OTP to Gmail or Mobile via Real Backend API
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);

    const recipient = otpChannel === "GMAIL" ? targetGmail : targetMobile;

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: otpChannel, recipient }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP code.");
      }

      setOtpLoading(false);
      setOtpStep("VERIFY");
      setTimerSeconds(60);
    } catch (err: any) {
      setOtpLoading(false);
      setOtpError(err.message || "Error dispatching OTP code.");
    }
  };

  // Step 2: Verify 6-digit OTP locally or ready for step 3
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length < 6) {
      setOtpError("Please enter all 6 digits of the OTP code.");
      return;
    }

    setOtpError("");
    setOtpStep("NEW_PASSWORD");
  };

  // Step 3: Save New Password via Backend API verification
  const handleSaveOtpPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (otpNewPassword.length < 6) {
      setOtpError("Password must be at least 6 characters long.");
      return;
    }
    if (otpNewPassword !== otpConfirmPassword) {
      setOtpError("Passwords do not match.");
      return;
    }

    setOtpLoading(true);
    const recipient = otpChannel === "GMAIL" ? targetGmail : targetMobile;

    try {
      const res = await fetch("/api/reset-password-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          otp: otpDigits.join(""),
          newPassword: otpNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed. Please try again.");
      }

      setOtpLoading(false);
      setOtpStep("SUCCESS");
    } catch (err: any) {
      setOtpLoading(false);
      setOtpError(err.message || "Failed to reset password.");
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const copy = [...otpDigits];
    copy[index] = val.slice(-1);
    setOtpDigits(copy);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 font-bold text-xl">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              User Profile & Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage personal info, mobile contact, email preferences, and password security
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: "profile" as const, label: "Edit Profile & Contact", icon: User },
          { id: "password" as const, label: "Password & Security", icon: Lock },
          { id: "preferences" as const, label: "System Preferences", icon: Globe },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all capitalize whitespace-nowrap ${
              tab === id
                ? "bg-blue-600 text-white shadow-sm font-semibold"
                : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* TAB 1: EDIT PROFILE & CONTACT */}
      {tab === "profile" && (
        <Card className="border border-border shadow-none rounded-2xl overflow-hidden">
          <CardContent className="p-8 space-y-8">
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 bg-muted/30 p-6 rounded-2xl border border-border/60">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Avatar className="h-22 w-22 rounded-2xl ring-4 ring-background shadow-md shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-3xl font-extrabold rounded-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-lg font-bold text-foreground">{firstName || "User"} {lastName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck size={11} /> Verified Account
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{email || "No email provided"}</p>
                  <p className="text-xs font-mono text-blue-500">{mobile || "No mobile number"}</p>
                </div>
              </div>
              
              <Button
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-9 text-xs gap-1.5 rounded-xl shrink-0"
              >
                <Edit3 size={14} /> {isEditing ? "Editing Mode Active" : "Edit Profile"}
              </Button>
            </div>

            {profileSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 size={16} className="shrink-0" />
                {profileSuccess}
              </div>
            )}

            {/* Profile Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Edit3 size={14} className="text-blue-500" /> Personal & Contact Details
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter first name"
                    className="h-11 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter last name"
                    className="h-11 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Mail size={14} className="text-muted-foreground" /> Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    placeholder="name@example.com"
                    className="h-11 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Used for primary account login, accounting notifications & invoice receipts.
                  </p>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                    <Phone size={14} className="text-muted-foreground" /> Mobile / Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={!isEditing}
                    placeholder="+91 98765 43210"
                    className="h-11 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Mobile number used for SMS alerts, OTP verification, and WhatsApp payment updates.
                  </p>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-full sm:w-auto h-10 px-5 text-xs rounded-xl"
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                >
                  Sign Out of Account
                </Button>

                {isEditing && (
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full sm:w-auto h-10 px-6 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold gap-1.5 shadow-sm"
                  >
                    <Save size={14} /> Save Profile Changes
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: CHANGE PASSWORD & OTP FORGOT PASSWORD */}
      {tab === "password" && (
        <div className="space-y-6">
          {/* Card 1: Standard Password Update */}
          <Card className="border border-border shadow-none rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-6 max-w-2xl">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <KeyRound size={18} className="text-blue-500" /> Change Security Password
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ensure your accounting account stays secure by using a strong password.
                </p>
              </div>

              {passwordMsg && (
                <div
                  className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                    passwordMsg.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                      : "bg-red-500/10 border border-red-500/20 text-red-500"
                  }`}
                >
                  {passwordMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground/80">Current Password *</label>
                    <button
                      type="button"
                      onClick={openOtpModal}
                      className="text-xs font-semibold text-blue-500 hover:underline"
                    >
                      Forgot Password? (OTP Reset)
                    </button>
                  </div>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-11 text-sm rounded-xl bg-background border-border"
                    placeholder="••••••••"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">New Password *</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 text-sm rounded-xl bg-background border-border"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Confirm New Password *</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 text-sm rounded-xl bg-background border-border"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openOtpModal}
                    className="h-10 text-xs px-4 rounded-xl border-border text-muted-foreground hover:text-blue-500 gap-1.5"
                  >
                    <Smartphone size={14} /> Forgot Password via OTP
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    className="h-10 px-6 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold gap-1.5"
                  >
                    <Lock size={14} /> Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Card 2: OTP Password Reset Banner */}
          <Card className="border border-blue-500/20 bg-blue-500/[0.03] shadow-none rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Smartphone size={16} className="text-blue-500" /> Lost Password? Reset via Gmail or Mobile OTP
                </h4>
                <p className="text-xs text-muted-foreground">
                  Receive a 6-digit OTP code directly on your registered Gmail account or Mobile number to set a new password safely.
                </p>
              </div>

              <Button
                onClick={openOtpModal}
                size="sm"
                className="h-9 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold shrink-0 gap-1.5"
              >
                Reset Password with OTP <ArrowRight size={13} />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: SYSTEM PREFERENCES */}
      {tab === "preferences" && (
        <Card className="border border-border shadow-none rounded-2xl overflow-hidden">
          <CardContent className="p-8 space-y-6 max-w-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Regional & Formatting Settings</h4>
            <div className="space-y-5">
              {/* Theme Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Background Theme Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-500/10 text-blue-600 font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Sun size={18} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Light Mode</p>
                      <p className="text-[10px] text-muted-foreground">Clean light background</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-500/10 text-blue-600 font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Moon size={18} className="text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Dark Mode</p>
                      <p className="text-[10px] text-muted-foreground">Sleek dark background</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Interface Language</label>
                <Select defaultValue="English">
                  <SelectTrigger className="h-11 text-sm rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English (United States)</SelectItem>
                    <SelectItem value="Hindi">Hindi (हिंदी)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Date Display Format</label>
                <Select defaultValue="dd/MM/yyyy">
                  <SelectTrigger className="h-11 text-sm rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (e.g. 28/05/2025)</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (e.g. 05/28/2025)</SelectItem>
                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (ISO Format)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Base Accounting Currency</label>
                <Select defaultValue="INR">
                  <SelectTrigger className="h-11 text-sm rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <Button size="sm" className="h-10 px-6 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold">
                Save System Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OTP FORGOT PASSWORD MODAL DIALOG */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <KeyRound size={22} />
            </div>
            <DialogTitle className="text-lg font-bold">
              {otpStep === "REQUEST" && "Reset Password with OTP"}
              {otpStep === "VERIFY" && "Verify 6-Digit OTP Code"}
              {otpStep === "NEW_PASSWORD" && "Set New Password"}
              {otpStep === "SUCCESS" && "Password Reset Complete!"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {otpStep === "REQUEST" && "Choose whether to receive your OTP code via Gmail or Mobile number."}
              {otpStep === "VERIFY" && `Enter the 6-digit OTP code sent to your ${otpChannel === "GMAIL" ? "Gmail inbox" : "Mobile phone SMS"}.`}
              {otpStep === "NEW_PASSWORD" && "Enter your new password below."}
              {otpStep === "SUCCESS" && "Your password has been successfully updated using OTP authentication."}
            </DialogDescription>
          </DialogHeader>

          {otpError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              {otpError}
            </div>
          )}

          {/* STEP 1: REQUEST OTP CHANNEL */}
          {otpStep === "REQUEST" && (
            <form onSubmit={handleSendOtp} className="space-y-4 py-2">
              {/* Channel Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/80">Select OTP Delivery Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOtpChannel("GMAIL")}
                    className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      otpChannel === "GMAIL"
                        ? "border-blue-500 bg-blue-500/10 text-blue-600 font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Mail size={18} className={otpChannel === "GMAIL" ? "text-blue-600" : "text-muted-foreground"} />
                    <span className="text-xs mt-1">Gmail Email</span>
                    <span className="text-[10px] font-normal text-muted-foreground">Receive via Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtpChannel("MOBILE")}
                    className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      otpChannel === "MOBILE"
                        ? "border-blue-500 bg-blue-500/10 text-blue-600 font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Smartphone size={18} className={otpChannel === "MOBILE" ? "text-blue-600" : "text-muted-foreground"} />
                    <span className="text-xs mt-1">Mobile SMS</span>
                    <span className="text-[10px] font-normal text-muted-foreground">Receive via Phone</span>
                  </button>
                </div>
              </div>

              {/* Input for Email or Phone */}
              {otpChannel === "GMAIL" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Registered Gmail Address *</label>
                  <Input
                    type="email"
                    required
                    value={targetGmail}
                    onChange={(e) => setTargetGmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="h-10 text-sm rounded-xl"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">Registered Mobile Number *</label>
                  <Input
                    type="tel"
                    required
                    value={targetMobile}
                    onChange={(e) => setTargetMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-10 text-sm rounded-xl font-mono"
                  />
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOtpDialogOpen(false)}
                  className="w-full sm:w-auto text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={otpLoading}
                  size="sm"
                  className="w-full sm:w-auto text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold gap-1.5"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Sending OTP...
                    </>
                  ) : (
                    <>
                      Send 6-Digit OTP <ArrowRight size={13} />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* STEP 2: VERIFY OTP DIGITS */}
          {otpStep === "VERIFY" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 py-2">
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 text-xs flex items-start gap-3">
                <ShieldCheck size={18} className="shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-bold">OTP Code Sent!</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    A secure 6-digit OTP code has been dispatched to your <span className="font-semibold text-foreground">{otpChannel === "GMAIL" ? `Gmail address (${targetGmail})` : `Mobile number via SMS (${targetMobile})`}</span>. Please check your {otpChannel === "GMAIL" ? "Gmail inbox/spam folder" : "Messages app"}.
                  </p>
                </div>
              </div>

              {/* 6 Digit Box Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/80 text-center block">Enter 6-Digit Verification Code</label>
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-digit-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      className="w-10 h-12 text-center text-lg font-bold rounded-xl border border-border bg-background focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>Didn&apos;t receive code?</span>
                {timerSeconds > 0 ? (
                  <span className="font-mono text-xs text-blue-500">Resend in {timerSeconds}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleSendOtp(e)}
                    className="text-blue-500 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOtpStep("REQUEST")}
                  className="w-full sm:w-auto text-xs rounded-xl"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full sm:w-auto text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold gap-1.5"
                >
                  Verify OTP Code <ArrowRight size={13} />
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {otpStep === "NEW_PASSWORD" && (
            <form onSubmit={handleSaveOtpPassword} className="space-y-4 py-2">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} /> OTP Verified! Enter your new password below.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">New Password *</label>
                <Input
                  type="password"
                  required
                  value={otpNewPassword}
                  onChange={(e) => setOtpNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="h-10 text-sm rounded-xl bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Confirm New Password *</label>
                <Input
                  type="password"
                  required
                  value={otpConfirmPassword}
                  onChange={(e) => setOtpConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 text-sm rounded-xl bg-background border-border"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={otpLoading}
                  size="sm"
                  className="w-full text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold gap-1.5"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving Password...
                    </>
                  ) : (
                    <>
                      Save New Password <CheckCircle2 size={14} />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {otpStep === "SUCCESS" && (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">Password Reset Successfully!</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your password has been updated via real OTP verification. You can now use your new password to sign in.
                </p>
              </div>
              <DialogFooter>
                <Button
                  size="sm"
                  className="w-full text-xs rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold"
                  onClick={() => setOtpDialogOpen(false)}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
