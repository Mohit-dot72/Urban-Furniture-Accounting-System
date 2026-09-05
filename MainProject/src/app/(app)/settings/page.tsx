"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Lock, Globe } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"profile" | "password" | "preferences">("profile");

  const fullName = session?.user?.name || "User";
  const [firstName = "", lastName = ""] = fullName.split(" ");
  const email = session?.user?.email || "";
  const initials = (firstName[0] || "") + (lastName[0] || "");

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-semibold">User Profile / Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {([
          { id: "profile", label: "Profile", icon: User },
          { id: "password", label: "Change Password", icon: Lock },
          { id: "preferences", label: "Preferences", icon: Globe },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              tab === id ? "bg-card shadow-none text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card className="border-0 shadow-none">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" className="text-xs">Change Image</Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name</label>
                <Input defaultValue={firstName} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name</label>
                <Input defaultValue={lastName} className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <Input defaultValue={email} className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile</label>
                <Input defaultValue="" placeholder="Not provided" className="h-9 text-sm" />
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Role & Permissions</p>
              <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">Administrator · Full Access</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs">Manage</Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: "/auth/login" })}>Sign Out</Button>
              <Button size="sm">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "password" && (
        <Card className="border-0 shadow-none">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Password</label>
              <Input type="password" className="h-9 text-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
              <Input type="password" className="h-9 text-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm Password</label>
              <Input type="password" className="h-9 text-sm" placeholder="••••••••" />
            </div>
            <div className="flex justify-end">
              <Button size="sm">Update Password</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "preferences" && (
        <Card className="border-0 shadow-none">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
              <Select defaultValue="English">
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date Format</label>
              <Select defaultValue="dd/MM/yyyy">
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                  <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
              <Select defaultValue="INR">
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button size="sm">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
