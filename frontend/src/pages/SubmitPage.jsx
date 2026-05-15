import ReportForm from "../components/ReportForm";

export default function SubmitPage({ onSubmit, currentUser }) {
  return (
    <>
      <h2>Submit a Report</h2>
      <ReportForm onSubmit={onSubmit} currentUser={currentUser} />
    </>
  );
}