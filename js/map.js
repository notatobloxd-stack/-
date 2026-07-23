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

        this.autoFit = true;
        
        this.clear();

        this.initEvents();
        
        this.showHeatmap = true;

        this.selectedMeasurement = -1;

        this.isDragging = false;
        
        this.canvas.style.cursor = "grab";
        this.minScale = 0.2;
this.maxScale = 50;

this.lastMouseX = 0;
this.lastMouseY = 0;
        
        this.onMeasurementSelected = null;

        this.onMouseCoordinateChanged = null;

    }

    setHeatmapVisible(value){

    this.showHeatmap = value;

}

    setMeasurementSelectedCallback(callback){

    this.onMeasurementSelected = callback;

}

    setMouseCoordinateCallback(callback){

    this.onMouseCoordinateChanged = callback;

}
    
initEvents() {

    this.canvas.addEventListener(
        "click",
        this.onClick.bind(this)
    );

    this.canvas.addEventListener(
        "mousemove",
        this.onMouseMove.bind(this)
    );

    this.canvas.addEventListener(
        "mousedown",
        this.onMouseDown.bind(this)
    );

    window.addEventListener(
        "mouseup",
        this.onMouseUp.bind(this)
    );

    this.canvas.addEventListener(
        "wheel",
        this.onWheel.bind(this),
        { passive:false }
    );

    }

    onClick(event){

    const rect =
        this.canvas.getBoundingClientRect();

    const x =
        event.clientX - rect.left;

    const y =
        event.clientY - rect.top;

    let nearest = -1;

    let nearestDistance = Infinity;

    this.measurements.forEach((m,index)=>{

        const p =
            this.worldToCanvas(
                m.x,
                m.z
            );

        const d =
            Math.hypot(

                x-p.x,

                y-p.y

            );

        if(
            d<12 &&
            d<nearestDistance
        ){

            nearest=index;

            nearestDistance=d;

        }

    });

    this.selectedMeasurement = nearest;

if(this.onMeasurementSelected){

    this.onMeasurementSelected(nearest);

}

this.render(
    this.measurements,
    this.result
);

}

onMouseMove(event){

    const rect = this.canvas.getBoundingClientRect();

const mouseX = event.clientX - rect.left;

const mouseY = event.clientY - rect.top;

const world =
    this.canvasToWorld(
        mouseX,
        mouseY
    );

if(this.onMouseCoordinateChanged){

    this.onMouseCoordinateChanged(world);

}
    
    if(!this.isDragging){
        return;
    }

    const dx = event.clientX - this.lastMouseX;
    const dy = event.clientY - this.lastMouseY;

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    this.offsetX -= dx / this.scale;

    this.offsetZ += dy / this.scale;

    this.render(
        this.measurements,
        this.result
    );

}

onMouseDown(event){

    this.isDragging = true;

    this.lastMouseX = event.clientX;

    this.lastMouseY = event.clientY;
    
    this.canvas.style.cursor = "grabbing";

}

onMouseUp(event){

    this.isDragging = false;
    
    this.canvas.style.cursor = "grab";

}

onWheel(event){

    event.preventDefault();

    const rect = this.canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const worldBefore = this.canvasToWorld(
        mouseX,
        mouseY
    );

    const zoomFactor =
        event.deltaY < 0 ? 1.1 : 0.9;

    this.scale *= zoomFactor;

    this.scale = Math.max(
        this.minScale,
        Math.min(this.maxScale, this.scale)
    );

    const worldAfter = this.canvasToWorld(
        mouseX,
        mouseY
    );

    this.offsetX +=
        worldBefore.x - worldAfter.x;

    this.offsetZ +=
        worldBefore.z - worldAfter.z;

    this.render(
        this.measurements,
        this.result
    );

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

canvasToWorld(x, y){

    return{

        x:
            (x - this.width / 2) / this.scale + this.offsetX,

        z:
            (this.height / 2 - y) / this.scale + this.offsetZ

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

        for (const [index, m] of measurements.entries()) {

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
            ctx.fillStyle =
    index === this.selectedMeasurement
        ? "#ef4444"
        : "#38bdf8";

ctx.beginPath();

ctx.arc(
    p.x,
    p.y,
    index === this.selectedMeasurement ? 8 : 5,
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
 * ヒートマップ用の色を取得
 * @param {number} t 0.0～1.0
 * @returns {string}
 */
getHeatColor(t) {

    t = Math.max(0, Math.min(1, t));

    let r;
    let g;
    let b;

    if (t < 0.5) {

        // 緑 → 黄
        const k = t * 2;

        r = Math.round(34 + (255 - 34) * k);
        g = Math.round(197 + (220 - 197) * k);
        b = Math.round(94 - 94 * k);

    } else {

        // 黄 → 赤
        const k = (t - 0.5) * 2;

        r = 255;
        g = Math.round(220 - 152 * k);
        b = 0;

    }

    const alpha = 0.15 + (1 - t) * 0.45;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;

}
    
 /**
 * ヒートマップ描画
 * @param {Array} candidates
 */
drawHeatmap(candidates) {

    if (!candidates || candidates.length === 0) {
        return;
    }

    const ctx = this.ctx;

    const bestError = candidates[0].error;
    const maxError = candidates[candidates.length - 1].error;

    ctx.save();

    for (const c of candidates) {

        const p = this.worldToCanvas(c.x, c.z);

        const t =
            (c.error - bestError) /
            (maxError - bestError + 0.0001);

        const color = this.getHeatColor(t);

        // 半径（ズームに応じて調整）
        const radius = Math.max(18, this.scale * 8);

        const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            radius
        );

        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = gradient;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    ctx.restore();

}
    /**
     * 全描画
     */
    render(measurements, result = null) {

    this.measurements = measurements;
    this.result = result;

    if(this.autoFit){

        this.fitView(
            measurements,
            result
        );

        this.autoFit = false;

    }
        
        this.clear();

this.drawGrid();

if(

    this.showHeatmap &&

    result &&

    result.candidates

){

    this.drawHeatmap(result.candidates);

}

this.drawMeasurements(measurements);

this.drawResult(result);

    }

}
