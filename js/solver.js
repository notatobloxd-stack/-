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

        let best = {
            x: 0,
            z: 0,
            error: Infinity
        };

        for (let x = minX; x <= maxX; x += step) {

            for (let z = minZ; z <= maxZ; z += step) {

                const error = this.weightedError(x, z);

                if (error < best.error) {

                    best = {
                        x,
                        z,
                        error
                    };

                }

            }

        }

        return best;

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
        );

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
        );

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
        );

    }

    /**
     * 1m探索
     */
    finalSearch() {

        const fine = this.fineSearch();

        return this.searchArea(
            fine.x - 5,
            fine.x + 5,
            fine.z - 5,
            fine.z + 5,
            1
        );

    }
    
}
