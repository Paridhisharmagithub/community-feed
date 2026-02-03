# EXPLAINER.md — Technical Deep-Dive

This document answers the three critical technical questions for the challenge.

---

## 1️⃣ The Tree: Nested Comment Architecture

### How did you model nested comments in the database?

**Model Structure:**
```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    depth = models.PositiveIntegerField(default=0)  # Denormalized for performance
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['post', 'parent']),
            models.Index(fields=['post', 'created_at']),
        ]
```

**Design Choice: Adjacency List Pattern**

I used the **adjacency list** pattern where each comment has a `parent` field pointing to another comment (or NULL for root comments).

**Why this approach?**
- ✅ Simple to understand and implement
- ✅ Easy to add new replies (just set parent_id)
- ✅ Works well for moderate tree depths (typical for community feeds)
- ✅ Allows single-query retrieval of all comments

**Alternatives considered:**
- **Materialized Path** (e.g., "1/5/23") — More complex updates, better for deep trees
- **Nested Sets** — Fast reads but expensive writes
- **Closure Table** — Overkill for this use case

---

### How did you serialize them without killing the DB?

**The Problem:**
Loading a post with 50 nested comments naively would cause:
```
1 query for the post
+ 50 queries for each comment's children
= 51 total queries ❌
```

**The Solution: Single Query + In-Memory Tree Building**

```python
def get_comment_tree(post):
    # Step 1: Fetch ALL comments in ONE query
    all_comments = Comment.objects.filter(
        post=post
    ).select_related('author').prefetch_related('likes').order_by('created_at')
    
    # Step 2: Build tree structure in memory (O(n) complexity)
    comment_dict = {comment.id: comment for comment in all_comments}
    
    root_comments = []
    for comment in all_comments:
        comment._prefetched_replies = []
        
        if comment.parent_id is None:
            root_comments.append(comment)
        else:
            parent = comment_dict.get(comment.parent_id)
            if parent:
                parent._prefetched_replies.append(comment)
    
    # Step 3: Serialize recursively
    return CommentSerializer(root_comments, many=True).data
```

**Query Count:**
- 1 query: Fetch all comments for the post
- 1 query: Fetch all authors (via `select_related`)
- 1 query: Fetch all likes (via `prefetch_related`)
- **Total: 3 queries** regardless of tree depth ✅

**Complexity:**
- Time: O(n) where n = number of comments
- Space: O(n) for the dictionary and tree structure

**Result:**
50 comments → **3 queries**, not 51 ✅

---

## 2️⃣ The Math: Last 24h Leaderboard Query

### QuerySet Implementation

```python
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, Case, When, IntegerField, Q

def get_leaderboard():
    # Calculate 24 hours ago timestamp
    twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
    
    # Aggregate likes from the last 24 hours
    leaderboard = Like.objects.filter(
        created_at__gte=twenty_four_hours_ago
    ).values(
        'post__author', 'comment__author'
    ).annotate(
        # Post likes = 5 karma each
        post_karma=Sum(
            Case(
                When(post__isnull=False, then=5),
                default=0,
                output_field=IntegerField()
            )
        ),
        # Comment likes = 1 karma each
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
    
    # Process results to combine karma per user
    user_karma = {}
    for item in leaderboard:
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
    
    # Sort by karma and return top 5
    leaderboard_list = sorted(
        user_karma.values(),
        key=lambda x: x['karma_24h'],
        reverse=True
    )[:5]
    
    return leaderboard_list
```

### Equivalent SQL (Conceptual)

```sql
SELECT 
    COALESCE(posts.author_id, comments.author_id) AS author_id,
    SUM(CASE WHEN likes.post_id IS NOT NULL THEN 5 ELSE 1 END) AS karma_24h,
    COUNT(CASE WHEN likes.post_id IS NOT NULL THEN 1 END) AS post_likes,
    COUNT(CASE WHEN likes.comment_id IS NOT NULL THEN 1 END) AS comment_likes
FROM 
    feed_like AS likes
    LEFT JOIN feed_post AS posts ON likes.post_id = posts.id
    LEFT JOIN feed_comment AS comments ON likes.comment_id = comments.id
WHERE 
    likes.created_at >= NOW() - INTERVAL '24 HOURS'
GROUP BY 
    author_id
ORDER BY 
    karma_24h DESC
LIMIT 5;
```

### Key Design Decisions

**Why NOT store karma on the User model?**
- ❌ Would require updating user records on every like
- ❌ Stale data if likes are removed
- ❌ Can't easily calculate "last 24 hours only"

**Why calculate dynamically?**
- ✅ Always accurate (source of truth is Like records)
- ✅ Rolling 24-hour window (not daily reset)
- ✅ Can add new karma rules without migrations
- ✅ Audit trail (know exactly which likes contributed)

