"""
AI-Powered Text Adventure Game
A demo showcasing LLM-based game development concepts:
- Hierarchical Content Generation
- Interactive AI Applications  
- Moderation & Safety
- Game Mechanics with Tool Calling

Built with Gradio for the UI
"""

import gradio as gr
from game_engine import get_game, reset_game
from safety import get_moderator

# Game instance
game = get_game()
moderator = get_moderator()

def process_game_input(message: str, history: list):
    """Process user input and return game response"""
    if not message or not message.strip():
        return history, get_status_display()
    
    # Check content safety
    is_safe, safety_msg = moderator.check_input(message)
    if not is_safe:
        return history + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": safety_msg}
        ], get_status_display()
    
    # Sanitize input
    clean_input = moderator.sanitize_input(message)
    
    # Process action
    response = game.process_action(clean_input)
    
    # Check output safety
    safe_response = moderator.check_output(response)
    
    # Add messages
    new_history = history + [
        {"role": "user", "content": message},
        {"role": "assistant", "content": safe_response}
    ]
    
    return new_history, get_status_display()

def start_new_game():
    """Start a new game"""
    global game
    game = reset_game()
    welcome = game.start_game()
    return [{"role": "assistant", "content": welcome}], get_status_display()

def get_status_display() -> str:
    """Get formatted game status for sidebar"""
    state = game.get_game_state()
    
    world = state["world"]
    player = state["player"]
    
    inventory_str = "\n".join([f"• {item}" for item in player["inventory"]]) if player["inventory"] else "Empty"
    
    status = f"""
## 🌍 World
**{world['name']}**
*{world['theme']}*

---

## 📍 Location
**{world['current_location']}**

---

## 🎒 Inventory
{inventory_str}

---

## 📊 Stats
❤️ Health: {player['health']}/100
💰 Gold: {player['gold']}
🏆 Discoveries: {len(player['discoveries'])}
"""
    return status

def show_help(history):
    """Show help message"""
    help_text = game._show_help()
    return history + [{"role": "assistant", "content": help_text}]

# Build the Gradio Interface
with gr.Blocks(
    title="AI-Powered Text Adventure"
) as demo:
    
    # Header
    gr.Markdown("""
    # 🎮 AI-Powered Text Adventure
    ### *Experience dynamic storytelling powered by Large Language Models*
    
    ---
    """)
    
    with gr.Row():
        # Main game area (left side)
        with gr.Column(scale=3):
            chatbot = gr.Chatbot(
                label="Game World",
                height=500,
                show_label=False
            )
            
            with gr.Row():
                user_input = gr.Textbox(
                    placeholder="What do you want to do? (e.g., 'explore', 'look around', 'inventory')",
                    label="Your Action",
                    scale=4,
                    show_label=False
                )
                submit_btn = gr.Button("⚔️ Act", variant="primary", scale=1)
            
            with gr.Row():
                new_game_btn = gr.Button("🆕 New Game", variant="secondary")
                help_btn = gr.Button("❓ Help", variant="secondary")
        
        # Status sidebar (right side)
        with gr.Column(scale=1):
            status_display = gr.Markdown(
                value=get_status_display(),
                label="Game Status"
            )
            
            gr.Markdown("""
**Quick Commands:**
- `look` - Examine surroundings
- `explore` - Search for items
- `go [direction]` - Move around
- `inventory` - Check items
- `help` - Full command list
""")
    
    # Footer
    gr.Markdown("""
    ---
    ### 🎓 Course Concepts Demonstrated:
    | Feature | Technique |
    |---------|-----------|
    | World Generation | Hierarchical Content Generation |
    | Dynamic Stories | Interactive AI Applications |
    | Inventory System | JSON Parsing & Tool Calling |
    | Content Safety | Moderation Guardrails |
    
    *Built following DeepLearning.AI's "Building an AI-Powered Game" course*
    """)
    
    # Event handlers
    submit_btn.click(
        fn=process_game_input,
        inputs=[user_input, chatbot],
        outputs=[chatbot, status_display]
    ).then(
        fn=lambda: "",
        outputs=[user_input]
    )
    
    user_input.submit(
        fn=process_game_input,
        inputs=[user_input, chatbot],
        outputs=[chatbot, status_display]
    ).then(
        fn=lambda: "",
        outputs=[user_input]
    )
    
    new_game_btn.click(
        fn=start_new_game,
        outputs=[chatbot, status_display]
    )
    
    help_btn.click(
        fn=show_help,
        inputs=[chatbot],
        outputs=[chatbot]
    )
    
    # Auto-start game on load
    demo.load(
        fn=start_new_game,
        outputs=[chatbot, status_display]
    )

# Launch the game
if __name__ == "__main__":
    print("🎮 Starting AI-Powered Text Adventure...")
    print("=" * 50)
    demo.launch(
        share=False, 
        show_error=True,
        theme=gr.themes.Soft(
            primary_hue="purple",
            secondary_hue="pink",
            neutral_hue="slate"
        )
    )
