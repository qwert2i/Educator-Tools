'''
This script generates 64x64 images with transparent backgrounds for each letter
in a string provided in the scope. It uses the Pillow library for image manipulation.
'''
from typing import Any, Dict
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os

def generate_letter_images(
        map_py_item: dict[str, Any],
        letters: str,
        output_dir: str = ".",
        font_path: str = None,
        font_size: int = 48,
        text_color: tuple = (255, 255, 255, 255),
        image_size: tuple = (64, 64)
    ) -> dict[str, Any]:
    '''
    Generates an image for each letter in the provided string with transparent background.
    
    Args:
        map_py_item: The map_py item from system_template.
        letters: String containing all the letters to generate images for.
        output_dir: Directory where the images will be saved.
        font_path: Path to a custom font file. If None, default font will be used.
        font_size: Font size to use.
        text_color: RGBA color tuple for the text.
        image_size: Tuple with (width, height) of the output image.
        
    Returns:
        The unmodified map_py_item.
    '''
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Load font
    if font_path and os.path.exists(font_path):
        try:
            font = ImageFont.truetype(font_path, font_size)
        except Exception as e:
            print(f"Error loading custom font: {e}")
            font = ImageFont.load_default()
    else:
        # Use default font if no custom font specified or if loading fails
        font = ImageFont.load_default()
    
    # Generate an image for each unique letter
    unique_letters = set(letters)
    for letter in unique_letters:
        if letter.strip():  # Skip empty or whitespace-only characters
            # Create a transparent image
            img = Image.new('RGBA', image_size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Calculate text size to center it
            try:
                # For newer Pillow versions
                left, top, right, bottom = draw.textbbox((0, 0), letter, font=font)
                text_width = right - left
                text_height = bottom - top
            except AttributeError:
                # For older Pillow versions
                text_width, text_height = draw.textsize(letter, font=font)
            
            # Calculate position to center text
            position = ((image_size[0] - text_width) // 2, (image_size[1] - text_height) // 2)
            
            # Draw the letter
            draw.text(position, letter, font=font, fill=text_color)
            
            # Save the image
            img_path = output_path / f"{letter}.block.png"
            img.save(img_path)
            print(f"Generated image for letter '{letter}' at {img_path.resolve()}")
    
    # Return unmodified map_py_item
    return map_py_item
