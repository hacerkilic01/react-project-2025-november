import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
    profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="profile-section">
      <div className="profile-info">
        <h2>Welcome, {profile?.name}</h2>
        <p>{profile?.email ?? AuthSession.getEmail()}</p>
        <p>{/*profile?.role ??*/ AuthSession.getRoles()}</p>
      </div>
    </div>
  );
};

export default ProfileCard;