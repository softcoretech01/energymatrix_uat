from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from app.database import get_connection
import pymysql
from app.utils.auth_utils import create_access_token, get_current_user
from app.utils.logger import log_session_login, log_session_logout, log_login, log_logout
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str
    password: str
    browser_info: Optional[str] = None


class LogoutRequest(BaseModel):
    session_id: Optional[int] = None
    token: Optional[str] = None


@router.post("/login")
def login(data: LoginRequest, request: Request):
    conn = get_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    # 1. Fetch user and role_id
    cursor.execute(
        "SELECT id, name, email, password, role_id FROM users WHERE name=%s",
        (data.username,)
    )
    user = cursor.fetchone()

    ip = request.client.host if request.client else None

    if not user:
        cursor.close()
        conn.close()
        # Log failed login attempt
        log_login(user_id=0, user_name=data.username, ip_address=ip, browser_info=data.browser_info, status="FAILED", fail_reason="Invalid username")
        raise HTTPException(status_code=401, detail="Invalid username")

    if data.password != user["password"]:
        cursor.close()
        conn.close()
        # Log failed login attempt
        log_login(user_id=user["id"], user_name=user["name"], ip_address=ip, browser_info=data.browser_info, status="FAILED", fail_reason="Invalid password")
        raise HTTPException(status_code=401, detail="Invalid password")

    # 2. Fetch role rights/permissions
    cursor.execute(
        """
        SELECT rr.screen_id, sm.screen_name, sm.module_name, 
               rr.can_read, rr.can_write, rr.can_edit, rr.can_delete
        FROM role_rights rr
        JOIN screen_master sm ON rr.screen_id = sm.id
        WHERE rr.role_id = %s
        """,
        (user["role_id"],)
    )
    rights = cursor.fetchall()

    cursor.close()
    conn.close()

    token = create_access_token(user["id"], user["name"], user["role_id"])

    # Log successful login event
    log_login(user_id=user["id"], user_name=user["name"], ip_address=ip, browser_info=data.browser_info, status="SUCCESS")

    # Record login in user_sessions table
    session_id = log_session_login(
        user_id=user["id"],
        user_name=user["name"],
        ip_address=ip,
        browser_info=data.browser_info
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "session_id": session_id,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role_id": user["role_id"],
            "rights": rights
        }
    }


@router.post("/logout")
def logout(request: Request, data: LogoutRequest = None, user: dict = Depends(get_current_user)):
    """
    Logout endpoint – marks session as LOGGED_OUT and records logout event.
    """
    ip = request.client.host if request.client else None
    
    if data and data.session_id:
        log_session_logout(session_id=data.session_id)
    
    # Log individual logout event
    log_logout(user_id=user["id"], user_name=user["username"], ip_address=ip)

    return {"message": "Logout successful"}
