"""utils/file_upload.py — Save uploaded files to disk."""
from __future__ import annotations
import os
import uuid
import shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_MB = 10


def _upload_dir(subfolder: str) -> Path:
    p = Path(settings.UPLOAD_DIR) / subfolder
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_upload(file: UploadFile, subfolder: str = "general") -> str:
    """Save an uploaded file and return its relative URL path."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}",
        )

    ext = Path(file.filename or "file").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = _upload_dir(subfolder) / filename

    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/uploads/{subfolder}/{filename}"


def delete_upload(url_path: str) -> None:
    """Delete a previously saved upload given its URL path."""
    relative = url_path.lstrip("/")
    full = Path(settings.UPLOAD_DIR).parent / relative
    if full.exists():
        full.unlink(missing_ok=True)
