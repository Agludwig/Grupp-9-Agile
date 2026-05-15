import sys
import os
import types
import importlib

import pytest
from fastapi.testclient import TestClient

# Ensure Backend app package is importable
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Backend', 'app'))
if ROOT not in sys.path:
	sys.path.insert(0, ROOT)

# Provide a fake `supabase` module before importing `db` so no network calls occur
fake_supabase_mod = types.ModuleType('supabase')

class _FakeStorageBucket:
	def __init__(self):
		self.upload_calls = []

	def upload(self, path, file_bytes, opts=None):
		self.upload_calls.append((path, file_bytes, opts))


class _FakeStorage:
	def __init__(self):
		self._bucket = _FakeStorageBucket()

	def from_(self, name):
		return self._bucket


class _FakeSupabaseClient:
	def __init__(self):
		self.storage = _FakeStorage()


def fake_create_client(url, key):
	return _FakeSupabaseClient()


fake_supabase_mod.create_client = fake_create_client
fake_supabase_mod.Client = _FakeSupabaseClient
sys.modules['supabase'] = fake_supabase_mod

import db
import main


class FakeCursor:
	def __init__(self, fetchone=None, fetchall=None, description=None):
		self._fetchone = fetchone
		self._fetchall = fetchall
		self.description = description
		self.executed = []

	def execute(self, query, params=None):
		self.executed.append((query, params))

	def fetchone(self):
		return self._fetchone

	def fetchall(self):
		return self._fetchall

	def __enter__(self):
		return self

	def __exit__(self, exc_type, exc, tb):
		return False


class FakeConnection:
	def __init__(self, cursor_obj: FakeCursor):
		self._cursor = cursor_obj
		self.committed = False

	def cursor(self):
		return self._cursor

	def commit(self):
		self.committed = True

	def __enter__(self):
		return self

	def __exit__(self, exc_type, exc, tb):
		return False


def make_fake_connect(cursor_obj: FakeCursor):
	def _connect(*args, **kwargs):
		return FakeConnection(cursor_obj)
	return _connect


@pytest.fixture
def client():
	return TestClient(main.app)


def test_get_top_users_by_points_empty():
	assert db.get_top_users_by_points(0) == []


def test_get_top_users_by_points_db(monkeypatch):
	# Prepare cursor to return two rows
	description = [('user_name',), ('points',)]
	rows = [('alice', 10), ('bob', 5)]
	cur = FakeCursor(fetchone=None, fetchall=rows, description=description)
	monkeypatch.setattr(db, 'psycopg', types.SimpleNamespace(connect=make_fake_connect(cur)))

	res = db.get_top_users_by_points(2)
	assert isinstance(res, list)
	assert res[0]['user_name'] == 'alice'
	assert res[0]['points'] == 10


def test_create_user_and_login(monkeypatch):
	# create_user
	cur_create = FakeCursor(fetchone=(7, 'newuser'), fetchall=None, description=None)
	monkeypatch.setattr(db, 'psycopg', types.SimpleNamespace(connect=make_fake_connect(cur_create)))
	created = db.create_user('newuser', 'pw')
	assert created['id'] == 7
	assert created['username'] == 'newuser'

	# login_user success
	cur_login = FakeCursor(fetchone=(7, 'newuser'), fetchall=None, description=None)
	monkeypatch.setattr(db, 'psycopg', types.SimpleNamespace(connect=make_fake_connect(cur_login)))
	logged = db.login_user('newuser', 'pw')
	assert logged['id'] == 7
	assert logged['username'] == 'newuser'

	# login_user failure
	cur_login_fail = FakeCursor(fetchone=None, fetchall=None, description=None)
	monkeypatch.setattr(db, 'psycopg', types.SimpleNamespace(connect=make_fake_connect(cur_login_fail)))
	assert db.login_user('nouser', 'bad') is None


def test_upload_report_image_calls_supabase_and_updates_db(monkeypatch):
	# prepare fake supabase client already set on import; access it via db.supabase
	# prepare fake cursor to accept UPDATE
	cur = FakeCursor(fetchone=None, fetchall=None, description=None)
	monkeypatch.setattr(db, 'psycopg', types.SimpleNamespace(connect=make_fake_connect(cur)))

	file_bytes = b'jpegbytes'
	path = db.upload_report_image(file_bytes, report_id=11, is_handled=False)

	assert path.endswith('11.jpg')
	# ensure the DB update was executed with the path and id
	assert len(cur.executed) >= 1
	last_query, last_params = cur.executed[-1]
	assert 'UPDATE reports' in last_query
	assert last_params[0] == path
	assert last_params[1] == 11


def test_sign_up_to_handle_updates_report(monkeypatch):
	cur = FakeCursor(fetchone=None, fetchall=None, description=None)
	monkeypatch.setattr(db, 'psycopg', types.SimpleNamespace(connect=make_fake_connect(cur)))

	res = db.sign_up_to_handle(report_id=42, user_id=99)
	assert res['report_id'] == 42
	assert res['signed_up_by'] == 99

	# verify DB update executed with correct params
	assert len(cur.executed) >= 1
	last_query, last_params = cur.executed[-1]
	assert 'UPDATE reports' in last_query
	assert last_params[0] == 99
	assert last_params[1] == 42


def test_remove_signup_from_handle_updates_report(monkeypatch):
	cur = FakeCursor(fetchone=None, fetchall=None, description=None)
	monkeypatch.setattr(db, 'psycopg', types.SimpleNamespace(connect=make_fake_connect(cur)))

	res = db.remove_signup_from_handle(report_id=42, user_id=99)
	assert res['report_id'] == 42
	assert res['signed_up_by'] is None

	assert len(cur.executed) >= 1
	last_query, last_params = cur.executed[-1]
	assert 'UPDATE reports' in last_query
	assert last_params[0] == 42
	assert last_params[1] == 99


def test_remove_signup_endpoint(client, monkeypatch):
	called = {}

	def fake_remove(report_id, user_id):
		called['args'] = (report_id, user_id)
		return {'report_id': report_id, 'signed_up_by': None}

	monkeypatch.setattr('main.remove_signup_from_handle', fake_remove)
	resp = client.post('/reports/7/signup/remove', data={'user_id': '13'})
	assert resp.status_code == 200
	assert resp.json()['report_id'] == 7
	assert resp.json()['signed_up_by'] is None
	assert called['args'] == (7, 13)
