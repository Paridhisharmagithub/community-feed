from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Comment, KarmaTransaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]

class CommentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    author = UserSerializer()
    content = serializers.CharField()
    like_count = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    children = serializers.ListField()

class PostListSerializer(serializers.ModelSerializer):
    author = UserSerializer()
    class Meta:
        model = Post
        fields = ["id", "author", "content", "like_count", "created_at"]
