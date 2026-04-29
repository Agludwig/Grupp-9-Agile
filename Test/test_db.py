from pathlib import Path
import sys


sys.path.append(str(Path(__file__).resolve().parents[1]))

from Backend.app import db


if __name__ == "__main__":
	report = db.add_report(
		lon=12.34,
		lat=56.78,
		title="Test title",
		message="Test message",
	)
	print(report)

	image_path = Path(__file__).resolve().parent / "red_heart.jpg"
	with image_path.open("rb") as image_file:
		handled_image_bytes = image_file.read()

	db.mark_report_as_handled(
		report_id=report["id"],
		handled_image_bytes=handled_image_bytes,
	)
	print(f"Marked report {report['id']} as handled using {image_path.name}")