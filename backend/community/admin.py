from django.contrib import admin
from .models import Post, Comment, Like, KarmaTransaction

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "like_count", "created_at")
    search_fields = ("content", "author__username")

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "post", "parent", "like_count", "created_at")
    search_fields = ("content", "author__username")

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "comment", "created_at")

@admin.register(KarmaTransaction)
class KarmaTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "points", "created_at")
