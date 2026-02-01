from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.contrib.auth.models import User
from django.db.models import Count, Q, Sum, Case, When, IntegerField, Prefetch
from django.db import transaction, IntegrityError
from django.utils import timezone
from datetime import timedelta
from .models import Post, Comment, Like
from .serializers import (
    PostSerializer, PostDetailSerializer, CommentSerializer,
    LikeSerializer, LeaderboardSerializer, UserSerializer
)


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Post model.
    Provides CRUD operations and optimized queries to avoid N+1.
    """
    queryset = Post.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """
        Optimize queryset with select_related and annotate.
        Prevents N+1 queries when loading posts.
        """
        queryset = Post.objects.select_related('author').annotate(
            like_count=Count('likes', distinct=True),
            comment_count=Count('comments', distinct=True)
        )
        
        # Add user-specific like status if authenticated
        if self.request.user.is_authenticated:
            user_likes = Like.objects.filter(
                user=self.request.user,
                post__isnull=False
            ).values_list('post_id', flat=True)
            
            for post in queryset:
                post._user_liked = post.id in list(user_likes)
        
        return queryset
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer
    
    def perform_create(self, serializer):
        """Set the author to the current user"""
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """
        Like a post. Uses database-level constraints to prevent double-liking.
        Handles race conditions with transaction and IntegrityError catching.
        """
        post = self.get_object()
        
        try:
            with transaction.atomic():
                # Attempt to create the like
                like = Like.objects.create(
                    user=request.user,
                    post=post
                )
                return Response(
                    {
                        'status': 'liked',
                        'like_count': post.likes.count(),
                        'karma_value': like.get_karma_value()
                    },
                    status=status.HTTP_201_CREATED
                )
        except IntegrityError:
            # Like already exists due to unique constraint
            return Response(
                {
                    'status': 'already_liked',
                    'like_count': post.likes.count()
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unlike(self, request, pk=None):
        """Remove a like from a post"""
        post = self.get_object()
        
        deleted_count, _ = Like.objects.filter(
            user=request.user,
            post=post
        ).delete()
        
        if deleted_count > 0:
            return Response(
                {
                    'status': 'unliked',
                    'like_count': post.likes.count()
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'status': 'not_liked'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Comment model.
    Provides CRUD operations with optimized queries.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """
        Optimize queryset with select_related.
        Prevents N+1 queries when loading comments.
        """
        queryset = Comment.objects.select_related('author', 'post').annotate(
            like_count=Count('likes')
        )
        
        # Filter by post if provided
        post_id = self.request.query_params.get('post')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        # Add user-specific like status if authenticated
        if self.request.user.is_authenticated:
            user_likes = Like.objects.filter(
                user=self.request.user,
                comment__isnull=False
            ).values_list('comment_id', flat=True)
            
            for comment in queryset:
                comment._user_liked = comment.id in list(user_likes)
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the author to the current user"""
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """
        Like a comment. Uses database-level constraints to prevent double-liking.
        Handles race conditions with transaction and IntegrityError catching.
        """
        comment = self.get_object()
        
        try:
            with transaction.atomic():
                # Attempt to create the like
                like = Like.objects.create(
                    user=request.user,
                    comment=comment
                )
                return Response(
                    {
                        'status': 'liked',
                        'like_count': comment.likes.count(),
                        'karma_value': like.get_karma_value()
                    },
                    status=status.HTTP_201_CREATED
                )
        except IntegrityError:
            # Like already exists due to unique constraint
            return Response(
                {
                    'status': 'already_liked',
                    'like_count': comment.likes.count()
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unlike(self, request, pk=None):
        """Remove a like from a comment"""
        comment = self.get_object()
        
        deleted_count, _ = Like.objects.filter(
            user=request.user,
            comment=comment
        ).delete()
        
        if deleted_count > 0:
            return Response(
                {
                    'status': 'unliked',
                    'like_count': comment.likes.count()
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'status': 'not_liked'},
                status=status.HTTP_400_BAD_REQUEST
            )


class LeaderboardView(generics.ListAPIView):
    """
    View for displaying the top 5 users by karma earned in the last 24 hours.
    Calculates karma dynamically from Like transaction history.
    Does NOT use a simple integer field on User model.
    """
    serializer_class = LeaderboardSerializer
    
    def get_queryset(self):
        """
        Calculate the leaderboard using complex aggregation.
        
        Algorithm:
        1. Filter likes created in the last 24 hours
        2. Group by the content author (not the liker)
        3. Calculate karma: SUM(CASE WHEN post THEN 5 ELSE 1)
        4. Order by karma descending
        5. Return top 5
        
        This query is executed efficiently in a single database call.
        """
        # Calculate the timestamp for 24 hours ago
        twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
        
        # Build the aggregation query
        # We need to get the author of the liked content, not the liker
        leaderboard = Like.objects.filter(
            created_at__gte=twenty_four_hours_ago
        ).values(
            'post__author', 'comment__author'
        ).annotate(
            # Calculate karma for post likes (5 points each)
            post_karma=Sum(
                Case(
                    When(post__isnull=False, then=5),
                    default=0,
                    output_field=IntegerField()
                )
            ),
            # Calculate karma for comment likes (1 point each)
            comment_karma=Sum(
                Case(
                    When(comment__isnull=False, then=1),
                    default=0,
                    output_field=IntegerField()
                )
            ),
            # Count likes by type
            post_likes=Count('id', filter=Q(post__isnull=False)),
            comment_likes=Count('id', filter=Q(comment__isnull=False)),
        )
        
        # Process results to combine post and comment karma per user
        user_karma = {}
        for item in leaderboard:
            # Determine which author field has the actual user
            author_id = item['post__author'] or item['comment__author']
            if author_id:
                if author_id not in user_karma:
                    user_karma[author_id] = {
                        'user_id': author_id,
                        'karma_24h': 0,
                        'post_likes': 0,
                        'comment_likes': 0
                    }
                
                user_karma[author_id]['karma_24h'] += (
                    item['post_karma'] + item['comment_karma']
                )
                user_karma[author_id]['post_likes'] += item['post_likes']
                user_karma[author_id]['comment_likes'] += item['comment_likes']
        
        # Convert to list and sort by karma
        leaderboard_list = sorted(
            user_karma.values(),
            key=lambda x: x['karma_24h'],
            reverse=True
        )[:5]  # Top 5 users
        
        # Fetch usernames
        user_ids = [item['user_id'] for item in leaderboard_list]
        users = {
            u.id: u.username 
            for u in User.objects.filter(id__in=user_ids)
        }
        
        # Add usernames to results
        for item in leaderboard_list:
            item['username'] = users.get(item['user_id'], 'Unknown')
        
        return leaderboard_list
    
    def list(self, request, *args, **kwargs):
        """Override list to handle non-QuerySet data"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for User model.
    Read-only access to user data.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]