(
    [
        # Generate letter images using our plugin - direct call method
        generate_letter_images(
            map_py_item={"source": "letter_blocks/**/*.block.png", "target": AUTO_FLAT_SUBFOLDER},
            letters=letters,
            output_dir="./letter_blocks",
            font_size=font_size,
            text_color=tuple(text_color),  # Convert list to tuple
            font_path=font_path,
            background_image_path=background_image_path,
        ),
        # Textures
        #{"source": "letter_blocks/**/*.block.png", "target": AUTO_FLAT_SUBFOLDER},
        # Item texture / Terrain Texture for block and item icon
        {
            "source": "item_texture.json",
            "target": "RP/textures/item_texture.json",
            "on_conflict": "merge",
            "scope": {
                "letters": [
                    p.stem.removesuffix(".block")
                    for p in Path("letter_blocks").glob("**/*.png")
                ]
            },
            "json_template": True,
        },
        {
            "source": "terrain_texture.json",
            "target": "RP/textures/terrain_texture.json",
            "on_conflict": "merge",
            "scope": {
                "letters": [
                    p.stem.removesuffix(".block")
                    for p in Path("letter_blocks").glob("**/*.png")
                ]
            },
            "json_template": True,
        },
        # Assign the texture to the block
        {
            "source": "blocks.json",
            "target": "RP/blocks.json",
            "on_conflict": "merge",
            "scope": {
                "letters": [
                    p.stem.removesuffix(".block")
                    for p in Path("letter_blocks").glob("**/*.png")
                ]
            },
            "json_template": True,
        },
    ]
    + [
        # Block definition
        {
            "source": "letter_block.block.json",
            "target": f"BP/blocks/{p.stem.removesuffix('.block')}.block.json",
            "scope": {"letter": p.stem.removesuffix(".block")},
            "json_template": True,
        }
        for p in Path("letter_blocks").glob("**/*.png")
    ]
    + [
        # Block loot
        {
            "source": "letter_block.loot.json",
            "target": f"BP/loot_tables/shapecape/{p.stem.removesuffix('.block')}.loot.json",
            "scope": {"letter": p.stem.removesuffix(".block")},
            "json_template": True,
        }
        for p in Path("letter_blocks").glob("**/*.png")
    ]
    + [
        # Item definition
        {
            "source": "letter_block_placer.bp_item.json",
            "target": f"BP/items/{p.stem.removesuffix('.block')}.bp_item.json",
            "scope": {
                "letter": p.stem.removesuffix(".block"),
                "category": p.parent.name,
            },
            "json_template": True,
        }
        for p in Path("letter_blocks").glob("**/*.png")
    ]
    + [
        # Attachable
        {
            "source": "letter_block_placer.attachable.json",
            "target": f"RP/attachables/{p.stem.removesuffix('.block')}.attachable.json",
            "scope": {"letter": p.stem.removesuffix(".block")},
            "json_template": True,
        }
        for p in Path("letter_blocks").glob("**/*.png")
    ]
    + [
        # Attachabble model and animaiton
        {"source": "letter_block_placer.geo.json", "target": AUTO_FLAT},
        {"source": "letter_block_placer.animation.json", "target": AUTO_FLAT},
    ]
    + [
        # The debug function for getting all block items
        {
            "source": "letter_block.mcfunction",
            "target": AUTO_FLAT,
            "scope": {
                "blocks": [
                    f'edu_tools:letter_block_{p.stem.removesuffix(".block")}_placer'
                    for p in Path("letter_blocks").glob("**/*.png")
                ],
                "categories": [
                    [
                        f'edu_tools:letter_block_{p.stem.removesuffix(".block")}_placer'
                        for p in subfolder.glob("*.png")
                    ]
                    for subfolder in Path("letter_blocks").iterdir()
                    if subfolder.is_dir()
                ],
                "category_names": [
                    subfolder.name
                    for subfolder in Path("letter_blocks").iterdir()
                    if subfolder.is_dir()
                ],
            },
        }
    ]
)
