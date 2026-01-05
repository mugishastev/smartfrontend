import ProfileSettings from "./ProfileSettings";

const AccountantSettingsPage = () => {
  return (
    <div className="p-6">
      <ProfileSettings 
        title="Accountant Settings"
        description="Update your profile information. Email and role cannot be changed."
      />
    </div>
  );
};

export default AccountantSettingsPage;

