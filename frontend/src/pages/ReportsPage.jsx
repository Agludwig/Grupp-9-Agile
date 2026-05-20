import ReportMap from "../components/ReportMap";
import List from "../components/List";
import ReportDetailView from "../components/ReportDetailView";

export default function ReportsPage({ reports, currentUser, selectedReport, setSelectedReport, onRefresh, onSignup, onUnassign }) {
  return (
    <>
      <h2>Map Overview</h2>
      <ReportMap reports={reports} onSelectReport={setSelectedReport} />

      <h2 className="mt-5">All Submitted Reports</h2>
      <List reports={reports} onSelectReport={setSelectedReport} />

      {selectedReport && (
        <ReportDetailView
          report={selectedReport}
          currentUser={currentUser}
          onClose={() => setSelectedReport(null)}
          onSignup={onSignup}
          onUnassign={onUnassign}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}