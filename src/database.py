"""SQLite database for user persistence, progress tracking, and projects."""
import sqlite3
import json
from pathlib import Path
from typing import Dict, Optional, List, Any
from datetime import datetime

# Database file path
DB_DIR = Path(__file__).parent.parent / "data"
DB_FILE = DB_DIR / "planlab.db"

# Ensure data directory exists
DB_DIR.mkdir(exist_ok=True)


def get_connection():
    """Get database connection."""
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database with tables."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            hashed_password TEXT NOT NULL,
            disabled BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # User progress table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            lesson_id TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            completed_at TIMESTAMP,
            time_spent_seconds INTEGER DEFAULT 0,
            UNIQUE(username, lesson_id),
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
    ''')
    
    # User statistics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_statistics (
            username TEXT PRIMARY KEY,
            total_plans_generated INTEGER DEFAULT 0,
            total_problems_solved INTEGER DEFAULT 0,
            total_nodes_expanded INTEGER DEFAULT 0,
            favorite_algorithm TEXT,
            last_active TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
    ''')
    
    # User projects table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            project_name TEXT NOT NULL,
            project_type TEXT NOT NULL,  -- 'domain' or 'problem'
            folder_path TEXT DEFAULT '',
            content TEXT NOT NULL,
            is_shared BOOLEAN DEFAULT 0,
            share_id TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
    ''')
    
    # Algorithm usage tracking
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS algorithm_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            algorithm TEXT NOT NULL,
            heuristic TEXT,
            problem_name TEXT,
            nodes_expanded INTEGER,
            plan_length INTEGER,
            search_time_ms REAL,
            used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()


# ==================== USER FUNCTIONS ====================

def get_user(username: str) -> Optional[Dict]:
    """Get a user by username."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_user_by_email(email: str) -> Optional[Dict]:
    """Get a user by email."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def create_user(username: str, email: str, hashed_password: str, full_name: str = None) -> bool:
    """Create a new user."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, full_name, hashed_password)
            VALUES (?, ?, ?, ?)
        ''', (username, email, full_name, hashed_password))
        
        # Initialize user statistics
        cursor.execute('''
            INSERT INTO user_statistics (username) VALUES (?)
        ''', (username,))
        
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def update_last_login(username: str):
    """Update user's last login time."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE username = ?
    ''', (username,))
    conn.commit()
    conn.close()


def update_user(username: str, **kwargs) -> bool:
    """Update user fields."""
    allowed_fields = ['email', 'full_name', 'hashed_password', 'disabled']
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
    
    if not updates:
        return False
    
    conn = get_connection()
    cursor = conn.cursor()
    
    set_clause = ', '.join(f'{k} = ?' for k in updates.keys())
    values = list(updates.values()) + [username]
    
    try:
        cursor.execute(f'''
            UPDATE users SET {set_clause} WHERE username = ?
        ''', values)
        conn.commit()
        return cursor.rowcount > 0
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def delete_user(username: str) -> bool:
    """Delete a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM users WHERE username = ?', (username,))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success


# ==================== PROGRESS FUNCTIONS ====================

def get_user_progress(username: str) -> List[Dict]:
    """Get all lesson progress for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM user_progress WHERE username = ? ORDER BY completed_at DESC
    ''', (username,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update_lesson_progress(username: str, lesson_id: str, completed: bool = True, time_spent: int = 0):
    """Update or create lesson progress."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO user_progress (username, lesson_id, completed, completed_at, time_spent_seconds)
        VALUES (?, ?, ?, CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE NULL END, ?)
        ON CONFLICT(username, lesson_id) DO UPDATE SET
            completed = excluded.completed,
            completed_at = CASE WHEN excluded.completed THEN CURRENT_TIMESTAMP ELSE completed_at END,
            time_spent_seconds = user_progress.time_spent_seconds + excluded.time_spent_seconds
    ''', (username, lesson_id, completed, completed, time_spent))
    
    conn.commit()
    conn.close()


def get_completed_lessons_count(username: str) -> int:
    """Get number of completed lessons."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT COUNT(*) FROM user_progress WHERE username = ? AND completed = 1
    ''', (username,))
    count = cursor.fetchone()[0]
    conn.close()
    return count


