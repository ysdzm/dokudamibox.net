// Broad, overlapping alternate leaves retain the plant's branching growth.
// Reference: https://www.ffpri.go.jp/tmk/kengakuannai/midokoro/shokubutsu/dokudami.html
// Shapes are generated on a coarse grid using the six colors in /dokudami.png.

interface Point {
	x: number;
	y: number;
}

interface Leaf {
	node: Point;
	base: Point;
	angle: number;
	length: number;
	width: number;
	highlight: boolean;
}

interface Flower {
	base: Point;
	center: Point;
	petals: number[];
	angle: number;
	tilt: number;
}

interface Shoot {
	stem: Point[];
	leaves: Leaf[];
	flower: Flower | undefined;
	depth: number;
}

export interface Patch {
	width: number;
	height: number;
	shoots: Shoot[];
}

function randomSource(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

export function createPatch(width: number, height: number, seed: number): Patch {
	const shoots: Shoot[] = [];
	const count = Math.max(5, Math.round(width / 22));
	const leftCount = Math.ceil(count / 2);
	let previous: Point | undefined;
	for (let index = 0; index < count; index++) {
		const fromLeft = index < leftCount;
		const branchIndex = fromLeft ? index : index - leftCount;
		const branchCount = fromLeft ? leftCount : count - leftCount;
		if (branchIndex === 0) previous = undefined;
		const random = randomSource(seed ^ Math.imul(index + 1, 0x45d9f3b));
		const between = (min: number, max: number) => min + random() * (max - min);
		// Independent stems enter from both edges and grow inward without bridging.
		const distance = 8 + (branchIndex / (branchCount - 1)) * (width * 0.44 - 8);
		const node: Point = {
			x: (fromLeft ? distance : width - distance) + between(-2, 2),
			y: height * (0.66 + Math.sin(index * 1.8) * 0.15) + between(-1, 1),
		};
		const side = index % 2 === 0 ? 1 : -1;
		const leaves: Leaf[] = [];
		for (let leafIndex = 0; leafIndex < 2; leafIndex++) {
			const leafSide = leafIndex === 0 ? side : -side;
			const leafNode =
				leafIndex === 0 || !previous
					? node
					: {
							x: (previous.x + node.x) / 2,
							y: (previous.y + node.y) / 2,
						};
			leaves.push({
				node: leafNode,
				base: { x: leafNode.x + leafSide * between(2, 4), y: leafNode.y + (leafIndex ? 1 : -5) },
				angle: -leafSide * between(0.8, 1.8),
				length: between(6, 8),
				width: between(6, 8),
				highlight: random() < 0.55,
			});
		}
		const flowerRandom = randomSource(seed ^ Math.imul(index + 1, 0x27d4eb2d));
		let flower: Flower | undefined =
			index % 2 === 0
				? {
						base: node,
						center: { x: node.x + between(-3, 3), y: between(6, 11) },
						petals: Array.from({ length: 4 }, () => Math.round(between(3, 4))),
						angle: flowerRandom() * Math.PI * 2,
						tilt: 0.65 + flowerRandom() * 0.2,
					}
				: undefined;
		if (flower) {
			const branch = {
				x: (node.x + flower.center.x) / 2,
				y: (node.y + flower.center.y) / 2,
			};
			leaves.push({
				node: branch,
				base: { x: branch.x + side * 3, y: branch.y },
				angle: -side * between(0.8, 1.5),
				length: between(5, 7),
				width: between(5, 7),
				highlight: true,
			});
		}
		// Occasional extra blooms use a separate random stream, preserving foliage.
		if (!flower && index % 6 === 3) {
			flower = {
				base: node,
				center: { x: node.x + flowerRandom() * 6 - 3, y: 6 + flowerRandom() * 5 },
				petals: Array.from({ length: 4 }, () => Math.round(3 + flowerRandom())),
				angle: flowerRandom() * Math.PI * 2,
				tilt: 0.65 + flowerRandom() * 0.2,
			};
		}
		shoots.push({
			stem: [previous ?? { x: fromLeft ? -3 : width + 3, y: height * 0.85 }, node],
			leaves,
			depth: random(),
			flower,
		});
		previous = node;
	}
	shoots.sort((a, b) => a.depth - b.depth);
	return { width, height, shoots };
}

// Scan-convert polygons to integer rectangles so edges contain no smoothed
// pixels or intermediate colors, even when a generated leaf points diagonally.
function fillShape(context: CanvasRenderingContext2D, points: Point[], color: string) {
	const top = Math.floor(Math.min(...points.map((point) => point.y)));
	const bottom = Math.ceil(Math.max(...points.map((point) => point.y)));
	context.fillStyle = color;
	for (let y = top; y < bottom; y++) {
		const scan = y + 0.5;
		const crossings: number[] = [];
		for (let index = 0; index < points.length; index++) {
			const a = points[index];
			const b = points[(index + 1) % points.length];
			if (!a || !b || a.y > scan === b.y > scan) continue;
			crossings.push(a.x + ((scan - a.y) * (b.x - a.x)) / (b.y - a.y));
		}
		crossings.sort((a, b) => a - b);
		for (let index = 0; index < crossings.length; index += 2) {
			const left = crossings[index];
			const right = crossings[index + 1];
			if (left === undefined || right === undefined) continue;
			const start = Math.ceil(left - 0.5);
			context.fillRect(start, y, Math.ceil(right - 0.5) - start, 1);
		}
	}
}

function line(context: CanvasRenderingContext2D, a: Point, b: Point, color: string) {
	context.fillStyle = color;
	const steps = Math.ceil(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)));
	for (let step = 0; step <= steps; step++) {
		const t = steps ? step / steps : 0;
		context.fillRect(Math.round(a.x + (b.x - a.x) * t), Math.round(a.y + (b.y - a.y) * t), 1, 1);
	}
}

