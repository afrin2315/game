"""
Safety & Moderation Module
Lightweight content filtering for AI-powered game
(Inspired by Llama Guard concepts from the course)
"""

import re
from typing import Tuple, List

# Blocked content categories (simplified version of Llama Guard approach)
BLOCKED_PATTERNS = [
    # Violence against real people/groups
    r'\b(kill|murder|harm)\s+(real|actual)\s+people\b',
    # Personal information requests
    r'\b(social security|ssn|credit card|password)\b',
    # Illegal activities
    r'\b(how to make|instructions for)\s+(bomb|weapon|drug)\b',
]

# Warning patterns (content that should be softened)
WARNING_PATTERNS = [
    r'\b(extremely violent|gore|torture)\b',
    r'\b(hate speech|discrimination)\b',
]

# Safe replacement responses
SAFE_RESPONSES = {
    "blocked": "⚠️ I can't process that request. Let's keep the adventure fun and safe! Try a different action.",
    "warning": "🎮 Let's keep the game family-friendly. Here's what happens instead..."
}


class ContentModerator:
    """Moderates input and output content for safety"""
    
    def __init__(self):
        self.blocked_patterns = [re.compile(p, re.IGNORECASE) for p in BLOCKED_PATTERNS]
        self.warning_patterns = [re.compile(p, re.IGNORECASE) for p in WARNING_PATTERNS]
    
    def check_input(self, text: str) -> Tuple[bool, str]:
        """
        Check user input for safety
        Returns: (is_safe, message)
        """
        if not text or not text.strip():
            return True, ""
        
        # Check for blocked patterns
        for pattern in self.blocked_patterns:
            if pattern.search(text):
                return False, SAFE_RESPONSES["blocked"]
        
        # Check for warning patterns
        for pattern in self.warning_patterns:
            if pattern.search(text):
                return True, SAFE_RESPONSES["warning"]
        
        return True, ""
    
    def check_output(self, text: str) -> str:
        """
        Check and clean AI output
        Returns cleaned text
        """
        if not text:
            return text
        
        cleaned = text
        
        # Remove any accidentally generated harmful content
        for pattern in self.blocked_patterns:
            cleaned = pattern.sub("[content filtered]", cleaned)
        
        return cleaned
    
    def sanitize_input(self, text: str) -> str:
        """Remove potentially harmful characters/injections"""
        if not text:
            return ""
        
        # Basic sanitization
        sanitized = text.strip()
        
        # Remove potential prompt injections
        injection_patterns = [
            r'ignore previous instructions',
            r'disregard all prior',
            r'forget everything',
            r'new instructions:',
        ]
        
        for pattern in injection_patterns:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
        
        # Limit length
        max_length = 500
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length] + "..."
        
        return sanitized


# Game-specific content policies
class GameContentPolicy:
    """
    Custom content policy for the game
    (Inspired by course's custom Llama Guard policies)
    """
    
    # Allowed game actions
    ALLOWED_ACTIONS = [
        "explore", "look", "examine", "search",
        "go", "walk", "run", "move", "travel",
        "take", "pick up", "grab", "collect",
        "use", "activate", "open", "close",
        "talk", "speak", "ask", "greet",
        "fight", "attack", "defend", "flee",
        "inventory", "stats", "help", "save"
    ]
    
    # Game themes to encourage
    ENCOURAGED_THEMES = [
        "adventure", "exploration", "puzzle solving",
        "friendship", "courage", "discovery",
        "magic", "mystery", "heroism"
    ]
    
    @classmethod
    def is_valid_game_action(cls, action: str) -> bool:
        """Check if action is a valid game action"""
        action_lower = action.lower()
        return any(allowed in action_lower for allowed in cls.ALLOWED_ACTIONS)
    
    @classmethod
    def get_action_hint(cls, action: str) -> str:
        """Provide helpful hints for unclear actions"""
        action_lower = action.lower()
        
        if not action_lower:
            return "Try typing 'help' to see available commands!"
        
        # Suggest similar valid actions
        suggestions = []
        for allowed in cls.ALLOWED_ACTIONS:
            if allowed[0] == action_lower[0]:
                suggestions.append(allowed)
        
        if suggestions:
            return f"Did you mean: {', '.join(suggestions[:3])}?"
        
        return "Try 'explore', 'look', or 'help' to learn more about your options."


# Singleton instance
_moderator = None

def get_moderator() -> ContentModerator:
    global _moderator
    if _moderator is None:
        _moderator = ContentModerator()
    return _moderator
