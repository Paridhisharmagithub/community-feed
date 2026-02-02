from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
from django.db import transaction, IntegrityError
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Q

from .models import Post, Comment, Like, KarmaTransaction
from .serializers import PostSerializer


# =========================
# AUTH
# =========================
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"detail": "username & password required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"detail": "username exists"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username
        }
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    user = authenticate(
        username=request.data.get("username"),
        password=request.data.get("password")
    )

    if not user:
        return Response({"detail": "Invalid credentials"}, status=400)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username
        }
    })


# =========================
# POSTS
# =========================
@api_view(["GET"])
def list_posts(request):
    qs = Post.objects.select_related("author").order_by("-created_at")
    return Response(PostSerializer(qs, many=True).data)


@api_view(["GET"])
def get_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    return Response(PostSerializer(post).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_post(request):
    content = request.data.get("content", "").strip()
    if not content:
        return Response({"detail": "content required"}, status=400)

    post = Post.objects.create(author=request.user, content=content)
    return Response(PostSerializer(post).data, status=201)


# =========================
# COMMENTS
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    content = request.data.get("content", "").strip()
    parent_id = request.data.get("parent_id")

    if not content:
        return Response({"detail": "content required"}, status=400)

    parent = None
    if parent_id:
        parent = get_object_or_404(Comment, id=parent_id, post=post)

    Comment.objects.create(
        post=post,
        author=request.user,
        parent=parent,
        content=content
    )

    return Response(PostSerializer(post).data, status=201)


# =========================
# LIKES
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    try:
        with transaction.atomic():
            Like.objects.create(user=request.user, post=post)
            KarmaTransaction.objects.create(user=post.author, points=5)
    except IntegrityError:
        return Response({"detail": "Already liked"}, status=400)

    return Response({"success": True})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    try:
        with transaction.atomic():
            Like.objects.create(user=request.user, comment=comment)
            KarmaTransaction.objects.create(user=comment.author, points=1)
    except IntegrityError:
        return Response({"detail": "Already liked"}, status=400)

    return Response({"success": True})


# =========================
# LEADERBOARD (24H)
# =========================
@api_view(["GET"])
def leaderboard(request):
    since = timezone.now() - timedelta(hours=24)

    qs = (
        KarmaTransaction.objects
        .filter(created_at__gte=since)
        .values("user__id", "user__username")
        .annotate(
            karma_24h=Sum("points"),
            post_likes=Sum("points", filter=Q(points=5)),
            comment_likes=Sum("points", filter=Q(points=1)),
        )
        .order_by("-karma_24h")[:5]
    )

    # 🔥 Shape data properly for frontend
    result = []
    for row in qs:
        result.append({
            "id": row["user__id"],
            "username": row["user__username"],
            "karma_24h": row["karma_24h"] or 0,
            "post_likes": row["post_likes"] or 0,
            "comment_likes": row["comment_likes"] or 0,
        })

    return Response(result)
