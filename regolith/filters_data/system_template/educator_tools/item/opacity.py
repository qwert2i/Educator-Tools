from PIL import Image

def reduce_opacity(input_path, output_path):
    # Open the image
    img = Image.open(input_path)
    
    # Convert the image to RGBA mode if it's not already
    img = img.convert("RGBA")
    
    # Get the image data as a list of pixels
    data = list(img.getdata())
    
    # Set the opacity of each pixel to 1, skipping pixels where alpha is 0
    new_data = [(r, g, b, 1) if a != 0 else (r, g, b, a) for r, g, b, a in data]
    
    # Update the image with the new data
    img.putdata(new_data)
    
    # Save the modified image
    img.save(output_path, "PNG")

# Usage
input_image = "tools_item.png"
output_image = "educator_tool.item.png"
reduce_opacity(input_image, output_image)
