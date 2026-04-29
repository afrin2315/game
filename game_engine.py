"""
Game Engine for AI-Powered Text Adventure
Handles world generation, game state, and mechanics
"""

import json
import re
from typing import Dict, List, Optional
from llm_client import get_llm_client, PROMPTS


class GameWorld:
    """Represents the generated game world"""
    def __init__(self):
        self.name = "The Enchanted Realm"
        self.description = "A mystical land of magic and adventure"
        self.theme = "Fantasy Adventure"
        self.locations = {
            "Mystic Grove": "A magical clearing surrounded by ancient trees",
            "Northern Glade": "Ancient stone pillars covered in glowing runes",
            "Crystal Cavern": "A cave entrance glittering with embedded gems",
            "Whispering Falls": "A magical waterfall that flows upward",
            "Ancient Temple": "A mysterious temple with doors slightly ajar"
        }
        self.current_location = "Mystic Grove"
        
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "theme": self.theme,
            "current_location": self.current_location
        }


class Player:
    """Player state and inventory"""
    def __init__(self):
        self.inventory: List[str] = []
        self.health = 100
        self.gold = 0
        self.xp = 0
        self.discoveries: List[str] = []
        
    def add_item(self, item: str) -> bool:
        if item and item not in self.inventory:
            self.inventory.append(item)
            return True
        return False
    
    def add_gold(self, amount: int):
        self.gold += amount
    
    def add_xp(self, amount: int):
        self.xp += amount
    
    def has_item(self, item: str) -> bool:
        return item.lower() in [i.lower() for i in self.inventory]
    
    def to_dict(self) -> dict:
        return {
            "inventory": self.inventory,
            "health": self.health,
            "gold": self.gold,
            "xp": self.xp,
            "discoveries": self.discoveries
        }


