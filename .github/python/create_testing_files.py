from pathlib import Path
import shutil
import json
import sys
import re

# PATH IN TO COPY FILES INTO BEFORE ZIPPING THEM
ZIP_FILES_PATH = sys.argv[1]
# PATH TO THE ROOT OF THE ADDON
ROOT_PATH = sys.argv[2]

# THE DIRECTORY TO PUT THE MCTEMPLATE FILE INTO
MCADDON_FILE_ROOT = sys.argv[3]

# THE SUFFIX ADDED TO THE ZIP FILE NAME (the version tag of the release)
ZIP_FILE_SUFFIX = sys.argv[4]

LANGUAGES = [  # list of the lang files
    "de_DE",
    "ru_RU",
    "zh_CN",
    "fr_FR",
    "it_IT",
    "pt_BR",
    "fr_CA",
    "zh_TW",
    "es_MX",
    "es_ES",
    "pt_PT",
    "en_GB",
    "ko_KR",
    "ja_JP",
    "nl_NL",
    "bg_BG",
    "cs_CZ",
    "da_DK",
    "el_GR",
    "fi_FI",
    "hu_HU",
    "id_ID",
    "nb_NO",
    "pl_PL",
    "sk_SK",
    "sv_SE",
    "tr_TR",
    "uk_UA",
]


def rename_lang_file(path, product_name, product_description, pack_count, index):
    with open(path, "r", encoding="utf-8-sig") as file:
        if pack_count > 1:
            product_name = f"{product_name} pack {index}"
        data = file.readlines()
        modified_data = []
        for line in data:
            if line.startswith("pack.name"):
                modified_data.append(f"pack.name={product_name}\n")
            elif line.startswith("pack.description"):
                modified_data.append(f"pack.description={product_description}\n")
            else:
                modified_data.append(line)
    with open(path, "w", encoding="utf8") as file:
        for lines in modified_data:
            file.writelines(lines)


