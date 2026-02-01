from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import F


class Post(models.Model):
    """
    Represents a text post in the community feed.
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Post by {self.author.username} - {self.content[:50]}"
    
    @property
    def like_count(self):
        """Returns the total number of likes for this post"""
        return self.likes.count()
    
    def get_comment_tree(self):
        """
        Efficiently fetches the entire comment tree for this post.
        Uses select_related to avoid N+1 queries.
        """
        return Comment.objects.filter(
            post=self
        ).select_related('author').prefetch_related('likes').order_by('created_at')


class Comment(models.Model):
    """
    Represents a comment on a post or a reply to another comment.
    Uses adjacency list pattern with parent_id for nested structure.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE, 
        related_name='replies'
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Denormalized fields for performance
    depth = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'parent']),
            models.Index(fields=['post', 'created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"
    
    @property
    def like_count(self):
        """Returns the total number of likes for this comment"""
        return self.likes.count()
    
    def save(self, *args, **kwargs):
        """
        Automatically calculate depth based on parent.
        This helps with efficient tree rendering.
        """
        if self.parent:
            self.depth = self.parent.depth + 1
        else:
            self.depth = 0
        super().save(*args, **kwargs)


class Like(models.Model):
    """
    Represents a like on either a Post or a Comment.
    Uses database constraints to prevent double-liking.
    Tracks karma transactions for leaderboard calculation.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(
        Post, 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    comment = models.ForeignKey(
        Comment, 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            # Ensure a user can only like a post once
            models.UniqueConstraint(
                fields=['user', 'post'],
                name='unique_post_like',
                condition=models.Q(post__isnull=False)
            ),
            # Ensure a user can only like a comment once
            models.UniqueConstraint(
                fields=['user', 'comment'],
                name='unique_comment_like',
                condition=models.Q(comment__isnull=False)
            ),
            # Ensure either post or comment is set, but not both
            models.CheckConstraint(
                check=(
                    models.Q(post__isnull=False, comment__isnull=True) |
                    models.Q(post__isnull=True, comment__isnull=False)
                ),
                name='like_post_or_comment'
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'post']),
            models.Index(fields=['user', 'comment']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        if self.post:
            return f"{self.user.username} liked Post {self.post.id}"
        return f"{self.user.username} liked Comment {self.comment.id}"
    
    def get_karma_value(self):
        """
        Returns the karma value for this like.
        Post likes = 5 karma, Comment likes = 1 karma
        """
        return 5 if self.post else 1
    
    def get_content_author(self):
        """Returns the author of the liked content"""
        return self.post.author if self.post else self.comment.author