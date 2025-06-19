// twinkle-graph/main.ts (Living Graph 기반 반짝이 효과 + 강제 탐색 기반 디버깅 + 최종 확정된 px 접근)
import { Plugin, WorkspaceLeaf } from "obsidian";

export default class TwinkleGraphPlugin extends Plugin {
	intervalId: number | null = null;
	graphLeaves: WorkspaceLeaf[] = [];

	onload() {
		console.log("✨ TwinkleGraphPlugin loaded");

		this.registerEvent(
			this.app.workspace.on(
				"layout-change",
				this.refreshLeaves.bind(this)
			)
		);
		this.app.workspace.onLayoutReady(this.refreshLeaves.bind(this));

		this.addCommand({
			id: "twinkle-toggle",
			name: "Twinkle Graph - Toggle",
			callback: () => {
				if (this.intervalId) {
					this.clearEffect();
				} else {
					this.startEffect();
				}
			},
		});

		this.startEffect();
	}

	onunload() {
		this.clearEffect();
		console.log("🌙 TwinkleGraphPlugin unloaded");
	}

	refreshLeaves() {
		const global = this.app.workspace.getLeavesOfType("graph") ?? [];
		const local = this.app.workspace.getLeavesOfType("localgraph") ?? [];
		this.graphLeaves = global.concat(local);
		console.log(`📌 Graph leaves refreshed: ${this.graphLeaves.length}`);
	}

	startEffect() {
		if (this.intervalId !== null) return;

		this.intervalId = window.setInterval(() => {
			this.graphLeaves.forEach((leaf, leafIndex) => {
				const view: any = leaf.view;
				const renderer = view?.renderer;

				if (!renderer) {
					console.warn(`⚠️ [Leaf ${leafIndex}] No renderer found.`);
					return;
				}

				const rendererKeys = Object.keys(renderer);
				console.log(
					`🔍 [Leaf ${leafIndex}] Renderer keys:`,
					rendererKeys
				);

				// 확정된 Pixi 객체 경로: 'px'
				const pixiApp = renderer.px;
				if (!pixiApp?.renderer || !pixiApp?.stage) {
					console.warn(
						`❌ [Leaf ${leafIndex}] 'px' does not contain valid renderer/stage.`
					);
					console.dir(pixiApp);
					return;
				}

				// 노드 탐색
				let nodes = renderer.nodes;
				if (!nodes || !Array.isArray(nodes)) {
					console.warn(
						`⚠️ [Leaf ${leafIndex}] nodes array not found in renderer.`
					);
					return;
				}

				const time = Date.now();
				nodes.forEach((node: any, i: number) => {
					const alpha = 0.6 + 0.4 * Math.sin(time / 400 + node.index);
					if (node.circle) {
						node.circle.alpha = alpha;
					} else {
						console.warn(
							`⚠️ [Leaf ${leafIndex}] Node ${i} missing 'circle' property.`
						);
						console.dir(node);
					}
				});

				pixiApp.renderer.render(pixiApp.stage);
				console.log(
					`✅ [Leaf ${leafIndex}] Rendered at ${new Date().toISOString()} with ${
						nodes.length
					} nodes.`
				);
			});
		}, 40);
	}

	clearEffect() {
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			console.log("🧹 Twinkle effect cleared");
		}
	}
}