# ==================== STATISTICS FUNCTIONS ====================

def get_user_statistics(username: str) -> Optional[Dict]:
    """Get user statistics."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user_statistics WHERE username = ?', (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def increment_plans_generated(username: str):
    """Increment plans generated counter."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE user_statistics 
        SET total_plans_generated = total_plans_generated + 1,
            last_active = CURRENT_TIMESTAMP
        WHERE username = ?
    ''', (username,))
    conn.commit()
    conn.close()


def increment_problems_solved(username: str, nodes_expanded: int = 0):
    """Increment problems solved counter."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE user_statistics 
        SET total_problems_solved = total_problems_solved + 1,
            total_nodes_expanded = total_nodes_expanded + ?,
            last_active = CURRENT_TIMESTAMP
        WHERE username = ?
    ''', (nodes_expanded, username))
    conn.commit()
    conn.close()


def update_favorite_algorithm(username: str, algorithm: str):
    """Update user's favorite algorithm."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE user_statistics SET favorite_algorithm = ? WHERE username = ?
    ''', (algorithm, username))
    conn.commit()
    conn.close()


# ==================== ALGORITHM USAGE FUNCTIONS ====================

def log_algorithm_usage(username: str, algorithm: str, heuristic: str, 
                        problem_name: str, nodes_expanded: int, 
                        plan_length: int, search_time_ms: float):
    """Log algorithm usage."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO algorithm_usage 
        (username, algorithm, heuristic, problem_name, nodes_expanded, plan_length, search_time_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (username, algorithm, heuristic, problem_name, nodes_expanded, plan_length, search_time_ms))
    conn.commit()
    conn.close()


def get_algorithm_usage_history(username: str, limit: int = 10) -> List[Dict]:
    """Get recent algorithm usage."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM algorithm_usage 
        WHERE username = ? 
        ORDER BY used_at DESC 
        LIMIT ?
    ''', (username, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_most_used_algorithm(username: str) -> Optional[str]:
    """Get user's most used algorithm."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT algorithm, COUNT(*) as count 
        FROM algorithm_usage 
        WHERE username = ? 
        GROUP BY algorithm 
        ORDER BY count DESC 
        LIMIT 1
    ''', (username,))
    row = cursor.fetchone()
    conn.close()
    return row['algorithm'] if row else None


# ==================== PROJECT FUNCTIONS ====================

def create_project(username: str, project_name: str, project_type: str, 
                   content: str, folder_path: str = '') -> Optional[int]:
    """Create a new project."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO user_projects (username, project_name, project_type, folder_path, content)
            VALUES (?, ?, ?, ?, ?)
        ''', (username, project_name, project_type, folder_path, content))
        
        project_id = cursor.lastrowid
        conn.commit()
        return project_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()


def get_user_projects(username: str, folder_path: str = '') -> List[Dict]:
    """Get all projects for a user in a folder."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM user_projects 
        WHERE username = ? AND folder_path = ?
        ORDER BY updated_at DESC
    ''', (username, folder_path))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_project(project_id: int) -> Optional[Dict]:
    """Get a specific project."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM user_projects WHERE id = ?', (project_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_project(project_id: int, content: str, project_name: str = None) -> bool:
    """Update a project."""
    conn = get_connection()
    cursor = conn.cursor()
    
    if project_name:
        cursor.execute('''
            UPDATE user_projects 
            SET content = ?, project_name = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (content, project_name, project_id))
    else:
        cursor.execute('''
            UPDATE user_projects 
            SET content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (content, project_id))
    
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success


def delete_project(project_id: int) -> bool:
    """Delete a project."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM user_projects WHERE id = ?', (project_id,))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success


def share_project(project_id: int, share_id: str) -> bool:
    """Make a project shareable."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE user_projects 
        SET is_shared = 1, share_id = ?
        WHERE id = ?
    ''', (share_id, project_id))
    success = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return success


def get_shared_project(share_id: str) -> Optional[Dict]:
    """Get a shared project by share ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM user_projects 
        WHERE share_id = ? AND is_shared = 1
    ''', (share_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_users_count() -> int:
    """Get total user count."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM users')
    count = cursor.fetchone()[0]
    conn.close()
    return count


# Initialize database on module import
init_db()
