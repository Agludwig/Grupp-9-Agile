import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Profile({ currentUser, setCurrentUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  const profileId = userId || currentUser?.id;
  const isOwnProfile = currentUser && Number(profileId) === Number(currentUser.id);

  const [profile, setProfile] = useState(null);
  const [description, setDescription] = useState("");
  const [pointsVisible, setPointsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    if (!profileId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const viewerQuery = currentUser?.id ? `?viewer_id=${currentUser.id}` : "";
    const response = await fetch(`${API_URL}/users/${profileId}/profile${viewerQuery}`);

    if (response.ok) {
      const data = await response.json();

      setProfile(data);
      setDescription(data.description || "");
      setPointsVisible(data.points_visible);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, [profileId, currentUser?.id]);

  async function handleSave(e) {
    e.preventDefault();

    const response = await fetch(`${API_URL}/users/${profile.id}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        points_visible: pointsVisible,
      }),
    });

    if (response.ok) {
      const updated = await response.json();
      setProfile(updated);
      alert("Profile updated");
    } else {
      alert("Could not update profile");
    }
  }

  async function handlePictureUpload(e) {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/users/${profile.id}/profile-picture`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const updated = await response.json();
      setProfile(updated);
      alert("Profile picture updated");
    } else {
      alert("Could not upload profile picture");
    }
  }

  if (loading) {
    return <div className="container mt-4">Loading profile...</div>;
  }

  if (!profileId) {
    return <div className="container mt-4">You need to log in to view your account.</div>;
  }

  if (!profile) {
    return <div className="container mt-4">Profile not found.</div>;
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "700px" }}>
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate(-1)}>
        Back
      </button>

      <div className="card p-4 shadow-sm">
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {profile.profile_picture_url ? (
            <img
              src={profile.profile_picture_url}
              alt={`${profile.username}'s profile`}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #ddd",
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
              }}
            >
              👤
            </div>
          )}

          <div>
            <h2>{profile.username}</h2>

            <p style={{ marginBottom: "6px" }}>
              <strong>Points:</strong>{" "}
              {profile.user_points === null ? "Hidden by user" : profile.user_points}
            </p>

            {isOwnProfile && !profile.points_visible && (
              <small className="text-muted">
                Your points are visible to you, but hidden from other users.
              </small>
            )}
          </div>
        </div>

        <hr />

        {!isOwnProfile && (
          <>
            <h5>Description</h5>
            <p>{profile.description || "This user has not added a description yet."}</p>
          </>
        )}

        {isOwnProfile && (
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label">Profile picture</label>
              <input
                className="form-control"
                type="file"
                accept="image/*"
                onChange={handlePictureUpload}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something about yourself..."
              />
            </div>

            <div className="form-check mb-3">
              <input
                id="pointsVisible"
                className="form-check-input"
                type="checkbox"
                checked={pointsVisible}
                onChange={(e) => setPointsVisible(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="pointsVisible">
                Show my points to other users
              </label>
            </div>

            <button className="btn btn-primary" type="submit">
              Save profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
