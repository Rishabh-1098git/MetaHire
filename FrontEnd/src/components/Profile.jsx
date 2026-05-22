import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Atom } from "react-loading-indicators";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Camera, Mail, FileText, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FourSquare } from "react-loading-indicators";
import { getCachedUser, setCachedUser } from "@/lib/userCache";

const Profile = ({ onNavigate }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const cached = getCachedUser();
      if (cached) {
        setUserData(cached);
        setEditedProfile(cached);
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCachedUser(data);
        setUserData(data);
        setEditedProfile(data);
      } catch {
        navigate("/signingsignup");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveChanges = async (updatedProfile) => {
    try {
      const token = localStorage.getItem("token");
      const { name, email, bio, skills, photoUrl } = updatedProfile;
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/profile`,
        { name, email, bio, skills, photoUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const merged = { ...userData, name, email, bio, skills, photoUrl };
      setUserData(merged);
      setCachedUser(merged);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Error saving profile data.");
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/upload-photo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const updated = { ...editedProfile, photoUrl: data.data.path };
      setEditedProfile(updated);
      await handleSaveChanges(updated);
      setIsImageDialogOpen(false);
    } catch (err) {
      console.error("Error uploading photo:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <FourSquare color="#6366F1" size="medium" text="" textColor="" />
    </div>
  );
  if (error) return <div className="text-red-400 text-sm p-4">{error}</div>;

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");
  const sessions = userData?.feedbacks?.length || 0;

  return (
    <div className="w-full font-mainFont space-y-4">

      {/* Identity card */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="relative group flex-shrink-0">
              <div
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold cursor-pointer"
                style={{
                  background: uploadingPhoto || !userData?.photoUrl
                    ? "rgba(99,102,241,0.15)"
                    : "transparent",
                  border: "2px solid rgba(99,102,241,0.35)",
                }}
                onClick={() => setIsImageDialogOpen(true)}
              >
                {uploadingPhoto ? (
                  <Atom color="#818cf8" size="small" />
                ) : userData?.photoUrl ? (
                  <img src={userData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-400">{getInitial(userData?.name)}</span>
                )}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={16} className="text-white" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white font-display leading-tight">
                {userData?.name || "Anonymous User"}
              </h2>
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                <Mail size={12} />
                {userData?.email}
              </p>
              {sessions > 0 && (
                <p className="text-xs text-slate-500 mt-1.5">
                  {sessions} interview session{sessions !== 1 ? "s" : ""} completed
                </p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.06] text-xs gap-1.5"
          >
            <Pencil size={11} />
            Edit
          </Button>
        </div>
      </div>

      {/* Bio */}
      {userData?.bio ? (
        <div
          className="rounded-xl p-5"
          style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText size={13} className="text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Bio</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{userData.bio}</p>
        </div>
      ) : (
        <div
          className="rounded-xl p-5 border-dashed"
          style={{ background: "rgba(99,102,241,0.04)", border: "1px dashed rgba(99,102,241,0.2)" }}
        >
          <p className="text-xs text-slate-500 text-center">
            No bio yet —{" "}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              add one
            </button>
          </p>
        </div>
      )}

      {/* Skills */}
      {userData?.skills && userData.skills.length > 0 ? (
        <div
          className="rounded-xl p-5"
          style={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Code2 size={13} className="text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {userData.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.22)",
                  color: "#a5b4fc",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-5 border-dashed"
          style={{ background: "rgba(34,211,238,0.04)", border: "1px dashed rgba(34,211,238,0.15)" }}
        >
          <p className="text-xs text-slate-500 text-center">
            No skills listed —{" "}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              add skills
            </button>
          </p>
        </div>
      )}

      {/* Photo dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent
          className="max-w-sm"
          style={{ background: "rgba(10,14,26,0.98)", border: "1px solid rgba(99,102,241,0.22)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white font-display">Update Profile Photo</DialogTitle>
            <DialogDescription className="text-slate-400">Select an image file.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files[0]; if (f) handlePhotoUpload(f); }}
              className="bg-white/[0.04] border-white/10 text-white"
              disabled={uploadingPhoto}
            />
            <Button
              onClick={() => setIsImageDialogOpen(false)}
              disabled={uploadingPhoto}
              variant="outline"
              className="border-white/10 text-slate-300"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="max-w-lg"
          style={{ background: "rgba(10,14,26,0.98)", border: "1px solid rgba(99,102,241,0.22)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white font-display">Edit Profile</DialogTitle>
            <DialogDescription className="text-slate-400">Update your profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {[
              { label: "Name", key: "name", placeholder: "Your name" },
              { label: "Email", key: "email", placeholder: "your@email.com" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-slate-300 text-sm">{label}</Label>
                <Input
                  value={editedProfile?.[key] || ""}
                  onChange={(e) => setEditedProfile((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 h-10 focus:border-indigo-500/50"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Bio</Label>
              <Textarea
                value={editedProfile?.bio || ""}
                onChange={(e) => setEditedProfile((p) => ({ ...p, bio: e.target.value }))}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Skills (comma-separated)</Label>
              <Input
                value={editedProfile?.skills?.join(", ") || ""}
                onChange={(e) =>
                  setEditedProfile((p) => ({
                    ...p,
                    skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  }))
                }
                placeholder="React, Node.js, Python..."
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 h-10 focus:border-indigo-500/50"
              />
            </div>
            <Button
              onClick={() => handleSaveChanges(editedProfile)}
              className="w-full h-10 font-medium text-white"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
