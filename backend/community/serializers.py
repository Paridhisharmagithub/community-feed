from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Comment, Like


# ---------- USER ----------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


# ---------- COMMENT (RECURSIVE) ----------
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "content",
            "created_at",
            "like_count",
            "is_liked",
            "children",
        ]

    def get_children(self, obj):
        # Recursive serialization
        children = obj.children.all().order_by("created_at")
        return CommentSerializer(
            children,
            many=True,
            context=self.context
        ).data

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        return Like.objects.filter(
            user=request.user,
            comment=obj
        ).exists()


# ---------- POST ----------
class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "content",
            "created_at",
            "comment_count",
            "like_count",
            "is_liked",
            "comments",
        ]

    def get_comments(self, obj):
        # Only top-level comments
        comments = obj.comments.filter(parent__isnull=True).order_by("created_at")
        return CommentSerializer(
            comments,
            many=True,
            context=self.context
        ).data

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        return Like.objects.filter(
            user=request.user,
            post=obj
        ).exists()
