import {
	system,
	world,
	Vector3,
	Block,
	Dimension,
	Player,
	Vector2,
} from "@minecraft/server";
import { WorldData } from "../world-data";
import { Polyfill } from "@bedrock-oss/bedrock-boost";

export function lockPlayers(worldData: WorldData): void {
	Polyfill.installPlayer();

	system.runInterval(() => {
		if (worldData.getLockPlayersActive()) {
			const players = world.getPlayers();
			players.forEach((player) => {
				if (player !== worldData.getHostPlayer()) {
					const playerLocation = player.location;
					let center = worldData.getLockPlayersCenter();
					let centerLocation: Vector3;

					if (center == null) {
						console.error("Center location is null!");
						return; // Stop the loop and go to the next forEach
					}

					if (center instanceof Player) {
						centerLocation = center.location;
					} else {
						centerLocation = center;
					}

					const distance = Math.sqrt(
						Math.pow(playerLocation.x - centerLocation.x, 2) +
							Math.pow(playerLocation.y - centerLocation.y, 2) +
							Math.pow(playerLocation.z - centerLocation.z, 2),
					);
					if (distance > worldData.getLockPlayersDistance()) {
						if (distance < worldData.getLockPlayersDistance() + 16) {
							const impulse = {
								x: (centerLocation.x - playerLocation.x) * 0.1,
								y: 0.2,
								z: (centerLocation.z - playerLocation.z) * 0.1,
							};

							// Cap the impulse to not make it too strong
							const maxImpulse = 2;
							impulse.x = Math.max(
								Math.min(impulse.x, maxImpulse),
								-maxImpulse,
							);
							impulse.y = Math.max(
								Math.min(impulse.y, maxImpulse),
								-maxImpulse,
							);
							impulse.z = Math.max(
								Math.min(impulse.z, maxImpulse),
								-maxImpulse,
							);

							player.applyImpulse(impulse);
							player.onScreenDisplay.setActionBar([
								{ translate: "edu_tools.message.too_far_push" },
							]);
						} else {
							if (worldData.getLockPlayersReturnToCenter()) {
								player.teleport(centerLocation, {
									rotation: player.getRotation(),
								});

								player.sendMessage([
									{
										translate: "edu_tools.message.too_far_teleport_center",
									},
								]);
								player.playSound("mob.endermen.portal");
							} else {
								const direction: Vector2 = {
									x: player.location.x - centerLocation.x,
									y: player.location.z - centerLocation.z,
								};

								const normalizedDirection: Vector2 = {
									x: direction.x / distance,
									y: direction.y / distance,
								};

								// Calculate closest point on circle
								const circleRadius = worldData.getLockPlayersDistance() - 5;
								const closestPoint: Vector2 = {
									x: centerLocation.x + normalizedDirection.x * circleRadius,
									y: centerLocation.z + normalizedDirection.y * circleRadius,
								};

								player.runCommand(
									`/spreadplayers ${closestPoint.x} ${closestPoint.y} 0 1 @s`,
								);
								player.sendMessage([
									{
										translate: "edu_tools.message.too_far_teleport_area",
									},
								]);

								player.playSound("mob.endermen.portal");
							}
						}
					}
				}
			});
		}
	}, 10);
}
