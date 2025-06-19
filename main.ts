// twinkle-graph/main.ts (별자리 느낌 구현: 위상 랜덤 반짝임 + 균일한 크기 + 후광)
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

		this.injectStyle();
		this.startEffect();
	}

	onunload() {
		this.clearEffect();
		this.removeStyle();
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

				if (!renderer) return;

				const pixiApp = renderer.px;
				if (!pixiApp?.renderer || !pixiApp?.stage) return;

				const nodes = renderer.nodes;
				if (!nodes || !Array.isArray(nodes)) return;

				const time = Date.now();
				nodes.forEach((node: any) => {
					if (!node._twinkleInit) {
						node._phase = Math.random() * Math.PI * 2;
						node._twinkleInit = true;
					}

					const alpha =
						0.4 +
						0.6 * Math.abs(Math.sin(time / 150 + node._phase));
					const scale =
						0.9 + 0.1 * Math.sin(time / 200 + node._phase); // 기본 크기에서 크게 벗어나지 않음

					if (node.circle) {
						node.circle.alpha = alpha;
						node.circle.scale.set(scale, scale);
					}
				});

				pixiApp.renderer.render(pixiApp.stage);
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

	injectStyle() {
		const styleId = "twinkle-graph-style";
		if (document.getElementById(styleId)) return;

		const style = document.createElement("style");
		style.id = styleId;
		style.textContent = `
      .graph-view .node circle {
        filter:
          drop-shadow(0 0 2px #ffffff)
          drop-shadow(0 0 4px #88ccff)
          drop-shadow(0 0 6px rgba(255, 255, 255, 0.5))
          blur(0.5px);
        transform-origin: center center;
        transition: filter 0.2s ease-in-out;
      }
    `;
		document.head.appendChild(style);
	}

	removeStyle() {
		const existing = document.getElementById("twinkle-graph-style");
		if (existing) existing.remove();
	}
}
