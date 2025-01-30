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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { Separator } from "./ui/separator";
import { useNavigate } from "react-router-dom";
import { FourSquare } from "react-loading-indicators";
const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserData(data);
        setEditedProfile(data);
      } catch (error) {
        navigate("/signingsignup");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveChanges = async (updatedProfile) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BASE_URL}/api/auth/profile`,
        updatedProfile,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserData((prevUserData) => ({
        ...prevUserData,
        ...updatedProfile,
      }));

      setIsEditModalOpen(false);
    } catch (error) {
      console.error(
        "Error saving profile data:",
        error.response ? error.response.data : error
      );
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
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedProfile = {
        ...editedProfile,
        photoUrl: data.data.path,
      };

      // First update the local state
      setEditedProfile(updatedProfile);
      setUserData(updatedProfile);

      // Then save to backend
      await handleSaveChanges(updatedProfile);

      setProfileImage(null);
      setIsImageDialogOpen(false);
    } catch (error) {
      console.error(
        "Error uploading photo:",
        error.response ? error.response.data : error
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle profile image change
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      await handlePhotoUpload(file);
    }
  };

  if (loading)
    return (
      <div>
        <FourSquare color="#2563EB" size="medium" text="" textColor="" />
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <Card className="w-full h-full mx-auto bg-black font-mainFont mb-10">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          My Profile
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Separator />
          <div className="flex items-center space-x-4 relative">
            <div className="w-44 h-44 bg-gray-800 rounded-full flex items-center justify-center text-white text-3xl relative group">
              {uploadingPhoto ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Atom color="#ffffff" size="medium" />
                </div>
              ) : (
                <>
                  {userData?.photoUrl ? (
                    <img
                      src={userData.photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    userData?.name?.[0] || "U"
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil
                      className="h-8 w-8 text-white cursor-pointer"
                      onClick={() => setIsImageDialogOpen(true)}
                    />
                  </div>
                </>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{userData?.name}</h2>
              <p className="text-muted-foreground">{userData?.email}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">Bio</h3>
            <p>{userData?.bio}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {userData?.skills?.map((skill) => (
                <span
                  key={skill}
                  className="bg-black text-secondary-foreground px-2 py-1 rounded-md text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Profile Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-md bg-black bg-opacity-90 border-white">
          <DialogHeader>
            <DialogTitle>Update Profile Image</DialogTitle>
            <DialogDescription>
              Select an image file to update your profile picture.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="bg-black text-white"
              disabled={uploadingPhoto}
            />
            <Button
              onClick={() => setIsImageDialogOpen(false)}
              disabled={uploadingPhoto}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-black bg-opacity-90 border-white">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editedProfile?.name}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="bg-black"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={editedProfile?.email}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="bg-black"
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={editedProfile?.bio}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                className="bg-black"
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <Input
                value={editedProfile?.skills?.join(", ")}
                onChange={(e) =>
                  setEditedProfile((prev) => ({
                    ...prev,
                    skills: e.target.value
                      .split(",")
                      .map((skill) => skill.trim()),
                  }))
                }
                placeholder="Enter skills separated by comma"
                className="bg-black"
              />
            </div>

            <div className="space-y-2">
              <Button onClick={() => handleSaveChanges(editedProfile)}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Profile;