export function drawPatch(
	context: CanvasRenderingContext2D,
	patch: Patch,
	dark: boolean,
	seconds = 0,
) {
	context.clearRect(0, 0, patch.width, patch.height);
	const leafColor = dark ? "#79975e" : "#85a667";
	const highlight = dark ? "#b9bd8b" : "#d2d298";
	const shadow = "#338574";
	const white = "#e9ead8";
	const red = "#b55353";
	const breeze = (x: number) => Math.sin(seconds * 0.75 + x * 0.04) - Math.sin(x * 0.04);
	// One displacement field keeps shared stem and leaf joints connected.
	const sway = (point: Point): Point => {
		const freedom = Math.max(0, 1 - point.y / patch.height) ** 1.5;
		return { x: point.x + breeze(point.x) * freedom * 0.85, y: point.y };
	};

	for (const shoot of patch.shoots) {
		const root = shoot.stem[0];
		const tip = shoot.stem[1];
		if (root && tip) line(context, sway(root), sway(tip), shadow);
		for (const leaf of shoot.leaves) {
			line(context, sway(leaf.node), sway(leaf.base), shadow);
			const sin = Math.sin(leaf.angle);
			const cos = Math.cos(leaf.angle);
			const point = (x: number, y: number): Point =>
				sway({
					x: leaf.base.x + x * leaf.width * cos - y * leaf.length * sin,
					y: leaf.base.y + x * leaf.width * sin + y * leaf.length * cos,
				});
			// A notched base and broad lobes taper into a pointed heart-shaped leaf.
			fillShape(
				context,
				[
					point(0, 0.15),
					point(-0.3, -0.15),
					point(-0.7, 0),
					point(-0.8, 0.45),
					point(0, 1.2),
					point(0.8, 0.45),
					point(0.7, 0),
					point(0.3, -0.15),
				],
				leafColor,
			);
			fillShape(
				context,
				[point(0.7, 0), point(0.8, 0.45), point(0, 1.2), point(0.36, 0.45)],
				shadow,
			);
			if (leaf.highlight) {
				fillShape(
					context,
					[
						point(-0.3, -0.15),
						point(-0.7, 0),
						point(-0.8, 0.45),
						point(-0.35, 0.6),
						point(-0.25, 0.15),
					],
					highlight,
				);
			}
		}
	}
	// Flowers are drawn last so their four white bracts stay legible.
	for (const shoot of patch.shoots) {
		const flower = shoot.flower;
		if (!flower) continue;
		const center = sway(flower.center);
		line(context, sway(flower.base), center, shadow);
		const cx = Math.round(center.x);
		const cy = Math.round(center.y);
		const bracts = flower.petals.map((length, index) => {
			const angle = flower.angle + (index * Math.PI) / 2 + breeze(flower.center.x) * 0.035;
			const point = (x: number, y: number): Point => ({
				x: cx + (x * Math.cos(angle) - y * Math.sin(angle)) * 1.3,
				y: cy + (x * Math.sin(angle) + y * Math.cos(angle)) * flower.tilt * 1.3,
			});
			// Rounded bracts spread on an oblique plane and meet at narrow bases.
			const curve = (a: Point, b: Point, c: Point, d: Point) =>
				Array.from({ length: 9 }, (_, step) => {
					const t = step / 8;
					const u = 1 - t;
					return point(
						length * (u ** 3 * a.x + 3 * u ** 2 * t * b.x + 3 * u * t ** 2 * c.x + t ** 3 * d.x),
						length * (u ** 3 * a.y + 3 * u ** 2 * t * b.y + 3 * u * t ** 2 * c.y + t ** 3 * d.y),
					);
				});
			return [
				...curve({ x: 0, y: 0 }, { x: 0.3, y: -0.55 }, { x: 1.35, y: -0.5 }, { x: 1.25, y: 0 }),
				...curve(
					{ x: 1.25, y: 0 },
					{ x: 1.1, y: 0.55 },
					{ x: 0.35, y: 0.48 },
					{ x: 0, y: 0 },
				).slice(1),
			];
		});
		for (const bract of bracts) {
			fillShape(
				context,
				bract.map(({ x, y }) => ({ x: x + 0.4, y: y + 0.65 })),
				"#d2d298",
			);
		}
		for (const bract of bracts) {
			fillShape(context, bract, white);
		}
		context.fillStyle = "#d2d298";
		context.fillRect(cx, cy - 3, 1, 4);
		context.fillStyle = red;
		context.fillRect(cx, cy - 2, 1, 3);
	}
}
