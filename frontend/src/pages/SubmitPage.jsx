import ReportForm from "../components/ReportForm";

export default function SubmitPage({ onSubmit }) {
  return (
    <>
      <h2>Submit a Report</h2>
      <ReportForm onSubmit={onSubmit} />
    </>
  );
}