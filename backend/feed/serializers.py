from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Comment, Like
from collections import defaultdict


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for Comment model.
    Includes nested replies to build the comment tree.
    """
    author = UserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'parent', 'author', 'content',
            'created_at', 'updated_at', 'depth', 'like_count',
            'replies', 'is_liked'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'depth', 'author']
    
    def get_replies(self, obj):
        """
        Get replies for this comment.
        This is populated by the view using the optimized tree structure.
        """
        # Check if replies are already attached by the view
        if hasattr(obj, '_prefetched_replies'):
            return CommentSerializer(
                obj._prefetched_replies, 
                many=True, 
                context=self.context
            ).data
        return []
    
    def get_is_liked(self, obj):
        """Check if the current user has liked this comment"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Use prefetched data if available
            if hasattr(obj, '_user_liked'):
                return obj._user_liked
            return obj.likes.filter(user=request.user).exists()
        return False


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model with optimized comment tree"""
    author = UserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'author', 'content', 'created_at', 'updated_at',
            'like_count', 'comment_count', 'is_liked'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'author']
    
    def get_is_liked(self, obj):
        """Check if the current user has liked this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Use prefetched data if available
            if hasattr(obj, '_user_liked'):
                return obj._user_liked
            return obj.likes.filter(user=request.user).exists()
        return False


class PostDetailSerializer(PostSerializer):
    """
    Extended serializer for Post detail view.
    Includes the complete comment tree with optimized loading.
    """
    comments = serializers.SerializerMethodField()
    
    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['comments']
    
    def get_comments(self, obj):
        """
        Build the comment tree efficiently.
        This avoids N+1 queries by using a single query with prefetch_related.
        """
        # Get all comments for this post in a single query
        all_comments = list(obj.get_comment_tree())
        
        # Build a lookup dictionary for O(1) access
        comment_dict = {comment.id: comment for comment in all_comments}
        
        # Attach user liked status if authenticated
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_likes = set(
                Like.objects.filter(
                    user=request.user,
                    comment__in=all_comments
                ).values_list('comment_id', flat=True)
            )
            for comment in all_comments:
                comment._user_liked = comment.id in user_likes
        
        # Build the tree structure
        root_comments = []
        for comment in all_comments:
            comment._prefetched_replies = []
            
            if comment.parent_id is None:
                root_comments.append(comment)
            else:
                parent = comment_dict.get(comment.parent_id)
                if parent:
                    if not hasattr(parent, '_prefetched_replies'):
                        parent._prefetched_replies = []
                    parent._prefetched_replies.append(comment)
        
        # Serialize root comments (replies will be serialized recursively)
        return CommentSerializer(
            root_comments, 
            many=True, 
            context=self.context
        ).data


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for Like model"""
    karma_value = serializers.IntegerField(source='get_karma_value', read_only=True)
    
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'comment', 'created_at', 'karma_value']
        read_only_fields = ['id', 'user', 'created_at']
    
    def validate(self, data):
        """Ensure either post or comment is provided, but not both"""
        if not data.get('post') and not data.get('comment'):
            raise serializers.ValidationError(
                "Either 'post' or 'comment' must be provided."
            )
        if data.get('post') and data.get('comment'):
            raise serializers.ValidationError(
                "Cannot like both a post and comment simultaneously."
            )
        return data


class LeaderboardSerializer(serializers.Serializer):
    """
    Serializer for leaderboard data.
    Displays user karma earned in the last 24 hours.
    """
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    karma_24h = serializers.IntegerField()
    post_likes = serializers.IntegerField()
    comment_likes = serializers.IntegerField()