def main():
    print("create_testing_files.py: Script started")
    zip_path = Path(ZIP_FILES_PATH)
    root_path = Path(ROOT_PATH)
    mcaddon_file_root = Path(MCADDON_FILE_ROOT)
    # Load project config
    with (root_path / "pack/release_config.json").open("r") as f:
        config = json.load(f)
    product_creator = config["product_creator"]
    product_name = config["product_name"]
    product_key = config["product_key"]
    product_description = config["product_description"]
    pack_icon_path = None
    # Load pack_icon depending on file ending
    if Path(root_path / "pack/pack_icon.png").exists():
        pack_icon_path = root_path / "pack/pack_icon.png"
    elif Path(root_path / "pack/pack_icon.jpg").exists():
        pack_icon_path = root_path / "pack/pack_icon.jpg"
    else:
        print(
            "Unable to find pack_icon file.\n"
            "The pack_icon should be in one of the locations:\n"
            "- pack/pack_icon.png\n"
            "- pack/pack_icon.jpg\n"
        )

    keyart_path = None
    # Load keyart depending on file ending
    if Path(root_path / "pack/keyart.png").exists():
        keyart_path = root_path / "pack/keyart.png"
    elif Path(root_path / "pack/keyart.jpg").exists():
        keyart_path = root_path / "pack/keyart.jpg"
    else:
        print(
            "Unable to find keyart file.\n"
            "The keyart should be in one of the locations:\n"
            "- pack/keyart.png\n"
            "- pack/keyart.jpg\n"
        )

    # Copy BP
    # Get a list of all the directories in the directory
    dir_list = [item for item in root_path.glob("behavior_packs/*") if item.is_dir()]
    pack_count = len(dir_list)
    for index, pack in enumerate(dir_list):
        bp_path = zip_path / f"behavior_packs/{index}"
        shutil.copytree(pack, bp_path)
        if pack_icon_path is not None:
            shutil.copy(pack_icon_path, bp_path / "pack_icon.png")
        # Change the manifest version
        with open(bp_path / "manifest.json", "r") as f:
            manifest = json.load(f)
        with open(bp_path / "manifest.json", "w") as f:
            version = ZIP_FILE_SUFFIX.split(".")
            manifest["header"]["version"] = [
                1,
                int(version[1]),
                int(version[2]),
            ]
            if "dependencies" in manifest and len(manifest["dependencies"]) > 0:
                manifest["dependencies"][0]["version"] = [
                    1,
                    int(version[1]),
                    int(version[2]),
                ]
            for module in manifest["modules"]:
                if "language" in module:
                    if module["language"] == "javascript":
                        module["version"] = [1, int(version[1]), int(version[2])]
            json.dump(manifest, f, indent=4)
        # changing pack.name and pack.description in the lang file based on config
        zip_texts_path = bp_path / "texts"
        zip_en_us = zip_texts_path / "en_US.lang"
        if not zip_en_us.exists():
            raise Exception(
                f"Unable to find en_US.lang file in {pack}.\n"
                "The lang file should be in the location:\n"
                f"- behavior_pack/{pack}/texts/en_US.lang\n"
            )
        rename_lang_file(
            path=Path(bp_path / "texts" / "en_US.lang"),
            product_name=product_name,
            product_description=product_description,
            pack_count=pack_count,
            index=index,
        )
        # Copy en_US.lang to other languages
        for language in LANGUAGES:
            if Path(zip_texts_path / f"{language}.lang").exists():
                continue
            shutil.copy(zip_en_us, zip_texts_path / f"{language}.lang")
        # Make sure the languages.json file is set up correctly
        with open(bp_path / "texts" / "languages.json", "w") as f:
            rp_languages = LANGUAGES.copy()
            rp_languages.insert(0, "en_US")
            json.dump(rp_languages, f, indent=4)
        # Copying texts folder to world_template language folder
        if index == 0:
            shutil.copytree(zip_texts_path, zip_path / "texts")
        # Removing pack index from texts in language folder
        languages = LANGUAGES
        languages.append("en_US")
        for language in languages:
            path = Path(zip_path / "texts" / f"{language}.lang")
            if path.exists():
                with open(path, "r", encoding="utf8") as file:
                    data = file.readlines()
                    modified_data = []
                    for line in data:
                        if line.startswith("pack.name"):
                            pattern = r" pack \d$"
                            modified_data.append(re.sub(pattern, "", line))
                        else:
                            modified_data.append(line)
                with open(path, "w", encoding="utf8") as file:
                    for lines in modified_data:
                        file.writelines(lines)

    # Copy RP
    # Get a list of all the directories in the directory
    dir_list = [item for item in root_path.glob("resource_packs/*") if item.is_dir()]
    pack_count = len(dir_list)
    for index, pack in enumerate(dir_list):
        rp_path = zip_path / f"resource_packs/{index}"
        shutil.copytree(pack, rp_path)
        if pack_icon_path is not None:
            shutil.copy(pack_icon_path, rp_path / "pack_icon.png")
        # Change the manifest version
        with open(rp_path / "manifest.json", "r") as f:
            manifest = json.load(f)
        with open(rp_path / "manifest.json", "w") as f:
            version = ZIP_FILE_SUFFIX.split(".")
            manifest["header"]["version"] = [
                1,
                int(version[1]),
                int(version[2]),
            ]
            if "dependencies" in manifest and len(manifest["dependencies"]) > 0:
                manifest["dependencies"][0]["version"] = [
                    1,
                    int(version[1]),
                    int(version[2]),
                ]
            json.dump(manifest, f, indent=4)
        # changing pack.name and pack.description in the lang file based on config
        zip_texts_path = rp_path / "texts"
        zip_en_us = zip_texts_path / "en_US.lang"
        if not zip_en_us.exists():
            raise Exception(
                f"Unable to find en_US.lang file in {pack}.\n"
                "The keyart should be in the location:\n"
                f"- resource_pack/{pack}/texts/en_US.lang\n"
            )
        rename_lang_file(
            path=Path(rp_path / "texts" / "en_US.lang"),
            product_name=product_name,
            product_description=product_description,
            pack_count=pack_count,
            index=index,
        )
        # Copy en_US.lang to other languages
        for language in LANGUAGES:
            if Path(zip_texts_path / f"{language}.lang").exists():
                continue
            shutil.copy(zip_en_us, zip_texts_path / f"{language}.lang")
        # Make sure the languages.json file is set up correctly
        with open(rp_path / "texts" / "languages.json", "w") as f:
            rp_languages = LANGUAGES.copy()
            rp_languages.insert(0, "en_US")
            json.dump(rp_languages, f, indent=4)

    dir_to_unlink = ["texts", "db"]

    for path in dir_to_unlink:
        try:
            shutil.rmtree(zip_path / path)
        except:
            print("Could not remove the path " + path)
            pass

    mcaddon_file_path = (
        mcaddon_file_root / f"{product_creator}_{product_key}_{ZIP_FILE_SUFFIX}"
    )
    print(
        f"package_release.py: Creating mcaddon file at {mcaddon_file_path.as_posix()}"
    )
    mcaddon_file_root.mkdir(exist_ok=True, parents=True)

    shutil.make_archive(mcaddon_file_path, "zip", zip_path)
    shutil.move(
        f"{mcaddon_file_path.as_posix()}.zip", f"{mcaddon_file_path.as_posix()}.mcaddon"
    )

    print("package_release.py: Finished with no errors!")


if __name__ == "__main__":
    main()
