from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth.models import User
from django.db import transaction, IntegrityError, models
from django.utils import timezone
from datetime import timedelta
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Post, Comment, Like, KarmaTransaction
from .serializers import PostListSerializer, CommentSerializer, UserSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Sum

# --- Auth helpers (register + login) ---
@api_view(["POST"])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return Response({"detail":"username & password required"}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({"detail":"username exists"}, status=400)
    user = User.objects.create_user(username=username, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": {"id": user.id, "username": user.username}})

@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = get_object_or_404(User, username=username)
    if not user.check_password(password):
        return Response({"detail":"invalid credentials"}, status=400)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": {"id": user.id, "username": user.username}})

# --- Posts ---
class PostViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        qs = Post.objects.select_related("author").order_by("-created_at")
        serializer = PostListSerializer(qs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        post = get_object_or_404(Post.objects.select_related("author"), pk=pk)

        # Fetch ALL comments for the post in 1 query
        comments_qs = Comment.objects.filter(post=post).select_related("author").order_by("created_at")
        # Build id -> node map
        nodes = {}
        for c in comments_qs:
            nodes[c.id] = {
                "id": c.id,
                "author": {"id": c.author.id, "username": c.author.username},
                "content": c.content,
                "like_count": c.like_count,
                "created_at": c.created_at,
                "children": []
            }
        roots = []
        for c in comments_qs:
            if c.parent_id and c.parent_id in nodes:
                nodes[c.parent_id]["children"].append(nodes[c.id])
            else:
                roots.append(nodes[c.id])

        post_data = {
            "id": post.id,
            "author": {"id": post.author.id, "username": post.author.username},
            "content": post.content,
            "like_count": post.like_count,
            "created_at": post.created_at,
            "comments": roots
        }
        return Response(post_data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_post(request):
    content = request.data.get("content", "").strip()
    if not content:
        return Response({"detail":"content required"}, status=400)
    p = Post.objects.create(author=request.user, content=content)
    return Response({"id": p.id, "content": p.content}, status=201)

# --- Comments ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    parent_id = request.data.get("parent_id")
    content = request.data.get("content", "").strip()
    if not content:
        return Response({"detail":"content required"}, status=400)
    parent = None
    if parent_id:
        parent = get_object_or_404(Comment, id=parent_id, post=post)
    c = Comment.objects.create(post=post, author=request.user, parent=parent, content=content)
    return Response({"id": c.id, "content": c.content}, status=201)

# --- Like Post ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    user = request.user
    post = get_object_or_404(Post, id=post_id)
    try:
        with transaction.atomic():
            Like.objects.create(user=user, post=post)
            Post.objects.filter(id=post.id).update(like_count=models.F('like_count') + 1)
            KarmaTransaction.objects.create(user=post.author, points=5)
    except IntegrityError:
        return Response({"detail":"Already liked"}, status=400)
    return Response({"success": True})

# --- Like Comment ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_comment(request, comment_id):
    user = request.user
    comment = get_object_or_404(Comment, id=comment_id)
    try:
        with transaction.atomic():
            Like.objects.create(user=user, comment=comment)
            Comment.objects.filter(id=comment.id).update(like_count=models.F('like_count') + 1)
            KarmaTransaction.objects.create(user=comment.author, points=1)
    except IntegrityError:
        return Response({"detail":"Already liked"}, status=400)
    return Response({"success": True})

# --- Leaderboard last 24h ---
@api_view(["GET"])
def leaderboard(request):
    last_24 = timezone.now() - timedelta(hours=24)
    qs = KarmaTransaction.objects.filter(created_at__gte=last_24).values("user").annotate(total=Sum("points")).order_by("-total")[:5]
    out = []
    user_map = {u.id: u for u in __import__("django.contrib.auth").contrib.auth.get_user_model().objects.filter(id__in=[x['user'] for x in qs])}
    for item in qs:
        user = user_map.get(item['user'])
        out.append({"user": {"id": user.id, "username": user.username}, "karma": item["total"]})
    return Response(out)
