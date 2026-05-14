export default function AccountPage({ currentUser }) {
  return (
    <div>
      <h2>My Account</h2>
      <p>Logged in as: {currentUser?.username ?? "Unknown"}</p>
    </div>
  );
}