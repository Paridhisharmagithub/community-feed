from django.urls import path
from . import views

urlpatterns = [
    path("auth/register/", views.register),
    path("auth/login/", views.login),

    path("posts/", views.list_posts),
    path("posts/<int:post_id>/", views.get_post),
    path("posts/create/", views.create_post),
    path("posts/<int:post_id>/comments/", views.create_comment),
    path("posts/<int:post_id>/like/", views.like_post),

    path("comments/<int:comment_id>/like/", views.like_comment),

    path("leaderboard/", views.leaderboard),
]
