"use strict";

/**
 * BloxdTool Solver
 * Version: 1.0.0
 *
 * 座標推定アルゴリズム本体
 * UIには依存しない
 */
class Solver {

    /**
     * @param {Array<{x:number,z:number,distance:number}>} measurements
     */
    constructor(measurements) {

        this.measurements = measurements;

        this.validateMeasurements();
    }

    /**
     * 入力データ検証
     */
    validateMeasurements() {

        if (!Array.isArray(this.measurements)) {
            throw new Error("measurements must be an array.");
        }

        if (this.measurements.length < 2) {
            throw new Error("At least two measurements are required.");
        }

        for (const m of this.measurements) {

            if (typeof m.x !== "number") {
                throw new Error("Invalid x.");
            }

            if (typeof m.z !== "number") {
                throw new Error("Invalid z.");
            }

            if (typeof m.distance !== "number") {
                throw new Error("Invalid distance.");
            }

            if (m.distance < 0) {
                throw new Error("Distance cannot be negative.");
            }
        }
    }

    /**
     * 2点間距離
     */
    distance(x1, z1, x2, z2) {

        return Math.hypot(
            x2 - x1,
            z2 - z1
        );

    }

    /**
     * 1測定の誤差
     */
    measurementError(measurement, x, z) {

        const actualDistance = this.distance(
            x,
            z,
            measurement.x,
            measurement.z
        );

        return Math.abs(
            actualDistance - measurement.distance
        );

    }

    /**
     * 平均誤差
     */
    averageError(x, z) {

        let total = 0;

        for (const m of this.measurements) {

            total += this.measurementError(
                m,
                x,
                z
            );

        }

        return total / this.measurements.length;

    }

    /**
     * 最大誤差
     */
    maxError(x, z) {

        let max = 0;

        for (const m of this.measurements) {

            const error =
                this.measurementError(
                    m,
                    x,
                    z
                );

            if (error > max) {

                max = error;

            }

        }

        return max;

    }

    /**
     * 重み付き誤差
     */
    weightedError(x, z) {

        let total = 0;
        let weightSum = 0;

        for (const m of this.measurements) {

            const error =
                this.measurementError(
                    m,
                    x,
                    z
                );

            // 近い測定ほど少し重視
            const weight =
                1 / Math.max(
                    m.distance,
                    1
                );

            total += error * weight;

            weightSum += weight;

        }

        return total / weightSum;

    }

    /**
     * 探索範囲取得
     */
    getBounds() {

        let minX = Infinity;
        let maxX = -Infinity;

        let minZ = Infinity;
        let maxZ = -Infinity;

        for (const m of this.measurements) {

            minX = Math.min(
                minX,
                m.x - m.distance
            );

            maxX = Math.max(
                maxX,
                m.x + m.distance
            );

            minZ = Math.min(
                minZ,
                m.z - m.distance
            );

            maxZ = Math.max(
                maxZ,
                m.z + m.distance
            );

        }

        return {
            minX,
            maxX,
            minZ,
            maxZ
        };

    }

        /**
     * 指定範囲を探索する
     * @param {number} minX
     * @param {number} maxX
     * @param {number} minZ
     * @param {number} maxZ
     * @param {number} step
     * @returns {{x:number,z:number,error:number}}
     */
    searchArea(minX, maxX, minZ, maxZ, step) {

        const candidates = [];

        for (let x = minX; x <= maxX; x += step) {

            for (let z = minZ; z <= maxZ; z += step) {

                const error = this.weightedError(x, z);

candidates.push({

    x,

    z,

    error

});

            }

        }

        candidates.sort(

    (a, b) => a.error - b.error

);

// 上位1000件だけ保持
return candidates.slice(0, 1000);

    }

    /**
     * 100m探索
     */
    coarseSearch() {

        const b = this.getBounds();

        return this.searchArea(
            b.minX,
            b.maxX,
            b.minZ,
            b.maxZ,
            100
        )[0];

    }

    /**
     * 20m探索
     */
    mediumSearch() {

        const coarse = this.coarseSearch();

        return this.searchArea(
            coarse.x - 100,
            coarse.x + 100,
            coarse.z - 100,
            coarse.z + 100,
            20
        )[0];

    }

    /**
     * 5m探索
     */
    fineSearch() {

        const medium = this.mediumSearch();

        return this.searchArea(
            medium.x - 20,
            medium.x + 20,
            medium.z - 20,
            medium.z + 20,
            5
        )[0];

    }

    /**
     * 1m探索
     */
    finalSearch() {

        const fine = this.fineSearch();

        const candidates = this.searchArea(

    fine.x - 5,
    fine.x + 5,
    fine.z - 5,
    fine.z + 5,
    1

);

return {

    best: candidates[0],

    candidates

};

    }

        /**
     * 信頼度を計算する
     * @param {number} averageError
     * @param {number} maxError
     * @returns {number}
     */
    calculateConfidence(averageError, maxError) {

        // 誤差から基本スコアを計算
        let score = 100;

        score -= averageError * 8;
        score -= maxError * 2;

        // 測定回数ボーナス
        score += Math.min(this.measurements.length * 2, 10);

        // 0～100に丸める
        return Math.max(0, Math.min(100, Math.round(score)));

    }

    /**
     * 座標を推定する
     * @returns {Object}
     */
    solve() {

        const startTime = performance.now();

        // 最終探索
        const search = this.finalSearch();

const best = search.best;

        const averageError = this.averageError(best.x, best.z);
        const maxError = this.maxError(best.x, best.z);

        const confidence = this.calculateConfidence(
            averageError,
            maxError
        );

        const endTime = performance.now();

        return {
            x: best.x,
            z: best.z,
            averageError,
            maxError,
            confidence,
            searchTime: Number((endTime - startTime).toFixed(2)),
            measurements: this.measurements.length,
            candidates: search.candidates
        };

    }

}

/**
 * app.js から呼び出す関数
 * @param {Array} measurements
 * @returns {Object}
 */
function solveCoordinates(measurements) {

    const solver = new Solver(measurements);

    return solver.solve();

}
