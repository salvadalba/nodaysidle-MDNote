use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    NotFound(String),
    SqliteError(String),
    IoError(String),
    LockError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            AppError::SqliteError(msg) => write!(f, "Database Error: {}", msg),
            AppError::IoError(msg) => write!(f, "IO Error: {}", msg),
            AppError::LockError(msg) => write!(f, "Lock Error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::SqliteError(err.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
