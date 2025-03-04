# About

This system adds the "UI" mechanics that are accessed by the player by interacting with the "Educator Tools item" (which is not part of this sub system, but its own independent subsystem).

# Features

- **Educator Tool**: Opens the Educator Tool UI which can only be accessed by the host of the world
- **Teleport**: Allows Educators to teleport to specific players or teleport players to other specific players
- **Gamemode**: Allows Educators to quickly change gamemode of specific or all players at once
- **Timer**: Allows Educators to set a timer which is displayed as a boss bar. There is a slight issue with Boss bar rendering in this, thus the timer entity is also able to be shown in the world. 
- **World Setting** - Allows Educators to set game rules without leaving the world. 
- **Lock Players** - Allows Educators to lock players in a circle either around them or around a specific coordinate.


# Code Structure

The code is structured in the following:

## Main scripts

### main.ts

This file is the initialisazion point for the UI. It runs by default when the Add-On is loaded and initializes the WorldData class which is used to load and store data on the world and is the entry point for the UI, as it creates a new `sceneManager` when using the "Educator Tools item".

### subscripts/scene-manager

The sceneManager is a class that is called on the beginning of a UI interaction and takes care of swapping UI scenes as well as saving all data that is relevant for the current UI interaction.

### subscripts/ui-scene

The UIScene is a wrapper used for making it easier to create UI scenes. It contains classed for Action, Modal and Message forms.

### subscripts/world-data 

The WorldData is a class that loads and stores data on the world. It can be accessed through the SceneManager and stores data like timers, and information for the playerLocking.

### subscripts/scenes/*

Scenes are individual UI screens that are being triggered by the sceneManager. Each is a child of either an action, modal or message class from the UIScene wrapper. 

### subscripts/mechanics/*

Mechanics contains scripts for mechanics that are to complex to execute within the scenes. 

#### timer-mechanic

The timer mechanic file handles timers. It contains of a class that is then stored on the WorldData so it is accessible in multiple sessions. 

### lock-players

This mechanic takes care of locking players to a predefined area. This script handles pushing/teleporting the player based on the Educators configuration within the Educator Tool menu.