import os
import sys
import types

import pytest
from fastapi.testclient import TestClient


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Backend', 'app'))
if ROOT not in sys.path:
	sys.path.insert(0, ROOT)


fake_supabase_mod = types.ModuleType('supabase')


class _FakeStorageBucket:
	def upload(self, path, file_bytes, opts=None):
		return None


class _FakeStorage:
	def from_(self, name):
		return _FakeStorageBucket()


class _FakeSupabaseClient:
	def __init__(self):
		self.storage = _FakeStorage()


def fake_create_client(url, key):
	return _FakeSupabaseClient()


fake_supabase_mod.create_client = fake_create_client
fake_supabase_mod.Client = _FakeSupabaseClient
sys.modules['supabase'] = fake_supabase_mod


import main
from models import ReportCreate


@pytest.fixture
def client():
	return TestClient(main.app)


def test_signup_report_endpoint(client, monkeypatch):
	called = {}

	def fake_signup(report_id, user_id):
		called['args'] = (report_id, user_id)
		return {'report_id': report_id, 'signed_up_by': user_id}

	monkeypatch.setattr(main, 'sign_up_to_handle', fake_signup)

	response = client.post('/reports/15/signup', data={'user_id': '8'})

	assert response.status_code == 200
	assert response.json()['message'] == 'User signed up to handle report'
	assert response.json()['report_id'] == 15
	assert response.json()['signed_up_by'] == 8
	assert called['args'] == (15, 8)


def test_get_reports_endpoint(client, monkeypatch):
	def fake_get_all_reports():
		return [{'id': 1, 'title': 'Report A'}]

	monkeypatch.setattr(main, 'get_all_reports', fake_get_all_reports)

	response = client.get('/reports')

	assert response.status_code == 200
	assert response.json() == [{'id': 1, 'title': 'Report A'}]


def test_get_leaderboard_endpoint_default_limit(client, monkeypatch):
	called = {}

	def fake_get_top_users_by_points(limit=10):
		called['limit'] = limit
		return [{'user_name': 'alice', 'points': 15}]

	monkeypatch.setattr(main, 'get_top_users_by_points', fake_get_top_users_by_points)

	response = client.get('/leaderboard')

	assert response.status_code == 200
	assert response.json() == [{'user_name': 'alice', 'points': 15}]
	assert called['limit'] == 10


def test_get_leaderboard_endpoint_custom_limit(client, monkeypatch):
	called = {}

	def fake_get_top_users_by_points(limit=10):
		called['limit'] = limit
		return [{'user_name': 'bob', 'points': 8}]

	monkeypatch.setattr(main, 'get_top_users_by_points', fake_get_top_users_by_points)

	response = client.get('/leaderboard?limit=3')

	assert response.status_code == 200
	assert response.json() == [{'user_name': 'bob', 'points': 8}]
	assert called['limit'] == 3


def test_create_report_endpoint_success(client, monkeypatch):
	def fake_submit_report(report):
		assert isinstance(report, ReportCreate)
		return {'message': 'Report successfully submitted', 'id': 123}

	monkeypatch.setattr(main, 'submit_report', fake_submit_report)

	payload = {
		'title': 'Broken light',
		'description': 'Streetlight is not working',
		'lon': 12.3,
		'lat': 45.6,
		'user_id': 9,
	}

	response = client.post('/reports', json=payload)

	assert response.status_code == 200
	assert response.json() == {'message': 'Report successfully submitted', 'id': 123}


def test_create_report_endpoint_value_error(client, monkeypatch):
	def fake_submit_report(report):
		raise ValueError('Title is required')

	monkeypatch.setattr(main, 'submit_report', fake_submit_report)

	payload = {
		'title': ' ',
		'description': 'Streetlight is not working',
		'lon': 12.3,
		'lat': 45.6,
		'user_id': 9,
	}

	response = client.post('/reports', json=payload)

	assert response.status_code == 400
	assert response.json()['detail'] == 'Title is required'


def test_upload_image_endpoint(client, monkeypatch):
	called = {}

	def fake_upload_report_image(file_bytes, report_id, is_handled=False):
		called['args'] = (file_bytes, report_id, is_handled)
		return f'reports/unhandled_images/{report_id}.jpg'

	monkeypatch.setattr(main, 'upload_report_image', fake_upload_report_image)

	response = client.post(
		'/reports/22/image',
		files={'file': ('photo.jpg', b'abc123', 'image/jpeg')},
	)

	assert response.status_code == 200
	assert response.json() == {'path': 'reports/unhandled_images/22.jpg'}
	assert called['args'] == (b'abc123', 22, False)


def test_handle_report_endpoint(client, monkeypatch):
	called = {}

	def fake_handle(report_id, handled_by, file_bytes):
		called['args'] = (report_id, handled_by, file_bytes)

	monkeypatch.setattr(main, 'mark_report_as_handled_with_points', fake_handle)

	response = client.post(
		'/reports/33/handle',
		data={'handled_by': '7'},
		files={'file': ('done.jpg', b'handled-bytes', 'image/jpeg')},
	)

	assert response.status_code == 200
	assert response.json() == {'message': 'Report marked as handled'}
	assert called['args'] == (33, 7, b'handled-bytes')


def test_remove_signup_report_endpoint(client, monkeypatch):
	called = {}

	def fake_remove(report_id, user_id):
		called['args'] = (report_id, user_id)
		return {'report_id': report_id, 'signed_up_by': None}

	monkeypatch.setattr(main, 'remove_signup_from_handle', fake_remove)

	response = client.post('/reports/15/signup/remove', data={'user_id': '8'})

	assert response.status_code == 200
	assert response.json()['message'] == 'User removed from report signup'
	assert response.json()['report_id'] == 15
	assert response.json()['signed_up_by'] is None
	assert called['args'] == (15, 8)