**Performance Considerations:**
- Indexed on `created_at` for fast time filtering
- Returns top 5 only (no need to process all users)

---

## 3️⃣ The AI Audit: Bug Found & Fixed

### The Bug: Race Condition in Like Counter

**AI-Generated Code (Buggy):**
```python
# ❌ INCORRECT - Race condition vulnerability
@api_view(['POST'])
def like_post(request, pk):
    post = Post.objects.get(id=pk)
    
    # Check if already liked
    if Like.objects.filter(user=request.user, post=post).exists():
        return Response({'error': 'Already liked'}, status=400)
    
    # Create like
    Like.objects.create(user=request.user, post=post)
    
    # Update counter (RACE CONDITION HERE!)
    post.like_count += 1
    post.save()
    
    return Response({'status': 'liked'}, status=201)
```

**Why This is Buggy:**

**Problem 1: Race Condition**
```
Time    Request A                   Request B
----    ---------                   ---------
T1      Read: like_count = 10
T2                                  Read: like_count = 10
T3      Increment: 10 + 1 = 11
T4                                  Increment: 10 + 1 = 11
T5      Write: like_count = 11
T6                                  Write: like_count = 11
Result: Two likes created but counter only increased by 1!
```

**Problem 2: Check-Then-Act Gap**
```
Time    Request A                   Request B
----    ---------                   ---------
T1      Check: No like exists ✓
T2                                  Check: No like exists ✓
T3      Create like ✓
T4                                  Create like ✓
Result: Duplicate likes created!
```

---

### The Fix: Database-Level Guarantees

**Corrected Code:**
```python
from django.db import transaction, IntegrityError

@api_view(['POST'])
def like_post(request, pk):
    post = Post.objects.get(id=pk)
    
    try:
        with transaction.atomic():
            # Atomic operation - either all succeed or all fail
            
            # Step 1: Create like (protected by unique constraint)
            Like.objects.create(user=request.user, post=post)
            
            # Step 2: Update counter atomically using F() expression
            Post.objects.filter(id=post.id).update(
                like_count=models.F('like_count') + 1
            )
            
            return Response({'status': 'liked'}, status=201)
            
    except IntegrityError:
        # Unique constraint violation - already liked
        return Response({'error': 'Already liked'}, status=400)
```

**Database Constraints (Critical!):**
```python
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, null=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, null=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            # Prevent duplicate post likes
            models.UniqueConstraint(
                fields=['user', 'post'],
                name='unique_post_like',
                condition=models.Q(post__isnull=False)
            ),
            # Prevent duplicate comment likes
            models.UniqueConstraint(
                fields=['user', 'comment'],
                name='unique_comment_like',
                condition=models.Q(comment__isnull=False)
            ),
            # Ensure like targets exactly one thing
            models.CheckConstraint(
                check=(
                    models.Q(post__isnull=False, comment__isnull=True) |
                    models.Q(post__isnull=True, comment__isnull=False)
                ),
                name='like_post_or_comment'
            ),
        ]
```

### Why The Fix Works

**1. Unique Constraint Protection:**
```
Request A: CREATE like → Success ✓
Request B: CREATE like → IntegrityError ❌
Result: Only one like created
```

**2. Atomic F() Expression:**
```python
# ✅ CORRECT - Atomic at database level
Post.objects.filter(id=post.id).update(
    like_count=models.F('like_count') + 1
)

# Translates to SQL:
# UPDATE feed_post SET like_count = like_count + 1 WHERE id = ?
# This happens atomically - no read-modify-write gap!
```

**3. Transaction Wrapper:**
```python
with transaction.atomic():
    # Either ALL operations succeed or ALL are rolled back
    create_like()
    update_counter()
    create_karma_transaction()
```

### Testing The Fix

```python
# Simulate concurrent requests
import threading

def create_like():
    try:
        like_post(user=test_user, post=test_post)
    except IntegrityError:
        pass  # Expected for duplicate

# Create 100 concurrent like attempts
threads = [threading.Thread(target=create_like) for _ in range(100)]
for t in threads:
    t.start()
for t in threads:
    t.join()

# Assert results
assert Like.objects.filter(post=test_post).count() == 1  # Only 1 like ✓
assert test_post.like_count == 1  # Counter accurate ✓
```

---

## Summary

### Key Technical Achievements

1. **Comment Tree:** 3 queries for any depth (no N+1)
2. **Leaderboard:** Dynamic calculation from transaction history (rolling 24h window)
3. **Concurrency:** Database constraints + atomic operations = no race conditions

**Result:** Production-ready code that handles edge cases correctly.

