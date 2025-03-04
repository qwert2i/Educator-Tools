[
    # Scripts
    {
        "source": "main.ts",
        "target": AUTO_FLAT,
        "on_conflict": "append_end",
    },
    {
        "source": "subscripts/**/*.ts",
        "target": AUTO,
        "on_conflict": "skip",
    },
    # Icons
    {
        "source": "icons/**/*.ui.png",
        "target": AUTO,
    },
    # Translated lag files
    {
        "source": "translations/*.lang",
        "target": AUTO_FLAT,
        "on_conflict": "append_end",
        "subfunctions": True,
    },
]