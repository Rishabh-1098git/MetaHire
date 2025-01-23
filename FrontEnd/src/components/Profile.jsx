import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Pencil, Upload, FileText } from "lucide-react";
import { Separator } from "./ui/separator";
const Profile = () => {
  const [profile, setProfile] = useState({
    name: "Rishabh Saini",
    email: "rishabhsaini1098@gmail.com",
    bio: "Full-Stack Web Developer | React, Node.js, Firebase, MongoDB | JavaScript, Python, Java and DSA | Dedicated to Building High-Impact, Scalable Solution",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    resumeFileName: "jane_doe_resume.pdf",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleUpdateProfile = () => {
    setProfile(editedProfile);
    setIsEditModalOpen(false);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedProfile((prev) => ({
        ...prev,
        resumeFileName: file.name,
      }));
    }
  };

  return (
    <Card className="w-full h-full mx-auto bg-black font-mainFont">
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
      <CardContent className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Profile Details */}
        <div className="space-y-4">
          <Separator />
          <div className="flex items-center space-x-4">
            <div className="w-44 h-44 bg-gray-800 rounded-full flex items-center justify-center text-white text-3xl mr-10">
              {profile.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">Bio</h3>
            <p>{profile.bio}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
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

        {/* Right Column - Resume Section */}
        <div className="space-y-8 border-l border-gray-700 pl-6">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center mb-10 text-xl">
              <FileText className="mr-2 h-5 w-5" /> Resume
            </h3>
            <Separator />
            {profile.resumeFileName ? (
              <div className="bg-black p-4 rounded-md flex items-center justify-between">
                <span className="text-secondary-foreground">
                  {profile.resumeFileName}
                </span>
                <Button size="sm">View</Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 p-6 text-center">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-muted-foreground">Upload Resume</span>
                </Label>
              </div>
            )}
            <Separator />
          </div>
        </div>
      </CardContent>

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
                value={editedProfile.name}
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
                value={editedProfile.email}
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
                value={editedProfile.bio}
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
                value={editedProfile.skills.join(", ")}
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
              <Label>Resume</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Label
                  htmlFor="resume-upload"
                  className="flex items-center cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 p-2 rounded-md"
                >
                  <Upload className="mr-2" /> Upload PDF
                </Label>
                <span className="text-sm text-muted-foreground">
                  {editedProfile.resumeFileName}
                </span>
              </div>
            </div>

            <Button onClick={handleUpdateProfile} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Profile;
