import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

// **1. ProfileCard Bileşeni – Rol Gösterimi**

type Props = {
  profile: UserInstance | null | undefined;
};

const ProfileCard = ({ profile }: Props) => {
  const name = profile?.name || AuthSession.getName() || "-";
  const email = profile?.email || AuthSession.getEmail() || "-";

  const normalizeRole = (value: any) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) return normalizeRole(value[0]);
    if (typeof value === "object" && value.name) return value.name;
    return null;
  };

  const roleFromApi = normalizeRole(profile?.role);
  const roleFromSession = normalizeRole(AuthSession.getRoles());

  const role = roleFromApi || roleFromSession || "-";

  return (
    <div className="profile-section">
      <div className="profile-info">
        <h2>Welcome, {name}</h2>
        <p>{email}</p>
        <p>{role}</p>
      </div>
    </div>
  );
};

export default ProfileCard;
