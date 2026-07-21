"use strict";

/**
 * BloxdTool Map Renderer
 * Version: 1.0.0
 *
 * Canvas描画専用クラス
 */

class MapRenderer {

    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.width = canvas.width;
        this.height = canvas.height;

        this.scale = 1;
        this.offsetX = 0;
        this.offsetZ = 0;

        this.clear();

    }

    /**
     * 画面をクリア
     */
    clear() {

        this.ctx.fillStyle = "#0f172a";
        this.ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );

    }

    /**
     * ワールド座標→Canvas座標
     */
    worldToCanvas(x, z) {

        return {

            x:
                this.width / 2 +
                (x - this.offsetX) * this.scale,

            y:
                this.height / 2 -
                (z - this.offsetZ) * this.scale

        };

    }

    /**
     * 表示範囲を自動調整
     */
    fitView(measurements, result = null) {

        const points = [];

        for (const m of measurements) {

            points.push({
                x: m.x,
                z: m.z
            });

        }

        if (result) {

            points.push({
                x: result.x,
                z: result.z
            });

        }

        if (points.length === 0) {

            this.scale = 1;
            this.offsetX = 0;
            this.offsetZ = 0;

            return;

        }

        let minX = Infinity;
        let maxX = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;

        for (const p of points) {

            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);

            minZ = Math.min(minZ, p.z);
            maxZ = Math.max(maxZ, p.z);

        }

        this.offsetX = (minX + maxX) / 2;
        this.offsetZ = (minZ + maxZ) / 2;

        const worldWidth = Math.max(maxX - minX, 100);
        const worldHeight = Math.max(maxZ - minZ, 100);

        this.scale = Math.min(

            (this.width - 80) / worldWidth,

            (this.height - 80) / worldHeight

        );

    }

    /**
     * グリッド描画
     */
    drawGrid() {

        const ctx = this.ctx;

        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1;

        const grid = 50;

        for (let x = 0; x <= this.width; x += grid) {

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();

        }

        for (let y = 0; y <= this.height; y += grid) {

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();

        }

    }

    /**
     * 測定地点
     */
    drawMeasurements(measurements) {

        const ctx = this.ctx;

        for (const m of measurements) {

            const p =
                this.worldToCanvas(
                    m.x,
                    m.z
                );

            // 距離円
            ctx.beginPath();

            ctx.strokeStyle =
                "#3b82f688";

            ctx.lineWidth = 2;

            ctx.arc(

                p.x,

                p.y,

                m.distance * this.scale,

                0,

                Math.PI * 2

            );

            ctx.stroke();

            // 中心点
            ctx.beginPath();

            ctx.fillStyle =
                "#3b82f6";

            ctx.arc(
                p.x,
                p.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }

    /**
     * 推定地点
     */
    drawResult(result) {

        if (!result) {

            return;

        }

        const ctx = this.ctx;

        const p =
            this.worldToCanvas(
                result.x,
                result.z
            );

        ctx.beginPath();

        ctx.fillStyle =
            "#22c55e";

        ctx.arc(
            p.x,
            p.y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.stroke();

    }

    /**
     * 全描画
     */
    render(measurements, result = null) {

        this.fitView(
            measurements,
            result
        );

        this.clear();

        this.drawGrid();

        this.drawMeasurements(
            measurements
        );

        this.drawResult(
            result
        );

    }

}