class GameEngine:
    """Main game engine handling all game logic"""
    
    def __init__(self):
        self.llm = get_llm_client()
        self.world = GameWorld()
        self.player = Player()
        self.history: List[Dict] = []
        self.game_started = False
        
    def start_game(self) -> str:
        """Initialize a new game with generated world"""
        self.game_started = True
        
        # Generate world using LLM
        world_response = self.llm.generate(PROMPTS["world_generation"])
        
        # Parse world info (use defaults if parsing fails)
        self.world.description = world_response
        
        # Welcome message
        welcome = f"""
🌟 **Welcome to {self.world.name}!** 🌟

{self.world.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 **Current Location:** {self.world.current_location}

🎮 **Available Commands:**
• `look` - Examine your surroundings
• `explore` - Search the area
• `go [direction]` - Move (north, south, east, west)
• `take [item]` - Pick up an item
• `inventory` - Check your items
• `talk` - Speak with nearby characters
• `fight` - Engage in combat (if enemies present)
• `help` - Show all commands

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*Type your action to begin your adventure!*
"""
        return welcome
    
    def process_action(self, action: str) -> str:
        """Process player action and return game response"""
        if not action.strip():
            return "🤔 What would you like to do?"
        
        action = action.strip().lower()
        
        # Handle special commands
        if action == "help":
            return self._show_help()
        
        if action == "inventory" or action == "inv" or action == "i":
            return self._show_inventory()
        
        if action == "look" or action == "l":
            return self._look_around()
        
        if action == "stats" or action == "status":
            return self._show_stats()
        
        # Handle movement
        if action.startswith("go "):
            return self._handle_movement(action)
        
        # Generate AI response for other actions
        return self._generate_action_response(action)
    
    def _handle_movement(self, action: str) -> str:
        """Handle go commands for movement"""
        direction = action.replace("go ", "").strip()
        
        location_map = {
            "north": "Northern Glade",
            "south": "Crystal Cavern", 
            "east": "Whispering Falls",
            "west": "Ancient Temple"
        }
        
        if direction in location_map:
            new_location = location_map[direction]
            old_location = self.world.current_location
            self.world.current_location = new_location
            
            if new_location not in self.player.discoveries:
                self.player.discoveries.append(new_location)
            
            # Get movement description from LLM
            response = self.llm.generate(f"go {direction}")
            
            return f"""
🧭 **Traveling {direction.title()}...**

{response}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 You arrived at: **{new_location}** | 🗺️ Discovered: {len(self.player.discoveries)} locations
"""
        else:
            return f"🤔 You can't go that way. Try: north, south, east, or west."
    
    def _generate_action_response(self, action: str) -> str:
        """Use LLM to generate response for player action"""
        prompt = PROMPTS["action_response"].format(
            world_name=self.world.name,
            location=self.world.current_location,
            inventory=", ".join(self.player.inventory) if self.player.inventory else "Empty",
            action=action
        )
        
        response = self.llm.generate(prompt)
        
        # Extract items, gold, and XP from response
        self._extract_rewards(action, response)
        
        # Add to history
        self.history.append({
            "action": action,
            "response": response
        })
        
        # Format response
        formatted = f"""
🎭 **Action:** *{action}*

{response}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Location: {self.world.current_location} | 🎒 Items: {len(self.player.inventory)} | ❤️ Health: {self.player.health} | ⭐ XP: {self.player.xp}
"""
        return formatted
    
    def _extract_rewards(self, action: str, response: str):
        """Extract items, gold, and XP from response"""
        response_lower = response.lower()
        
        # Extract gold
        gold_patterns = [
            r'(\d+)\s*gold\s*coins?',
            r'(\d+)\s*gold',
            r'\+(\d+)\s*gold'
        ]
        for pattern in gold_patterns:
            match = re.search(pattern, response_lower)
            if match:
                self.player.add_gold(int(match.group(1)))
                break
        
        # Extract XP
        xp_patterns = [
            r'\+(\d+)\s*xp',
            r'(\d+)\s*xp',
            r'gained:?\s*\+?(\d+)\s*xp'
        ]
        for pattern in xp_patterns:
            match = re.search(pattern, response_lower)
            if match:
                self.player.add_xp(int(match.group(1)))
                break
        
        # Extract items - look for **item** or specific keywords
        item_patterns = [
            r'\*\*([^*]+)\*\*',  # **Item Name**
            r'found:?\s*[⚔️🧪💰🗺️📜🔮✨💎🗡️🛡️]*\s*\*\*([^*]+)\*\*',
            r"You've found:?\s*[^a-zA-Z]*([A-Z][a-zA-Z\s]+)",
        ]
        
        found_items = set()
        for pattern in item_patterns:
            matches = re.findall(pattern, response)
            for match in matches:
                item = match.strip()
                # Filter out non-items
                non_items = ['action', 'looking', 'inventory', 'the', 'a', 'an', 'tips', 
                            'movement', 'exploration', 'interaction', 'status', 'commands',
                            'victory', 'triumph', 'game', 'welcome']
                if len(item) > 2 and len(item) < 50 and item.lower() not in non_items:
                    found_items.add(item)
        
        # Also do simple extraction for common item names
        common_items = [
            "Glowing Sword", "Health Potion", "Treasure Map", "Magic Scroll",
            "Silver Amulet", "Wolf Fang", "Spirit Crystal", "Spell Book",
            "Gold Coins", "Rusty Key", "Glass Orb", "Crystal Vial",
            "Sword", "Shield", "Potion", "Key", "Map", "Scroll", "Amulet",
            "Ring", "Staff", "Bow", "Dagger", "Helmet", "Armor"
        ]
        
        for item in common_items:
            if item.lower() in response_lower:
                found_items.add(item)
        
        # Add found items to inventory
        for item in found_items:
            self.player.add_item(item)
    
    def _show_help(self) -> str:
        return """
📖 **Game Commands:**

**Movement & Exploration:**
• `look` / `l` - Examine your surroundings
• `explore` - Search the area for items/secrets
• `go [direction]` - Move (north, south, east, west)

**Interaction:**
• `take [item]` - Pick up an item
• `use [item]` - Use an item from inventory
• `talk` - Speak with nearby characters
• `fight` - Engage in combat

**Status:**
• `inventory` / `i` - Check your items
• `stats` - View your character status
• `help` - Show this help menu

**Tips:** 
💡 Try combining actions: "look at the door", "take the sword"
💡 Be descriptive: "explore the dark cave carefully"
"""
    
    def _show_inventory(self) -> str:
        if not self.player.inventory:
            return """
🎒 **Inventory:** *Empty*

You haven't collected any items yet. Try exploring!
"""
        
        items_list = "\n".join([f"  • {item}" for item in self.player.inventory])
        return f"""
🎒 **Inventory:** ({len(self.player.inventory)} items)

{items_list}

💰 Gold: {self.player.gold}
⭐ XP: {self.player.xp}
"""
    
    def _show_stats(self) -> str:
        return f"""
📊 **Character Status:**

❤️ Health: {self.player.health}/100
💰 Gold: {self.player.gold}
⭐ XP: {self.player.xp}
🎒 Items: {len(self.player.inventory)}
📍 Location: {self.world.current_location}
🏆 Discoveries: {len(self.player.discoveries)}
"""
    
    def _look_around(self) -> str:
        prompt = PROMPTS["location_description"].format(
            location=self.world.current_location,
            world_context=self.world.description,
            inventory=", ".join(self.player.inventory) if self.player.inventory else "Empty"
        )
        
        description = self.llm.generate(prompt)
        
        # Extract any items mentioned in the look response
        self._extract_rewards("look", description)
        
        return f"""
👁️ **Looking around {self.world.current_location}...**

{description}
"""
    
    def get_game_state(self) -> dict:
        """Get current game state for UI display"""
        return {
            "world": self.world.to_dict(),
            "player": self.player.to_dict(),
            "history_length": len(self.history),
            "game_started": self.game_started
        }


# Singleton game instance
_game = None

def get_game() -> GameEngine:
    global _game
    if _game is None:
        _game = GameEngine()
    return _game

def reset_game() -> GameEngine:
    global _game
    _game = GameEngine()
    return _game
