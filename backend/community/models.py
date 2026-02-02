from django.db import models
from django.contrib.auth.models import User
from django.db.models import UniqueConstraint


class Post(models.Model):
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post {self.id} by {self.author.username}"

    @property
    def comment_count(self):
        return self.comments.count()

    @property
    def like_count(self):
        return self.post_likes.count()


class Comment(models.Model):
    post = models.ForeignKey(
        Post, related_name="comments", on_delete=models.CASCADE
    )
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="comments"
    )
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="children",
        on_delete=models.CASCADE,
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment {self.id} by {self.author.username}"

    @property
    def like_count(self):
        return self.comment_likes.count()


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    post = models.ForeignKey(
        Post,
        null=True,
        blank=True,
        related_name="post_likes",
        on_delete=models.CASCADE,
    )
    comment = models.ForeignKey(
        Comment,
        null=True,
        blank=True,
        related_name="comment_likes",
        on_delete=models.CASCADE,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["user", "post"],
                name="unique_post_like",
            ),
            UniqueConstraint(
                fields=["user", "comment"],
                name="unique_comment_like",
            ),
        ]

    def __str__(self):
        return f"Like by {self.user.username}"


class KarmaTransaction(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="karma_transactions"
    )
    points = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.points} karma → {self.user.username}"
