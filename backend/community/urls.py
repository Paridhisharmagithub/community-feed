from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"posts", views.PostViewSet, basename="post")

urlpatterns = [
    path("auth/register/", views.register),
    path("auth/login/", views.login),
    path("posts/create/", views.create_post),
    path("posts/<int:post_id>/like/", views.like_post),
    path("posts/<int:post_id>/comments/", views.create_comment),
    path("comments/<int:comment_id>/like/", views.like_comment),
    path("leaderboard/", views.leaderboard),
]
urlpatterns += router.urls
