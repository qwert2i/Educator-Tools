'''
This script generates 64x64 images with transparent backgrounds for each letter
in a string provided in the scope. It uses the Pillow library for image manipulation.
'''
from typing import Any, Dict
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os
import re

from array import array

def safe_filename(character: str) -> str:
    """
    Convert a character to a safe filename string using Unicode code point.
    
    Args:
        character: The character to convert
        
    Returns:
        A safe filename string in the format 'char_X' where X is the hex Unicode code point
    """
    # Get the Unicode code point and convert to hex
    code_point = ord(character)
    return f"char_{format(code_point, 'x')}"

def generate_letter_images(
        map_py_item: dict[str, Any],
        letters: str,
        output_dir: str = ".",
        font_path: str = None,
        font_size: int = 64,
        text_color: tuple = (255, 255, 255, 255),
        image_size: tuple = (64, 64),
        background_image_path: str = None
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
        background_image_path: Path to background image. If None, transparent background will be used.
        
    Returns:
        The unmodified map_py_item.
    '''
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Create a mapping of characters to safe filenames for reference
    char_to_filename = {char: safe_filename(char) for char in set(letters)}
    
    # Create a reverse mapping for debugging and reference
    mapping_file_path = output_path / "character_mapping.txt"
    with open(mapping_file_path, "w", encoding="utf-8") as f:
        f.write("Character\tFilename\tUnicode\n")
        for char, filename in char_to_filename.items():
            f.write(f"{char}\t{filename}\t{ord(char)}\n")
    print(f"Created character mapping reference at {mapping_file_path}")
    
    # Load background image if provided
    background_image = None
    if background_image_path and os.path.exists(background_image_path):
        try:
            background_image = Image.open(background_image_path).convert('RGBA')
            background_image = background_image.resize(image_size)
            print(f"Using background image: {background_image_path}")
        except Exception as e:
            print(f"Error loading background image: {e}")
            background_image = None
    else:
        print("No background image provided or file not found. Using transparent background. Path: " + 
              str(os.path.abspath(background_image_path) if background_image_path else "None"))
    
    # Load font with better fallback handling
    font = None
    
    # Try to load the specified custom font
    if font_path and os.path.exists(font_path):
        try:
            font = ImageFont.truetype(font_path, font_size)
            print(f"Successfully loaded custom font '{font_path}' with size {font_size}")
        except Exception as e:
            print(f"Error loading custom font '{font_path}': {e}")
            font = None
    
    # Fallback to system fonts if custom font failed or wasn't specified
    if font is None:
        system_fonts = [
            "arial.ttf", "Arial.ttf",                  # Windows
            "DejaVuSans.ttf", "FreeSans.ttf",          # Linux
            "/System/Library/Fonts/Helvetica.ttc",     # macOS
            "/System/Library/Fonts/SFNSText.ttf"       # macOS
        ]
        
        for system_font in system_fonts:
            try:
                font = ImageFont.truetype(system_font, font_size)
                print(f"Using system font '{system_font}' with size {font_size}")
                break
            except Exception:
                continue
    
    # Last resort: Use a default font and scale it (though this might not be perfect)
    if font is None:
        print(f"Using default font. Font size may not appear as expected.")
        font = ImageFont.load_default()
        # Some versions of PIL don't support resizing the default font
    
    # Generate an image for each unique letter
    print ("a")
    unique_letters = set(letters)
    print(f"Unique letters to process: {unique_letters}")
    for letter in unique_letters:
        print(f"Processing letter '{letter}'")
        if letter.strip():  # Skip empty or whitespace-only characters
            if background_image:
                # Use the background image by creating a copy
                img = background_image.copy()
            else:
                # Create a transparent image
                img = Image.new('RGBA', image_size, (0, 0, 0, 0))
            
            draw = ImageDraw.Draw(img)
            
            # Calculate text size to center it
            try:
                # For newer Pillow versions
                left, top, right, bottom = draw.textbbox((0, 0), letter, font=font)
                text_width = right - left
                text_height = bottom - top
                
                # Account for the text's position relative to the origin for proper centering
                position = ((image_size[0] - text_width) // 2 - left, (image_size[1] - text_height) // 2 - top)
            except AttributeError:
                # For older Pillow versions
                text_width, text_height = draw.textsize(letter, font=font)
                
                # Try to get offset information if available
                try:
                    offset_x, offset_y = font.getoffset(letter)
                    position = ((image_size[0] - text_width) // 2 - offset_x, (image_size[1] - text_height) // 2 - offset_y)
                except (AttributeError, TypeError):
                    # Fallback to simple centering if offset isn't available
                    position = ((image_size[0] - text_width) // 2, (image_size[1] - text_height) // 2)
            
            # Draw the letter
            draw.text(position, letter, font=font, fill=text_color)
            
            # Save the image with a safe filename
            safe_name = char_to_filename[letter]
            img_path = output_path / f"{safe_name}.block.png"
            img.save(img_path)
            print(f"Generated image for letter '{letter}' at {img_path.resolve()}")
    
    # Return unmodified map_py_item
    print("Returning unmodified map_py_item")
    return map_py_item
