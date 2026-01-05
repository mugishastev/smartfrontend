import ProfileSettings from "./ProfileSettings";

const MemberSettingsPage = () => {
  return (
    <div className="p-6">
      <ProfileSettings 
        title="Member Settings"
        description="Update your profile information. Email and role cannot be changed."
      />
    </div>
  );
};

export default MemberSettingsPage;

