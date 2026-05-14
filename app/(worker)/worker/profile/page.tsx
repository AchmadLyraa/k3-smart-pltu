import UserProfile from "@/components/users/user-profile";

export const metadata = {
  title: "My Profile",
  description: "View and manage your profile information",
};

export default function ProfilePage() {
  return (
    <div className="container py-6">
      <UserProfile />
    </div>
  );
}
