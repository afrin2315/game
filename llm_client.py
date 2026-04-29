"""
LLM Client for AI-Powered Game
Uses Google Gemini API for story generation with robust offline fallback
"""

import os
import json
import re
import random
from dotenv import load_dotenv

load_dotenv()

# Try to import Gemini
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

class LLMClient:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model = None
        self.use_fallback = True
        
        if GEMINI_AVAILABLE and self.api_key and self.api_key != "your_api_key_here":
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                # Test the connection
                test = self.model.generate_content("Say 'ok'")
                self.use_fallback = False
                print("✅ Gemini API connected successfully!")
            except Exception as e:
                print(f"⚠️ Gemini API failed: {e}")
                print("📖 Running in DEMO mode with rich fallback responses")
                self.model = None
        else:
            print("📖 Running in DEMO mode (no API key)")
    
    def generate(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate text using LLM or fallback"""
        if self.model and not self.use_fallback:
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        max_output_tokens=max_tokens,
                        temperature=0.8
                    )
                )
                return response.text
            except Exception as e:
                print(f"LLM Error: {e}")
                return self._fallback_response(prompt)
        return self._fallback_response(prompt)
    
    def generate_json(self, prompt: str) -> dict:
        """Generate structured JSON output from LLM"""
        if self.model and not self.use_fallback:
            json_prompt = f"""{prompt}

IMPORTANT: Respond ONLY with valid JSON, no other text."""
            
            response = self.generate(json_prompt)
            
            try:
                json_match = re.search(r'\{[\s\S]*\}', response)
                if json_match:
                    return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        return {}
    
    def _fallback_response(self, prompt: str) -> str:
        """Rich fallback responses for demo mode"""
        prompt_lower = prompt.lower()
        
        # World generation is special
        if "world" in prompt_lower and "generate" in prompt_lower:
            return random.choice(WORLD_DESCRIPTIONS)
            
        # Determine current location from prompt context
        location = "Mystic Grove" # Default
        if "northern glade" in prompt_lower:
            location = "Northern Glade"
        elif "crystal cavern" in prompt_lower:
            location = "Crystal Cavern"
        elif "whispering falls" in prompt_lower:
            location = "Whispering Falls"
        elif "ancient temple" in prompt_lower:
            location = "Ancient Temple"
            
        # Prioritize specific combat/explore logic based on location
        if "fight" in prompt_lower or "attack" in prompt_lower:
            return self._get_combat_response(location)
            
        if "explore" in prompt_lower or "search" in prompt_lower:
            return self._get_explore_response(location)
            
        # Handle "pick" or "take" specifically
        if "take" in prompt_lower or "pick" in prompt_lower or "grab" in prompt_lower:
            return self._get_take_response(location, prompt_lower)

        # Handle movement description requests
        if "go north" in prompt_lower:
            return "🧭 You head north through winding paths. The forest thickens around you, and you enter the **Northern Glade**. Ancient stone pillars stand here, covered in glowing runes."
        if "go south" in prompt_lower:
            return "🧭 You travel south along a babbling brook. The trees part to reveal the **Crystal Cavern** entrance, its mouth glittering with embedded gems."
        if "go east" in prompt_lower:
            return "🧭 You venture east into denser woodland. You arrive at the **Whispering Falls**, where a magical waterfall flows upward into the sky."
        if "go west" in prompt_lower:
            return "🧭 You walk west toward the setting sun. Before you lies an **Ancient Temple**, its doors slightly ajar, beckoning you inside."

        # Location descriptions (look)
        if "location" in prompt_lower or "look" in prompt_lower or "describe" in prompt_lower:
            return self._get_location_description(location)
        
        if "talk" in prompt_lower or "speak" in prompt_lower:
            return random.choice(TALK_RESPONSES)
            
        # Generic default uses location name to feel specific
        return f"✨ You pause in the **{location}** to consider your next move. The magic of Aethoria surrounds you."

    def _get_location_description(self, location: str) -> str:
        if location == "Mystic Grove":
            return random.choice(MYSTIC_GROVE_DESCRIPTIONS)
        elif location == "Crystal Cavern":
            return """💎 You stand inside the **Crystal Cavern**. 
            
Huge amethyst and quartz crystals jut from the walls, glowing with an inner light. 
The air is cool and damp. A pool of luminescent water sits at the center.

To the **north** is the exit back to the forest.
Deeper in, you see shadows moving among the crystals."""
        elif location == "Northern Glade":
            return """🌲 The **Northern Glade** is quiet and ancient.
            
Stone pillars rise from the mist, covered in moss and glowing runes.
Wildflowers bloom in unnatural colors here.

To the **south** lies the Mystic Grove.
An altar sits in the center of the pillars."""
        elif location == "Whispering Falls":
            return """🌊 The **Whispering Falls** defy gravity!
            
Water flows upward into the sky, shimmering like liquid starlight.
The mist here whispers secrets of the ancient world.
To the **west** is the way back to the Grove."""
        elif location == "Ancient Temple":
            return """🏛️ The **Ancient Temple** looms before you.
            
Stone guardians flank the door, their eyes following your movements.
Dust motes dance in shafts of light.
To the **east** is the forest path."""
        else:
            return f"You are at **{location}**. It is a place of mystery and magic."

    def _get_explore_response(self, location: str) -> str:
        if location == "Crystal Cavern":
            return """🔎 You search among the crystals...
            
You find a loose **Gemstone** on the floor! It pulses with faint light.
Hidden behind a stalagmite, you also spot a **Miner's Pickaxe**.

You've found: 💎 **Gemstone** and ⛏️ **Miner's Pickaxe**"""
        elif location == "Northern Glade":
            return """🔎 You examine the ancient runes...
            
Resting on the central altar is a **Strange Rune**.
You also find some **magical herbs** growing at the base of a pillar.

You've found: 🗿 **Strange Rune** and 🌿 **Magical Herbs**"""
        elif location == "Mystic Grove":
             return """🔎 You search the area thoroughly...

After pushing aside some enchanted ferns, you discover a **glowing sword** 
embedded in a moss-covered stone!

You've found: ⚔️ **Glowing Sword**"""
        else:
            return """🔎 You explore the area but find only dust and shadows.
            
Wait! You spot a small **Gold Coin** dropped by a previous traveler.
You've found: 💰 **Gold Coin**"""

    def _get_combat_response(self, location: str) -> str:
        if location == "Crystal Cavern":
            return """⚔️ A **Crystal Golem** emerges from the wall!
            
It swings a heavy fist, but you roll out of the way!
*CRASH!* It hits the ground, exposing a weak point.
*STRIKE!* You hit the core with a resonant clang!

The Golem shatters into dust.
You've gained: +50 XP and found **Crystal Shard**!"""
        elif location == "Northern Glade":
             return """⚔️ An **Arcane Wisp** crackles with energy!
             
It shoots lightning at you! *ZAP!*
You dodge and counter-attack.
The wisp dissipates into pure mana.
             
You've gained: +30 XP and found **Star Dust**!"""
        else:
            return """⚔️ A **Shadow Wolf** emerges from the darkness!

You raise your weapon and engage in fierce combat.
*SLASH!* Your strike connects! 
*VICTORY!* The shadow wolf dissolves into mist!

You've gained: +25 XP, found **Wolf Fang** as a trophy!"""

    def _get_take_response(self, location: str, prompt_lower: str) -> str:
        # Check for location specific items
        if location == "Crystal Cavern":
            if "gem" in prompt_lower or "stone" in prompt_lower:
                return "💎 You pry the **Gemstone** loose. It's warm to the touch. *Added to inventory!*"
            if "pickaxe" in prompt_lower:
                return "⛏️ You lift the heavy **Miner's Pickaxe**. Solid. *Added to inventory!*"

        if location == "Northern Glade":
            if "rune" in prompt_lower:
                return "🗿 You carefully lift the **Strange Rune**. It vibrates with power. *Added to inventory!*"
            if "herb" in prompt_lower:
                return "🌿 You harvest the **Magical Herbs**. They smell like cinnamon. *Added to inventory!*"

        # Default catch-all
        return """✋ You pick up the item.

It feels heavy and valuable.
*Item added to your inventory!*"""

# Rich fallback response pools
WORLD_DESCRIPTIONS = [
    """Welcome to the **Enchanted Realm of Aethoria**! 🌟

A mystical land where magic flows through ancient forests and forgotten ruins 
hold secrets of a lost civilization. The air shimmers with ethereal energy, 
and adventure awaits around every corner.

You stand in the **Mystic Grove**, a clearing surrounded by towering trees 
whose leaves glow with soft blue light. A stone path leads in four directions.""",
]

MYSTIC_GROVE_DESCRIPTIONS = [
    """🔍 The Mystic Grove stretches before you in ethereal beauty. 

Towering ancient oaks surround the clearing, their bark inscribed with faintly 
glowing runes. A small **crystal fountain** bubbles in the center.

You notice a **rusty key** half-buried near the fountain's base.
Paths lead North, South, East, and West.""",
    
    """🔍 You are in the heart of the Mystic Grove.
    
Fireflies dance in the air, spelling out arcane secrets.
A **wooden chest** sits beneath a willow tree.
    
The path to the **South** looks rocky, while the **North** path is overgrown.""",
]

TALK_RESPONSES = [
    """💬 A shimmering figure materializes before you...

"Greetings, brave traveler," speaks the **Forest Spirit**. "I have waited 
long for one worthy of the ancient quest."

She offers you a **Spirit Crystal** as a token of her favor.""",
]

# Prompt templates (RESTORED)
PROMPTS = {
    "world_generation": """Create a fantasy game world with the following structure:
- World Name
- Description (2-3 sentences)
- Theme (e.g., dark fantasy, magical adventure, etc.)
- Starting location name and description

Make it immersive and exciting for a text adventure game.""",

    "location_description": """The player is at: {location}
World context: {world_context}
Player inventory: {inventory}

Describe this location in 2-3 vivid sentences. Include:
- Visual details
- Atmosphere
- Any notable objects or paths
- Hints about possible actions""",

    "action_response": """You are the game master for a fantasy text adventure.

World: {world_name}
Current Location: {location}
Player inventory: {inventory}
Player action: {action}

Respond to the player's action with:
1. A vivid description of what happens (2-3 sentences)
2. The result of their action
3. What they see/discover

Keep it engaging and immersive. If they find an item, describe it.""",

    "extract_items": """Player performed action: {action}
Game response: {response}

Extract any NEW items the player obtained. Return JSON:
{{"items": ["item1", "item2"], "found_items": true/false}}

If no new items were found, return: {{"items": [], "found_items": false}}"""
}

# Singleton instance
_client = None

def get_llm_client() -> LLMClient:
    global _client
    if _client is None:
        _client = LLMClient()
    return _client
