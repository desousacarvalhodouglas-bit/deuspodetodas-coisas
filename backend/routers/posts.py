from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from models import PostCreate, PostResponse, InteractionCreate
from auth_utils import get_current_user_id, get_optional_user_id

router = APIRouter(prefix="/posts", tags=["posts"])

def get_db():
    """Get database instance. Must be called after env vars are loaded."""
    import os
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ['DB_NAME']]

@router.get("", response_model=List[PostResponse])
async def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    user_id: Optional[str] = Depends(get_optional_user_id)
):
    db = get_db()
    posts = await db.posts.find().sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Get user interactions for current user
    user_likes = set()
    user_recommends = set()
    if user_id:
        likes = await db.interactions.find({
            "user_id": ObjectId(user_id),
            "type": "like"
        }).to_list(1000)
        user_likes = {str(like["post_id"]) for like in likes}
        
        recommends = await db.interactions.find({
            "user_id": ObjectId(user_id),
            "type": "recommend"
        }).to_list(1000)
        user_recommends = {str(rec["post_id"]) for rec in recommends}
    
    result = []
    for post in posts:
        # Get user info
        user = await db.users.find_one({"_id": post["user_id"]})
        
        post_id = str(post["_id"])
        result.append(PostResponse(
            _id=post_id,
            user_id=str(post["user_id"]),
            user_name=user["name"] if user else "Usuário",
            user_avatar=user.get("avatar") if user else None,
            description=post["description"],
            location=post["location"],
            budget=post["budget"],
            images=post.get("images", []),
            videos=post.get("videos", []),
            likes=post.get("likes", 0),
            recommends=post.get("recommends", 0),
            responses=post.get("responses", 0),
            created_at=post["created_at"],
            user_liked=post_id in user_likes,
            user_recommended=post_id in user_recommends
        ))
    
    return result

@router.post("", response_model=PostResponse)
async def create_post(
    post_data: PostCreate,
    user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    # Get user info
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user has reached free post limit
    is_premium = user.get("isPremium", False)
    posts_count = user.get("posts_count", 0)
    
    if not is_premium and posts_count >= 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Limite de posts gratuitos atingido. Assine o plano Premium para continuar postando."
        )
    
    post_dict = post_data.model_dump()
    post_dict["user_id"] = ObjectId(user_id)
    post_dict["likes"] = 0
    post_dict["recommends"] = 0
    post_dict["responses"] = 0
    post_dict["created_at"] = datetime.utcnow()
    post_dict["updated_at"] = datetime.utcnow()
    
    result = await db.posts.insert_one(post_dict)
    
    # Increment user's post count
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"posts_count": 1}}
    )
    
    created_post = await db.posts.find_one({"_id": result.inserted_id})
    
    return PostResponse(
        _id=str(created_post["_id"]),
        user_id=str(created_post["user_id"]),
        user_name=user["name"],
        user_avatar=user.get("avatar"),
        description=created_post["description"],
        location=created_post["location"],
        budget=created_post["budget"],
        images=created_post.get("images", []),
        videos=created_post.get("videos", []),
        likes=created_post["likes"],
        recommends=created_post["recommends"],
        responses=created_post["responses"],
        created_at=created_post["created_at"],
        user_liked=False,
        user_recommended=False
    )

@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    user_id: Optional[str] = Depends(get_optional_user_id)
):
    db = get_db()
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    user = await db.users.find_one({"_id": post["user_id"]})
    
    # Check user interactions
    user_liked = False
    user_recommended = False
    if user_id:
        like = await db.interactions.find_one({
            "post_id": ObjectId(post_id),
            "user_id": ObjectId(user_id),
            "type": "like"
        })
        user_liked = like is not None
        
        recommend = await db.interactions.find_one({
            "post_id": ObjectId(post_id),
            "user_id": ObjectId(user_id),
            "type": "recommend"
        })
        user_recommended = recommend is not None
    
    return PostResponse(
        _id=str(post["_id"]),
        user_id=str(post["user_id"]),
        user_name=user["name"] if user else "Usuário",
        user_avatar=user.get("avatar") if user else None,
        description=post["description"],
        location=post["location"],
        budget=post["budget"],
        images=post.get("images", []),
        videos=post.get("videos", []),
        likes=post.get("likes", 0),
        recommends=post.get("recommends", 0),
        responses=post.get("responses", 0),
        created_at=post["created_at"],
        user_liked=user_liked,
        user_recommended=user_recommended
    )

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if str(post["user_id"]) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )
    
    await db.posts.delete_one({"_id": ObjectId(post_id)})
    await db.interactions.delete_many({"post_id": ObjectId(post_id)})
    
    return {"message": "Post deleted successfully"}

@router.post("/{post_id}/like")
async def toggle_like(
    post_id: str,
    user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already liked
    existing = await db.interactions.find_one({
        "post_id": ObjectId(post_id),
        "user_id": ObjectId(user_id),
        "type": "like"
    })
    
    if existing:
        # Unlike
        await db.interactions.delete_one({"_id": existing["_id"]})
        await db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"likes": -1}}
        )
        return {"liked": False, "likes": max(0, post.get("likes", 1) - 1)}
    else:
        # Like
        await db.interactions.insert_one({
            "post_id": ObjectId(post_id),
            "user_id": ObjectId(user_id),
            "type": "like",
            "created_at": datetime.utcnow()
        })
        await db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"likes": 1}}
        )
        return {"liked": True, "likes": post.get("likes", 0) + 1}

@router.post("/{post_id}/recommend")
async def toggle_recommend(
    post_id: str,
    user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    existing = await db.interactions.find_one({
        "post_id": ObjectId(post_id),
        "user_id": ObjectId(user_id),
        "type": "recommend"
    })
    
    if existing:
        # Unrecommend
        await db.interactions.delete_one({"_id": existing["_id"]})
        await db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"recommends": -1}}
        )
        return {"recommended": False, "recommends": max(0, post.get("recommends", 1) - 1)}
    else:
        # Recommend
        await db.interactions.insert_one({
            "post_id": ObjectId(post_id),
            "user_id": ObjectId(user_id),
            "type": "recommend",
            "created_at": datetime.utcnow()
        })
        await db.posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$inc": {"recommends": 1}}
        )
        return {"recommended": True, "recommends": post.get("recommends", 0) + 1}

@router.post("/{post_id}/respond")
async def respond_to_post(
    post_id: str,
    interaction: InteractionCreate,
    user_id: str = Depends(get_current_user_id)
):
    db = get_db()
    post = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    await db.interactions.insert_one({
        "post_id": ObjectId(post_id),
        "user_id": ObjectId(user_id),
        "type": "respond",
        "response_text": interaction.response_text,
        "created_at": datetime.utcnow()
    })
    
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$inc": {"responses": 1}}
    )
    
    return {"message": "Response submitted", "responses": post.get("responses", 0) + 1}

@router.get("/{post_id}/responses")
async def get_responses(
    post_id: str,
    user_id: Optional[str] = Depends(get_optional_user_id)
):
    db = get_db()
    responses = await db.interactions.find({
        "post_id": ObjectId(post_id),
        "type": "respond"
    }).sort("created_at", -1).to_list(100)
    
    result = []
    for response in responses:
        user = await db.users.find_one({"_id": response["user_id"]})
        result.append({
            "id": str(response["_id"]),
            "user_name": user["name"] if user else "Usuário",
            "user_avatar": user.get("avatar") if user else None,
            "text": response.get("response_text", ""),
            "created_at": response["created_at"]
        })
    
    return result
