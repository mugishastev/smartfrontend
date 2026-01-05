import ProfileSettings from "./ProfileSettings";

const CoopSettingsPage = () => {
  return (
    <div className="p-6">
      <ProfileSettings 
        title="Cooperative Admin Settings"
        description="Update your profile information. Email and role cannot be changed."
      />
    </div>
  );
};

export default CoopSettingsPage;

