from django.test import TestCase
from django.contrib.auth.models import User
from .models import KarmaTransaction
from django.utils import timezone
from datetime import timedelta

class LeaderboardTest(TestCase):
    def test_last_24h_leaderboard(self):
        u1 = User.objects.create_user("u1", password="p")
        u2 = User.objects.create_user("u2", password="p")
        KarmaTransaction.objects.create(user=u1, points=50)
        old = KarmaTransaction.objects.create(user=u2, points=100)
        old.created_at = timezone.now() - timedelta(days=2)
        old.save()

        from .views import leaderboard
        from rest_framework.test import APIRequestFactory
        req = APIRequestFactory().get("/api/leaderboard/")
        resp = leaderboard(req)
        self.assertEqual(resp.status_code, 200)
        data = resp.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["user"]["username"], "u1")
