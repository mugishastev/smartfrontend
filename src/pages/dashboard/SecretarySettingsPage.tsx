import ProfileSettings from "./ProfileSettings";

const SecretarySettingsPage = () => {
  return (
    <div className="p-6">
      <ProfileSettings 
        title="Secretary Settings"
        description="Update your profile information. Email and role cannot be changed."
      />
    </div>
  );
};

export default SecretarySettingsPage;

